
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

    // Get proper Alpaca broker credentials from Supabase secrets
    const alpacaApiKey = Deno.env.get("ALPACA_API_KEY");
    const alpacaSecretKey = Deno.env.get("ALPACA_SECRET_KEY");

    console.log(`=== DEBUGGING ALPACA API FOR ${cleanSymbol} ===`);
    console.log('Alpaca Broker API Key exists:', !!alpacaApiKey);
    console.log('Alpaca Broker Secret Key exists:', !!alpacaSecretKey);
    
    if (alpacaApiKey) {
      console.log('API Key first 8 chars:', alpacaApiKey.substring(0, 8) + '...');
    }

    if (!alpacaApiKey || !alpacaSecretKey) {
      console.error('ALPACA_API_KEY or ALPACA_SECRET_KEY not configured in environment');
      throw new Error('Alpaca broker API credentials not configured');
    }

    // Get current quote data from Broker API v1
    const quoteUrl = `https://broker-api.sandbox.alpaca.markets/v1/trading/accounts/data/stocks/quotes/latest?symbols=${cleanSymbol}`;
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
    
    console.log(`Quote response status for ${cleanSymbol}:`, quoteResponse.status);
    
    if (!quoteResponse.ok) {
      const errorText = await quoteResponse.text();
      console.error(`Alpaca quote API error for ${cleanSymbol}: ${quoteResponse.status} - ${errorText}`);
      throw new Error(`Quote API request failed: ${quoteResponse.status}`);
    }
    
    const quoteData = JSON.parse(await quoteResponse.text());
    console.log(`Quote data for ${cleanSymbol}:`, quoteData);

    // Get last trade data for actual trading price from Broker API v1
    const tradeUrl = `https://broker-api.sandbox.alpaca.markets/v1/trading/accounts/data/stocks/trades/latest?symbols=${cleanSymbol}`;
    console.log(`Making trade request to: ${tradeUrl}`);
    
    const tradeResponse = await fetch(tradeUrl, {
      method: 'GET',
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecretKey,
        'User-Agent': 'Mozilla/5.0 (compatible; StockApp/1.0)',
        'Accept': 'application/json',
      },
    });
    
    const tradeData = tradeResponse.ok ? JSON.parse(await tradeResponse.text()) : null;
    console.log(`Trade data for ${cleanSymbol}:`, tradeData);

    // Get previous day's closing price for proper percentage calculation from Market Data API
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const barsUrl = `https://broker-api.sandbox.alpaca.markets/v1/trading/accounts/data/stocks/bars?symbols=${cleanSymbol}&timeframe=1Day&start=${yesterdayStr}&limit=1`;
    console.log(`Making bars request to: ${barsUrl}`);
    
    const barsResponse = await fetch(barsUrl, {
      method: 'GET',
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecretKey,
        'User-Agent': 'Mozilla/5.0 (compatible; StockApp/1.0)',
        'Accept': 'application/json',
      },
    });
    
    const barsData = barsResponse.ok ? JSON.parse(await barsResponse.text()) : null;
    console.log(`Bars data for ${cleanSymbol}:`, barsData);

    // Process the data
    if (!quoteData.quotes || !quoteData.quotes[cleanSymbol]) {
      throw new Error(`No quote data available for symbol: ${cleanSymbol}`);
    }
    
    const symbolQuote = quoteData.quotes[cleanSymbol];
    const symbolTrade = tradeData?.trades?.[cleanSymbol];
    const symbolBars = barsData?.bars?.[cleanSymbol];
    
    // Get prices
    const askPrice = symbolQuote.ap || 0;
    const bidPrice = symbolQuote.bp || 0;
    const lastTradePrice = symbolTrade?.p || askPrice; // Fallback to ask if no trade data
    const previousClose = symbolBars?.[0]?.c || lastTradePrice;
    
    console.log(`Price breakdown for ${cleanSymbol}:`, {
      askPrice,
      bidPrice,
      lastTradePrice,
      previousClose
    });
    
    // Calculate real change
    const change = lastTradePrice - previousClose;
    const changePercent = previousClose !== 0 ? ((change / previousClose) * 100) : 0;
    
    const result = {
      symbol: cleanSymbol,
      price: parseFloat(lastTradePrice.toFixed(2)),
      askPrice: parseFloat(askPrice.toFixed(2)),
      bidPrice: parseFloat(bidPrice.toFixed(2)),
      previousClose: parseFloat(previousClose.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    };
    
    console.log(`Final result for ${cleanSymbol}:`, result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('=== FULL ERROR DETAILS ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: `${error.name}: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
