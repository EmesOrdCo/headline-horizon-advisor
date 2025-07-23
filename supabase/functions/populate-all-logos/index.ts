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

    // Step 3: Process stocks with intelligent retry logic
    const batchSize = 3; // Even smaller batches for better rate limiting
    const baseDelay = 2000; // 2 second base delay between batches
    const requestDelay = 500; // 500ms between individual requests
    let processed = 0;
    let inserted = 0;
    let failed = 0;
    let retryQueue: FinnhubStock[] = [];

    console.log(`⚙️ Processing in batches of ${batchSize} with ${baseDelay}ms delays and ${requestDelay}ms between requests`);

    // Helper function to fetch with retry logic
    async function fetchWithRetry(stock: FinnhubStock, retryCount = 0): Promise<{ success: boolean; logo?: string; shouldRetry?: boolean }> {
      try {
        console.log(`🔍 Fetching profile for ${stock.symbol}...`);
        
        const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${stock.symbol}&token=${finnhubApiKey}`;
        const profileResponse = await fetch(profileUrl);

        if (profileResponse.status === 429) {
          console.log(`⚠️ Rate limit hit for ${stock.symbol}, will retry later`);
          return { success: false, shouldRetry: true };
        }

        if (!profileResponse.ok) {
          console.log(`⚠️ Failed to fetch profile for ${stock.symbol}: ${profileResponse.status} ${profileResponse.statusText}`);
          return { success: false, shouldRetry: false };
        }

        const profile: FinnhubProfile = await profileResponse.json();
        
        if (profile && profile.logo && profile.logo.trim() !== '') {
          console.log(`✅ Found logo for ${stock.symbol}: ${profile.logo}`);
          return { success: true, logo: profile.logo.trim() };
        } else {
          console.log(`📭 No logo found for ${stock.symbol}`);
          return { success: false, shouldRetry: false };
        }
        
      } catch (error) {
        console.error(`💥 Error processing ${stock.symbol}:`, error);
        return { success: false, shouldRetry: retryCount < 2 }; // Allow retries for network errors
      }
    }

    // Process initial batches
    for (let i = 0; i < stocksToProcess.length; i += batchSize) {
      const batch = stocksToProcess.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(stocksToProcess.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} stocks)`);

      // Process batch with intelligent retry handling
      const batchResults = [];
      
      for (const stock of batch) {
        const result = await fetchWithRetry(stock);
        
        if (result.success && result.logo) {
          batchResults.push({
            symbol: stock.symbol,
            logo_url: result.logo
          });
        } else if (result.shouldRetry) {
          retryQueue.push(stock);
        } else {
          failed++;
        }
        
        // Delay between individual requests
        await new Promise(resolve => setTimeout(resolve, requestDelay));
      }

      // Insert valid logos into database
      if (batchResults.length > 0) {
        console.log(`💾 Inserting ${batchResults.length} logos into database...`);
        
        const { error: insertError } = await supabaseClient
          .from('company_logos')
          .insert(batchResults);

        if (insertError) {
          console.error('❌ Error inserting batch:', insertError);
          failed += batchResults.length;
        } else {
          inserted += batchResults.length;
          console.log(`✅ Successfully inserted ${batchResults.length} logos`);
        }
      }

      processed += batch.length;
      const progressPercent = Math.round((processed / stocksToProcess.length) * 100);
      
      console.log(`📊 Progress: ${processed}/${stocksToProcess.length} (${progressPercent}%) - Inserted: ${inserted}, Failed: ${failed}, Queued for retry: ${retryQueue.length}`);

      // Delay between batches to respect rate limits
      if (i + batchSize < stocksToProcess.length) {
        console.log(`⏳ Waiting ${baseDelay}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, baseDelay));
      }
    }

    // Process retry queue with exponential backoff
    if (retryQueue.length > 0) {
      console.log(`🔄 Processing ${retryQueue.length} stocks from retry queue...`);
      
      let retryDelay = 5000; // Start with 5 second delay for retries
      const maxRetryDelay = 30000; // Max 30 seconds
      
      while (retryQueue.length > 0) {
        console.log(`⏳ Waiting ${retryDelay}ms before retry batch...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        const retryBatch = retryQueue.splice(0, 2); // Even smaller retry batches
        console.log(`🔄 Retrying batch of ${retryBatch.length} stocks (${retryQueue.length} remaining)`);
        
        const retryResults = [];
        let rateLimitHit = false;
        
        for (const stock of retryBatch) {
          const result = await fetchWithRetry(stock, 1);
          
          if (result.success && result.logo) {
            retryResults.push({
              symbol: stock.symbol,
              logo_url: result.logo
            });
          } else if (result.shouldRetry) {
            console.log(`🔄 ${stock.symbol} still rate limited, will try again`);
            retryQueue.push(stock); // Put back at end of queue
            rateLimitHit = true;
          } else {
            failed++;
          }
          
          // Longer delay between retry requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Insert retry results
        if (retryResults.length > 0) {
          const { error: insertError } = await supabaseClient
            .from('company_logos')
            .insert(retryResults);

          if (insertError) {
            console.error('❌ Error inserting retry batch:', insertError);
            failed += retryResults.length;
          } else {
            inserted += retryResults.length;
            console.log(`✅ Successfully inserted ${retryResults.length} logos from retry`);
          }
        }

        // Increase delay if we hit rate limits, reset if we didn't
        if (rateLimitHit) {
          retryDelay = Math.min(retryDelay * 1.5, maxRetryDelay);
          console.log(`📈 Increasing retry delay to ${retryDelay}ms due to rate limits`);
        } else {
          retryDelay = 5000; // Reset to base delay
        }

        // Safety valve: don't retry forever
        if (retryQueue.length > 100) {
          console.log(`⚠️ Too many stocks still in retry queue (${retryQueue.length}), stopping retries`);
          failed += retryQueue.length;
          break;
        }
      }
      
      console.log(`✅ Retry processing completed. Final queue size: ${retryQueue.length}`);
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