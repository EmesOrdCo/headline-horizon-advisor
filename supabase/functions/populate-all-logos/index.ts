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
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnhubApiKey) {
      throw new Error('FINNHUB_API_KEY not found');
    }

    console.log('Starting bulk logo population process...');

    // Step 1: Get all US stocks from Finnhub
    console.log('Fetching all US stock symbols from Finnhub...');
    const stocksResponse = await fetch(
      `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${finnhubApiKey}`
    );

    if (!stocksResponse.ok) {
      throw new Error(`Failed to fetch stock symbols: ${stocksResponse.statusText}`);
    }

    const allStocks: FinnhubStock[] = await stocksResponse.json();
    console.log(`Found ${allStocks.length} US stocks`);

    // Filter for common stocks and remove duplicates
    const validStocks = allStocks.filter(stock => 
      stock.type === 'Common Stock' && 
      stock.symbol && 
      !stock.symbol.includes('.') && // Remove stocks with dots (usually preferred shares)
      stock.symbol.length <= 5 // Typical stock symbol length
    );

    console.log(`Filtered to ${validStocks.length} valid stocks`);

    // Step 2: Check which logos we already have
    const { data: existingLogos } = await supabaseClient
      .from('company_logos')
      .select('symbol');

    const existingSymbols = new Set(existingLogos?.map(logo => logo.symbol) || []);
    const stocksToProcess = validStocks.filter(stock => !existingSymbols.has(stock.symbol));

    console.log(`Need to process ${stocksToProcess.length} new stocks`);

    // Step 3: Process stocks in batches to avoid rate limits
    const batchSize = 10; // Process 10 stocks at a time
    const delay = 500; // 500ms delay between batches to respect rate limits
    let processed = 0;
    let inserted = 0;

    for (let i = 0; i < stocksToProcess.length; i += batchSize) {
      const batch = stocksToProcess.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(stocksToProcess.length / batchSize)}`);

      // Process batch in parallel
      const batchPromises = batch.map(async (stock) => {
        try {
          // Fetch company profile to get logo
          const profileResponse = await fetch(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${stock.symbol}&token=${finnhubApiKey}`
          );

          if (!profileResponse.ok) {
            console.log(`Failed to fetch profile for ${stock.symbol}: ${profileResponse.statusText}`);
            return null;
          }

          const profile: FinnhubProfile = await profileResponse.json();
          
          if (profile.logo && profile.logo.trim() !== '') {
            console.log(`Found logo for ${stock.symbol}: ${profile.logo}`);
            return {
              symbol: stock.symbol,
              logo_url: profile.logo
            };
          } else {
            console.log(`No logo found for ${stock.symbol}`);
            return null;
          }
        } catch (error) {
          console.log(`Error processing ${stock.symbol}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validLogos = batchResults.filter(result => result !== null);

      // Insert valid logos into database
      if (validLogos.length > 0) {
        const { error: insertError } = await supabaseClient
          .from('company_logos')
          .insert(validLogos);

        if (insertError) {
          console.error('Error inserting batch:', insertError);
        } else {
          inserted += validLogos.length;
          console.log(`Inserted ${validLogos.length} logos from this batch`);
        }
      }

      processed += batch.length;
      console.log(`Progress: ${processed}/${stocksToProcess.length} processed, ${inserted} logos inserted`);

      // Delay between batches to respect rate limits
      if (i + batchSize < stocksToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const result = {
      success: true,
      totalStocksFound: allStocks.length,
      validStocksFiltered: validStocks.length,
      stocksProcessed: processed,
      logosInserted: inserted,
      existingLogos: existingLogos?.length || 0
    };

    console.log('Bulk logo population completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in populate-all-logos function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});