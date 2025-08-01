import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
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
  mic: string;
  symbol: string;
  type: string;
}

interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = 'populate', batchSize = 100 } = await req.json().catch(() => ({}));
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Finnhub API key
    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnhubApiKey) {
      console.error('❌ FINNHUB_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Finnhub API key not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🚀 Starting ${action} operation with batch size: ${batchSize}`);

    // Fetch all US stocks from Finnhub with retry logic
    let allStocks: FinnhubStock[] = [];
    const maxRetries = 3;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        console.log(`📡 Fetching US stocks from Finnhub (attempt ${retries + 1}/${maxRetries})...`);
        const stocksResponse = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${finnhubApiKey}`);
        
        if (!stocksResponse.ok) {
          if (stocksResponse.status === 429) {
            console.log('⏳ Rate limited by Finnhub, waiting 60 seconds...');
            await new Promise(resolve => setTimeout(resolve, 60000));
            retries++;
            continue;
          }
          throw new Error(`Finnhub stocks API returned ${stocksResponse.status}: ${stocksResponse.statusText}`);
        }
        
        allStocks = await stocksResponse.json();
        console.log(`✅ Fetched ${allStocks.length} stocks from Finnhub`);
        break;
      } catch (error) {
        retries++;
        console.error(`❌ Attempt ${retries} failed:`, error);
        if (retries >= maxRetries) {
          throw new Error(`Failed to fetch stocks after ${maxRetries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 5000 * retries));
      }
    }

    // Filter for common stocks only
    const validStocks = allStocks.filter(stock => 
      stock.type === 'Common Stock' && 
      stock.symbol && 
      !stock.symbol.includes('.') &&
      stock.symbol.length <= 5
    );

    console.log(`🔍 Filtered to ${validStocks.length} valid common stocks`);

    // Check existing logos in database
    const { data: existingLogos, error: existingError } = await supabase
      .from('company_logos')
      .select('symbol');

    if (existingError) {
      console.error('❌ Error fetching existing logos:', existingError);
      throw existingError;
    }

    const existingSymbols = new Set(existingLogos?.map(logo => logo.symbol) || []);
    const stocksNeedingLogos = validStocks.filter(stock => !existingSymbols.has(stock.symbol));

    console.log(`📊 Found ${existingLogos?.length || 0} existing logos, ${stocksNeedingLogos.length} stocks need logos`);

    // If action is 'status', return summary
    if (action === 'status') {
      return new Response(
        JSON.stringify({
          success: true,
          totalStocksFound: allStocks.length,
          validStocksFiltered: validStocks.length,
          existingLogos: existingLogos?.length || 0,
          stocksNeedingLogos: stocksNeedingLogos.length,
          nextBatchSize: Math.min(batchSize, stocksNeedingLogos.length)
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process stocks in batches
    const stocksToProcess = stocksNeedingLogos.slice(0, batchSize);
    console.log(`⚙️ Processing ${stocksToProcess.length} stocks in this batch`);

    if (stocksToProcess.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'All stocks already have logos',
          totalStocksFound: allStocks.length,
          validStocksFiltered: validStocks.length,
          stocksProcessed: 0,
          logosInserted: 0,
          logosFailed: 0,
          existingLogos: existingLogos?.length || 0,
          remainingStocks: 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const results = [];
    const failed = [];
    const rateLimited = [];
    
    // Process each stock
    for (let i = 0; i < stocksToProcess.length; i++) {
      const stock = stocksToProcess[i];
      console.log(`📈 Processing ${stock.symbol} (${i + 1}/${stocksToProcess.length})`);

      try {
        // Fetch company profile with retries
        let profileRetries = 0;
        let profileData: FinnhubProfile | null = null;
        
        while (profileRetries < 3) {
          try {
            const profileResponse = await fetch(
              `https://finnhub.io/api/v1/stock/profile2?symbol=${stock.symbol}&token=${finnhubApiKey}`
            );
            
            if (!profileResponse.ok) {
              if (profileResponse.status === 429) {
                console.log(`⏳ Rate limited for ${stock.symbol}, will retry later`);
                rateLimited.push(stock.symbol);
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
              }
              throw new Error(`Profile API returned ${profileResponse.status}`);
            }
            
            profileData = await profileResponse.json();
            break;
          } catch (error) {
            profileRetries++;
            console.error(`❌ Profile attempt ${profileRetries} failed for ${stock.symbol}:`, error);
            if (profileRetries >= 3) {
              failed.push(stock.symbol);
              break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * profileRetries));
          }
        }

        if (profileData && profileData.logo && profileData.name) {
          results.push({
            symbol: stock.symbol,
            name: profileData.name,
            logo_url: profileData.logo
          });
        } else {
          console.log(`⚠️ No logo/name found for ${stock.symbol}`);
          failed.push(stock.symbol);
        }

        // Add delay between requests to avoid rate limiting
        if (i < stocksToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

      } catch (error) {
        console.error(`❌ Error processing ${stock.symbol}:`, error);
        failed.push(stock.symbol);
      }
    }

    // Insert logos into database
    let insertedCount = 0;
    if (results.length > 0) {
      console.log(`💾 Inserting ${results.length} logos into database...`);
      
      try {
        // Try bulk insert first
        const { data: insertedData, error: insertError } = await supabase
          .from('company_logos')
          .insert(results)
          .select();

        if (insertError) {
          console.error('❌ Bulk insert failed, trying individual inserts:', insertError);
          
          // Fall back to individual inserts
          for (const logo of results) {
            try {
              const { error: singleError } = await supabase
                .from('company_logos')
                .upsert(logo);
              
              if (!singleError) {
                insertedCount++;
              } else {
                console.error(`❌ Failed to insert ${logo.symbol}:`, singleError);
                failed.push(logo.symbol);
              }
            } catch (error) {
              console.error(`❌ Error inserting ${logo.symbol}:`, error);
              failed.push(logo.symbol);
            }
          }
        } else {
          insertedCount = insertedData?.length || 0;
          console.log(`✅ Successfully inserted ${insertedCount} logos`);
        }
      } catch (error) {
        console.error('❌ Database insert error:', error);
        throw error;
      }
    }

    // Handle rate-limited stocks in background if any
    if (rateLimited.length > 0) {
      console.log(`⏳ ${rateLimited.length} stocks were rate-limited, processing in background...`);
      
      EdgeRuntime.waitUntil(
        (async () => {
          await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
          
          for (const symbol of rateLimited) {
            try {
              const profileResponse = await fetch(
                `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${finnhubApiKey}`
              );
              
              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                if (profileData.logo && profileData.name) {
                  await supabase
                    .from('company_logos')
                    .upsert({
                      symbol,
                      name: profileData.name,
                      logo_url: profileData.logo
                    });
                  console.log(`✅ Background processed: ${symbol}`);
                }
              }
            } catch (error) {
              console.error(`❌ Background processing failed for ${symbol}:`, error);
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        })()
      );
    }

    const response = {
      success: true,
      totalStocksFound: allStocks.length,
      validStocksFiltered: validStocks.length,
      stocksProcessed: stocksToProcess.length,
      logosInserted: insertedCount,
      logosFailed: failed.length,
      existingLogos: existingLogos?.length || 0,
      remainingStocks: stocksNeedingLogos.length - stocksToProcess.length,
      rateLimitedStocks: rateLimited.length,
      batchSize,
      failedSymbols: failed.length > 0 ? failed.slice(0, 10) : undefined // Only include first 10 failed symbols
    };

    console.log('🎯 Final results:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('💥 Critical error in populate-all-logos:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});