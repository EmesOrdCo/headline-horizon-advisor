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
    // Parse request body to get batch size and action
    const requestBody = await req.json();
    const action = requestBody?.action || 'populate';
    const batchSize = requestBody?.batchSize || 100; // Default to 100 if not specified
    console.log(`🎯 Action: ${action}`);
    console.log(`📦 Batch size set to: ${batchSize}`);

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

    console.log(`📊 Starting batch logo population process (${batchSize} symbols)...`);

    // Step 1: Get all US stocks from Finnhub with retry logic
    console.log('📈 Fetching all US stock symbols from Finnhub...');
    const stocksUrl = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${finnhubApiKey}`;
    console.log('🌐 Making request to:', stocksUrl.replace(finnhubApiKey, 'HIDDEN'));
    
    let stocksResponse;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        stocksResponse = await fetch(stocksUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'LogoPopulator/1.0',
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        console.log('📡 Stock symbols response status:', stocksResponse.status);
        
        if (stocksResponse.ok) {
          break; // Success, exit retry loop
        } else if (stocksResponse.status === 522 || stocksResponse.status >= 500) {
          // Server error, retry
          retryCount++;
          console.log(`⚠️ Server error (${stocksResponse.status}), retrying... (${retryCount}/${maxRetries})`);
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 5000 * retryCount)); // Exponential backoff
            continue;
          }
        } else {
          // Client error, don't retry
          break;
        }
      } catch (error) {
        retryCount++;
        console.log(`⚠️ Network error: ${error.message}, retrying... (${retryCount}/${maxRetries})`);
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 5000 * retryCount)); // Exponential backoff
          continue;
        }
        throw error;
      }
    }

    if (!stocksResponse.ok) {
      const errorText = await stocksResponse.text();
      console.error('❌ Failed to fetch stock symbols after retries:', stocksResponse.statusText, errorText);
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
    const allStocksToProcess = validStocks.filter(stock => !existingSymbols.has(stock.symbol));
    
    // Limit to batch size
    const stocksToProcess = allStocksToProcess.slice(0, batchSize);

    console.log(`📋 Database has ${existingLogos?.length || 0} existing logos`);
    console.log(`🎯 Total stocks needing logos: ${allStocksToProcess.length}`);
    
    // If this is just a status check, return early
    if (action === 'status') {
      console.log('📊 Status check requested - returning current state');
      return new Response(JSON.stringify({
        success: true,
        message: 'Status check complete',
        totalStocksFound: allStocks.length,
        validStocksFiltered: validStocks.length,
        existingLogos: existingLogos?.length || 0,
        stocksNeedingLogos: allStocksToProcess.length,
        nextBatchSize: Math.min(batchSize, allStocksToProcess.length)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`📦 Processing batch of ${stocksToProcess.length} stocks`);

    if (stocksToProcess.length === 0) {
      console.log('✅ All stocks already have logos, nothing to do!');
      return new Response(JSON.stringify({
        success: true,
        message: 'All stocks already have logos',
        totalStocksFound: allStocks.length,
        validStocksFiltered: validStocks.length,
        stocksProcessed: 0,
        logosInserted: 0,
        existingLogos: existingLogos?.length || 0,
        remainingStocks: 0,
        batchSize
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Optimized processing with robust error handling
    const RATE_LIMIT = 100; // 100ms between requests (10 requests/second, 600/minute burst allowed)
    const BATCH_INSERT_SIZE = 200; // Larger batches for better database performance
    const NETWORK_TIMEOUT = 15000; // 15 second timeout for network requests
    const MAX_CONSECUTIVE_FAILURES = 15; // Stop if too many consecutive failures
    const UPSERT_BATCH_SIZE = 50; // Smaller upsert batches to avoid conflicts
    
    let processed = 0;
    let inserted = 0;
    let failed = 0;
    let consecutiveFailures = 0;
    let logoQueue: Array<{ symbol: string; logo_url: string; name?: string }> = [];
    let nameQueue: Array<{ symbol: string; name: string }> = [];

    console.log(`⚙️ Processing with strict rate limiting: 1 request per ${RATE_LIMIT}ms`);
    console.log(`📊 Will process ${stocksToProcess.length} stocks in this batch (estimated time: ${Math.round((stocksToProcess.length * RATE_LIMIT) / 1000 / 60)} minutes)`);
    console.log(`📈 ${allStocksToProcess.length - stocksToProcess.length} stocks will remain for future batches`);

    // Queues for managing stocks
    let retryQueue: FinnhubStock[] = [];
    let rateLimitedStocks: FinnhubStock[] = [];

    // Enhanced processing function with timeout and robust error handling
    async function processStockWithRateLimit(stock: FinnhubStock, isRetry = false): Promise<{ success: boolean; logo?: string; name?: string; error?: string }> {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);
      
      try {
        console.log(`🔍 Fetching profile for ${stock.symbol}${isRetry ? ' (retry)' : ''}...`);
        
        const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${stock.symbol}&token=${finnhubApiKey}`;
        const profileResponse = await fetch(profileUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'LogoPopulator/1.0',
            'Accept': 'application/json'
          }
        });

        clearTimeout(timeoutId);

        if (profileResponse.status === 429) {
          console.log(`⚠️ Rate limit hit for ${stock.symbol} - adding to retry queue`);
          if (!rateLimitedStocks.some(s => s.symbol === stock.symbol)) {
            rateLimitedStocks.push(stock);
          }
          return { success: false, error: 'rate_limit' };
        }

        if (!profileResponse.ok) {
          console.log(`❌ Failed to fetch profile for ${stock.symbol}: ${profileResponse.status} ${profileResponse.statusText}`);
          return { success: false, error: `${profileResponse.status}: ${profileResponse.statusText}` };
        }

        const profile: FinnhubProfile = await profileResponse.json();
        
        const hasLogo = profile && profile.logo && profile.logo.trim() !== '';
        const hasName = profile && profile.name && profile.name.trim() !== '';
        
        if (hasLogo || hasName) {
          const result: any = { success: true };
          if (hasLogo) {
            result.logo = profile.logo.trim();
            console.log(`✅ Found logo for ${stock.symbol}: ${profile.logo}`);
          }
          if (hasName) {
            result.name = profile.name.trim();
            console.log(`📝 Found name for ${stock.symbol}: ${profile.name}`);
          }
          return result;
        } else {
          console.log(`📭 No logo or name found for ${stock.symbol}`);
          return { success: false, error: 'no_data' };
        }
        
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.error(`⏰ Timeout fetching ${stock.symbol}`);
          return { success: false, error: 'timeout' };
        }
        console.error(`💥 Error processing ${stock.symbol}:`, error);
        return { success: false, error: error.message };
      }
    }

    // Robust database insert with upsert and fallback
    async function insertLogosRobustly(logos: Array<{ symbol: string; logo_url: string; name?: string }>) {
      if (logos.length === 0) return true;
      
      try {
        // Try upsert first (handles duplicates gracefully)
        console.log(`💾 Upserting batch of ${logos.length} logos...`);
        const { error: upsertError } = await supabaseClient
          .from('company_logos')
          .upsert(logos, { onConflict: 'symbol' });

        if (!upsertError) {
          console.log(`✅ Successfully upserted ${logos.length} logos`);
          return true;
        }

        console.log(`⚠️ Upsert failed, trying individual inserts:`, upsertError);
        
        // Fallback: insert individually to skip duplicates
        let successCount = 0;
        for (const logo of logos) {
          try {
            const { error: individualError } = await supabaseClient
              .from('company_logos')
              .insert([logo]);
            
            if (!individualError) {
              successCount++;
            } else if (!individualError.message.includes('duplicate key')) {
              console.error(`❌ Failed to insert ${logo.symbol}:`, individualError);
            }
          } catch (e) {
            console.error(`❌ Individual insert failed for ${logo.symbol}:`, e);
          }
        }
        
        console.log(`✅ Individual inserts: ${successCount}/${logos.length} successful`);
        return successCount > 0;
        
      } catch (error) {
        console.error('❌ Critical database error:', error);
        return false;
      }
    }

    // Background task to handle rate-limited stocks
    async function processRateLimitedStocks() {
      if (rateLimitedStocks.length === 0) return;
      
      console.log(`🔄 Processing ${rateLimitedStocks.length} rate-limited stocks with exponential backoff...`);
      
      let retryDelay = 10000; // Start with 10 seconds for rate limits
      const maxRetries = 5; // More retries for overnight operation
      
      for (let attempt = 1; attempt <= maxRetries && rateLimitedStocks.length > 0; attempt++) {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} for ${rateLimitedStocks.length} stocks`);
        
        const stocksToRetry = [...rateLimitedStocks];
        rateLimitedStocks = []; // Clear the queue
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        let retryLogoQueue: Array<{ symbol: string; logo_url: string; name?: string }> = [];
        
        for (const stock of stocksToRetry) {
          const result = await processStockWithRateLimit(stock, true);
          
          if (result.success && result.logo) {
            const logoEntry: any = { 
              symbol: stock.symbol,
              logo_url: result.logo
            };
            if (result.name) logoEntry.name = result.name;
            
            retryLogoQueue.push(logoEntry);
          } else if (result.error === 'rate_limit') {
            // Still rate limited, will be retried in next attempt
            console.log(`⚠️ ${stock.symbol} still rate limited on attempt ${attempt}`);
          } else {
            failed++;
          }
          
          // Delay between retry requests
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Insert any logos found in this retry batch
        if (retryLogoQueue.length > 0) {
          await insertLogosRobustly(retryLogoQueue);
          inserted += retryLogoQueue.length;
        }
        
        retryDelay = Math.min(retryDelay * 1.5, 60000); // Cap at 1 minute
      }
      
      if (rateLimitedStocks.length > 0) {
        console.log(`⚠️ ${rateLimitedStocks.length} stocks still rate limited after ${maxRetries} attempts`);
      }
    }

    // Process stocks with optimized batching and error recovery
    for (let i = 0; i < stocksToProcess.length; i++) {
      const stock = stocksToProcess[i];
      
      // Check for too many consecutive failures (circuit breaker)
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        console.error(`🛑 Too many consecutive failures (${consecutiveFailures}), stopping batch to prevent resource waste`);
        break;
      }
      
      // Process the stock
      const result = await processStockWithRateLimit(stock);
      
      if (result.success && result.logo) {
        const logoEntry: any = { 
          symbol: stock.symbol,
          logo_url: result.logo
        };
        if (result.name) logoEntry.name = result.name;
        
        logoQueue.push(logoEntry);
        consecutiveFailures = 0; // Reset failure counter on success
      } else if (result.error !== 'rate_limit') {
        failed++;
        consecutiveFailures++;
      }
      
      processed++;
      
      // Insert logos in batches with robust error handling
      if (logoQueue.length >= BATCH_INSERT_SIZE || i === stocksToProcess.length - 1) {
        if (logoQueue.length > 0) {
          const batchSuccess = await insertLogosRobustly([...logoQueue]);
          if (batchSuccess) {
            inserted += logoQueue.length;
          } else {
            failed += logoQueue.length;
          }
          logoQueue = []; // Clear the queue
        }
      }
      
      // Progress reporting every 25 stocks for better monitoring
      if (processed % 25 === 0 || i === stocksToProcess.length - 1) {
        const progressPercent = Math.round((processed / stocksToProcess.length) * 100);
        const remainingStocks = stocksToProcess.length - processed;
        const estimatedTimeMinutes = Math.round((remainingStocks * RATE_LIMIT) / 1000 / 60);
        
        console.log(`📊 Progress: ${processed}/${stocksToProcess.length} (${progressPercent}%) - Inserted: ${inserted}, Failed: ${failed}, Consecutive Failures: ${consecutiveFailures}`);
        console.log(`⏰ Estimated time remaining: ${estimatedTimeMinutes} minutes`);
        
        // Auto-recovery: If we're hitting too many failures, slow down
        if (consecutiveFailures > 5) {
          console.log(`⚠️ High failure rate detected, implementing adaptive rate limiting`);
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT * 3));
        }
      }

      // Adaptive rate limiting based on success/failure
      const dynamicDelay = consecutiveFailures > 3 ? RATE_LIMIT * 2 : RATE_LIMIT;
      if (i < stocksToProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, dynamicDelay));
      }
    }

    // Send immediate response to prevent timeout
    const remainingStocks = allStocksToProcess.length - stocksToProcess.length;
    
    const result = {
      success: true,
      totalStocksFound: allStocks.length,
      validStocksFiltered: validStocks.length,
      stocksProcessed: processed,
      logosInserted: inserted,
      logosFailed: failed,
      existingLogos: existingLogos?.length || 0,
      remainingStocks,
      batchSize,
      rateLimitedStocks: rateLimitedStocks.length,
      message: remainingStocks > 0 ? `Batch complete. ${remainingStocks} stocks remaining for future batches.` : 'All stocks processed!'
    };

    console.log(`🎉 Batch logo population completed successfully! (${remainingStocks} stocks remaining)`);
    console.log('📊 Final results:', result);

    // Handle rate-limited stocks in background
    if (rateLimitedStocks.length > 0) {
      console.log(`🔄 Starting background processing for ${rateLimitedStocks.length} rate-limited stocks`);
      
      // Use EdgeRuntime.waitUntil for background processing
      if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
        EdgeRuntime.waitUntil(processRateLimitedStocks());
      } else {
        // Fallback for environments without EdgeRuntime
        processRateLimitedStocks().catch(error => {
          console.error('❌ Background processing failed:', error);
        });
      }
    }

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