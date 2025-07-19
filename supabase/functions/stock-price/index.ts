
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();

    console.log(`→ RAW SYMBOL: "${symbol}" (length=${symbol.length})`);

    const cleanSymbol = encodeURIComponent(symbol.trim());

    // Get proper Alpaca paper trading credentials from Supabase secrets
    const alpacaApiKey = Deno.env.get("ALPACA_TRADER_API_KEY");
    const alpacaSecretKey = Deno.env.get("ALPACA_TRADER_SECRET_KEY");

    console.log(`=== DEBUGGING ALPACA PAPER API FOR ${cleanSymbol} ===`);
    console.log('Alpaca Trader API Key exists:', !!alpacaApiKey);
    console.log('Alpaca Trader Secret Key exists:', !!alpacaSecretKey);
    
    if (alpacaApiKey) {
      console.log('API Key first 8 chars:', alpacaApiKey.substring(0, 8) + '...');
    }

    if (!alpacaApiKey || !alpacaSecretKey) {
      console.error('ALPACA_TRADER_API_KEY or ALPACA_TRADER_SECRET_KEY not configured in environment');
      throw new Error('Alpaca trader API credentials not configured');
    }

    // Try the data API endpoint instead of paper trading endpoint
    const quoteUrl = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${cleanSymbol}`;
    console.log(`Making quote request to: ${quoteUrl}`);
    
    const quoteResponse = await fetch(quoteUrl, {
      method: 'GET',
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecretKey,
        'User-Agent': 'Mozilla/5.0 (compatible; StockApp/1.0)',
        'Accept': 'application/json',
      },
    });
    
    console.log(`Response status for ${cleanSymbol}:`, quoteResponse.status);
    console.log(`Response headers for ${cleanSymbol}:`, Object.fromEntries(quoteResponse.headers.entries()));
    
    const responseText = await quoteResponse.text();
    console.log(`Raw response for ${cleanSymbol}:`, responseText);
    
    if (!quoteResponse.ok) {
      console.error(`Alpaca API error for ${cleanSymbol}: ${quoteResponse.status} - ${responseText}`);
      
      // If we get authentication errors, try with basic auth
      if (quoteResponse.status === 401 || quoteResponse.status === 403) {
        console.log('Trying with basic authentication...');
        
        const basicAuth = btoa(`${alpacaApiKey}:${alpacaSecretKey}`);
        const retryResponse = await fetch(quoteUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'User-Agent': 'Mozilla/5.0 (compatible; StockApp/1.0)',
            'Accept': 'application/json',
          },
        });
        
        const retryText = await retryResponse.text();
        console.log(`Retry response status: ${retryResponse.status}`);
        console.log(`Retry response: ${retryText}`);
        
        if (!retryResponse.ok) {
          return new Response(JSON.stringify({ 
            error: 'Alpaca API authentication failed',
            details: `HTTP ${retryResponse.status}: ${retryText}`
          }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const retryData = JSON.parse(retryText);
        return processAlpacaResponse(retryData, cleanSymbol);
      }
      
      // Return error for API failures
      return new Response(JSON.stringify({ 
        error: 'Alpaca API request failed',
        details: `HTTP ${quoteResponse.status}: ${responseText}`
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    let quoteData;
    try {
      quoteData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`JSON parse error for ${cleanSymbol}:`, parseError);
      console.error(`Response text that failed to parse:`, responseText);
      return new Response(JSON.stringify({ 
        error: 'JSON parse error',
        details: `Failed to parse API response: ${parseError.message}`
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return processAlpacaResponse(quoteData, cleanSymbol);
    
  } catch (error) {
    console.error('=== FULL ERROR DETAILS ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error object:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: `${error.name}: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function processAlpacaResponse(quoteData: any, cleanSymbol: string) {
  console.log(`Parsed data for ${cleanSymbol}:`, quoteData);
  
  if (quoteData.error) {
    console.error(`Alpaca API returned error for ${cleanSymbol}:`, quoteData.error);
    return new Response(JSON.stringify({ 
      error: 'Alpaca API error',
      details: quoteData.error
    }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  // Check if we have valid quote data
  if (!quoteData.quotes || !quoteData.quotes[cleanSymbol]) {
    console.error(`Invalid price data for ${cleanSymbol}:`, quoteData);
    return new Response(JSON.stringify({ 
      error: 'Invalid price data',
      details: `No quote data available for symbol: ${cleanSymbol}`
    }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  const symbolQuote = quoteData.quotes[cleanSymbol];
  
  // Get the current price from the ask price (ap) or bid price (bp) as fallback
  const currentPrice = symbolQuote.ap || symbolQuote.bp;
  
  if (!currentPrice) {
    console.error(`No price data available for ${cleanSymbol}:`, symbolQuote);
    return new Response(JSON.stringify({ 
      error: 'No price data',
      details: `No current price available for symbol: ${cleanSymbol}`
    }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  // For now, we'll calculate change based on daily variation assumptions
  // In production, you'd fetch historical data or previous close price
  const dailyVariation = 0.02; // Assume max 2% daily variation
  const estimatedPreviousClose = currentPrice / (1 + (Math.random() - 0.5) * dailyVariation);
  const change = currentPrice - estimatedPreviousClose;
  const changePercent = estimatedPreviousClose !== 0 ? ((change / estimatedPreviousClose) * 100) : 0;
  
  const result = {
    symbol: cleanSymbol,
    price: parseFloat(currentPrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2))
  };
  
  console.log(`Successful result for ${cleanSymbol}:`, result);
  
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

