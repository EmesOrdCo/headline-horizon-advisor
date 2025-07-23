import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinnhubStock {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  isin?: string;
  mic: string;
  shareClassFIGI: string;
  symbol: string;
  symbol2?: string;
  type: string;
}

interface FinnhubProfile {
  country?: string;
  currency?: string;
  exchange?: string;
  finnhubIndustry?: string;
  ipo?: string;
  logo?: string;
  marketCapitalization?: number;
  name?: string;
  phone?: string;
  shareOutstanding?: number;
  ticker?: string;
  weburl?: string;
}

Deno.serve(async (req) => {
  console.log('🚀 Populate-all-logos function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔑 Initializing Supabase client...');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnhubApiKey) {
      console.error('❌ FINNHUB_API_KEY not found in environment');
      throw new Error('FINNHUB_API_KEY not found');
    }
    console.log('✅ FINNHUB_API_KEY found');

    console.log('📊 Starting bulk logo population process...');

    // Step 1: Get all US stocks from Finnhub
    console.log('📈 Fetching all US stock symbols from Finnhub...');
    const stocksUrl = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${finnhubApiKey}`;
    console.log('🌐 Making request to:', stocksUrl.replace(finnhubApiKey, 'HIDDEN'));
    
    const stocksResponse = await fetch(stocksUrl);
    console.log('📡 Stock symbols response status:', stocksResponse.status);

    if (!stocksResponse.ok) {
      const errorText = await stocksResponse.text();
      console.error('❌ Failed to fetch stock symbols:', stocksResponse.statusText, errorText);
      throw new Error(`Failed to fetch stock symbols: ${stocksResponse.statusText} - ${errorText}`);
    }

    const allStocks: FinnhubStock[] = await stocksResponse.json();
    console.log(`✅ Found ${allStocks.length} total US stocks from Finnhub`);

    // Filter for common stocks and remove duplicates
    const validStocks = allStocks.filter(stock => 
      stock.type === 'Common Stock' && 
      stock.symbol && 
      !stock.symbol.includes('.') && // Remove stocks with dots (usually preferred shares)
      stock.symbol.length <= 5 && // Typical stock symbol length
      stock.symbol.match(/^[A-Z]+$/) // Only letters, no numbers or special chars
    );

    console.log(`✅ Filtered to ${validStocks.length} valid common stocks`);

    // Step 2: Check which logos we already have
    console.log('🔍 Checking existing logos in database...');
    const { data: existingLogos, error: selectError } = await supabaseClient
      .from('company_logos')
      .select('symbol');

    if (selectError) {
      console.error('❌ Error querying existing logos:', selectError);
      throw selectError;
    }

    const existingSymbols = new Set(existingLogos?.map(logo => logo.symbol) || []);
    const stocksToProcess = validStocks.filter(stock => !existingSymbols.has(stock.symbol));

    console.log(`📋 Database has ${existingLogos?.length || 0} existing logos`);
    console.log(`🎯 Need to process ${stocksToProcess.length} new stocks`);

    if (stocksToProcess.length === 0) {
      console.log('✅ All stocks already have logos, nothing to do!');
      return new Response(JSON.stringify({
        success: true,
        message: 'All stocks already have logos',
        totalStocksFound: allStocks.length,
        validStocksFiltered: validStocks.length,
        stocksProcessed: 0,
        logosInserted: 0,
        existingLogos: existingLogos?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Process stocks in smaller batches to avoid rate limits
    const batchSize = 5; // Smaller batches for reliability
    const delay = 1000; // 1 second delay between batches
    let processed = 0;
    let inserted = 0;
    let failed = 0;

    console.log(`⚙️ Processing in batches of ${batchSize} with ${delay}ms delays`);

    for (let i = 0; i < stocksToProcess.length; i += batchSize) {
      const batch = stocksToProcess.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(stocksToProcess.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} stocks)`);

      // Process batch with error handling for each stock
      const batchResults = [];
      
      for (const stock of batch) {
        try {
          console.log(`🔍 Fetching profile for ${stock.symbol}...`);
          
          const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${stock.symbol}&token=${finnhubApiKey}`;
          const profileResponse = await fetch(profileUrl);

          if (!profileResponse.ok) {
            console.log(`⚠️ Failed to fetch profile for ${stock.symbol}: ${profileResponse.status} ${profileResponse.statusText}`);
            failed++;
            continue;
          }

          const profile: FinnhubProfile = await profileResponse.json();
          
          if (profile && profile.logo && profile.logo.trim() !== '') {
            console.log(`✅ Found logo for ${stock.symbol}: ${profile.logo}`);
            batchResults.push({
              symbol: stock.symbol,
              logo_url: profile.logo.trim()
            });
          } else {
            console.log(`📭 No logo found for ${stock.symbol}`);
            failed++;
          }
          
          // Small delay between individual requests within batch
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`💥 Error processing ${stock.symbol}:`, error);
          failed++;
        }
      }

      // Insert valid logos into database
      if (batchResults.length > 0) {
        console.log(`💾 Inserting ${batchResults.length} logos into database...`);
        
        const { error: insertError } = await supabaseClient
          .from('company_logos')
          .insert(batchResults);

        if (insertError) {
          console.error('❌ Error inserting batch:', insertError);
          // Don't throw here, continue with next batch
          failed += batchResults.length;
        } else {
          inserted += batchResults.length;
          console.log(`✅ Successfully inserted ${batchResults.length} logos`);
        }
      }

      processed += batch.length;
      const progressPercent = Math.round((processed / stocksToProcess.length) * 100);
      
      console.log(`📊 Progress: ${processed}/${stocksToProcess.length} (${progressPercent}%) - Inserted: ${inserted}, Failed: ${failed}`);

      // Delay between batches to respect rate limits
      if (i + batchSize < stocksToProcess.length) {
        console.log(`⏳ Waiting ${delay}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const result = {
      success: true,
      totalStocksFound: allStocks.length,
      validStocksFiltered: validStocks.length,
      stocksProcessed: processed,
      logosInserted: inserted,
      logosFailed: failed,
      existingLogos: existingLogos?.length || 0
    };

    console.log('🎉 Bulk logo population completed successfully!');
    console.log('📊 Final results:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Critical error in populate-all-logos function:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});