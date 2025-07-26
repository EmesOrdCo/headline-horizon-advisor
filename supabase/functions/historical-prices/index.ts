
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
    const { symbol, timeframe = '1Day', limit = 30 } = await req.json();

    console.log(`Fetching historical data for ${symbol} with timeframe ${timeframe} and limit ${limit}`);

    // Map timeframes to Alpaca API format
    const timeframeMap: Record<string, string> = {
      '1Minute': '1Min',
      '5Minute': '5Min',
      '15Minute': '15Min',
      '30Minute': '30Min',
      '1Hour': '1Hour',
      '1Day': '1Day',
      '1Week': '1Week',
      '1Month': '1Month'
    };

    const alpacaTimeframe = timeframeMap[timeframe] || timeframe;
    console.log(`Mapped timeframe from ${timeframe} to ${alpacaTimeframe}`);

    const alpacaApiKey = Deno.env.get("ALPACA_TRADER_API_KEY");
    const alpacaSecretKey = Deno.env.get("ALPACA_TRADER_SECRET_KEY");

    console.log(`Using Trader API key: ${alpacaApiKey ? alpacaApiKey.substring(0, 8) + '...' : 'undefined'}`);
    console.log(`Using Trader secret key: ${alpacaSecretKey ? 'defined' : 'undefined'}`);

    if (!alpacaApiKey || !alpacaSecretKey) {
      throw new Error('Alpaca Trader API credentials not configured');
    }

    // Optimize API call parameters for faster loading
    const optimizeLimit = Math.min(limit, 100); // Cap limit to prevent slow requests
    const bufferDays = Math.min(limit + 3, 15); // Reduce buffer for faster response
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - bufferDays);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Use more efficient API endpoint structure
    const barsUrl = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=${alpacaTimeframe}&start=${startDateStr}&limit=${optimizeLimit}&sort=desc`;
    
    const barsResponse = await fetch(barsUrl, {
      method: 'GET',
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecretKey,
        'Accept': 'application/json',
        'User-Agent': 'TradingApp/1.0', // Add user agent for faster processing
      },
      // Add request timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!barsResponse.ok) {
      const errorText = await barsResponse.text();
      console.error(`Alpaca historical API error: ${barsResponse.status} - ${errorText}`);
      throw new Error(`Historical API request failed: ${barsResponse.status}`);
    }
    
    const barsData = await barsResponse.json();
    console.log(`Historical data response:`, barsData);

    if (!barsData.bars || !barsData.bars[symbol] || barsData.bars[symbol].length === 0) {
      throw new Error(`No historical data available for symbol: ${symbol}`);
    }
    
    let bars = barsData.bars[symbol];
    
    // Take only the required number of data points for faster processing
    bars = bars.slice(-limit);
    
    // Transform the data for charting with optimized processing
    const historicalData = bars.map((bar: any) => ({
      date: bar.t.split('T')[0], // Extract date part
      timestamp: bar.t,
      open: Number(bar.o.toFixed(2)),
      high: Number(bar.h.toFixed(2)),
      low: Number(bar.l.toFixed(2)),
      close: Number(bar.c.toFixed(2)),
      volume: bar.v,
    }));
    
    console.log(`Processed ${historicalData.length} historical data points for ${symbol}`);
    
    return new Response(JSON.stringify({
      symbol,
      data: historicalData,
      count: historicalData.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Historical data error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: `Historical data fetch failed: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
