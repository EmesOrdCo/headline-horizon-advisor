
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

    const alpacaApiKey = Deno.env.get("ALPACA_API_KEY");
    const alpacaSecretKey = Deno.env.get("ALPACA_SECRET_KEY");

    console.log(`Using API key: ${alpacaApiKey ? alpacaApiKey.substring(0, 5) + '...' : 'undefined'}`);
    console.log(`Using secret key: ${alpacaSecretKey ? 'defined' : 'undefined'}`);

    if (!alpacaApiKey || !alpacaSecretKey) {
      throw new Error('Alpaca API credentials not configured');
    }

    // For 1-week mini charts (7 days), we want exactly 7 trading days
    // For other cases, add buffer for weekends
    const bufferDays = (limit === 7 && timeframe === '1Day') ? 10 : (limit + 5);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - bufferDays);
    const startDateStr = startDate.toISOString().split('T')[0];

    const barsUrl = `https://data.alpaca.markets/v2/stocks/${symbol}/bars?timeframe=${timeframe}&start=${startDateStr}&limit=${Math.max(limit, 10)}`;
    console.log(`Making historical bars request to: ${barsUrl}`);
    
    const barsResponse = await fetch(barsUrl, {
      method: 'GET',
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecretKey,
        'User-Agent': 'Mozilla/5.0 (compatible; StockApp/1.0)',
        'Accept': 'application/json',
      },
    });
    
    if (!barsResponse.ok) {
      const errorText = await barsResponse.text();
      console.error(`Alpaca historical API error: ${barsResponse.status} - ${errorText}`);
      throw new Error(`Historical API request failed: ${barsResponse.status}`);
    }
    
    const barsData = await barsResponse.json();
    console.log(`Historical data response:`, barsData);

    if (!barsData.bars || barsData.bars.length === 0) {
      throw new Error(`No historical data available for symbol: ${symbol}`);
    }
    
    let bars = barsData.bars;
    
    // For 1-week mini charts, take only the last 7 data points
    if (limit === 7 && timeframe === '1Day') {
      bars = bars.slice(-7);
    }
    
    // Transform the data for charting
    const historicalData = bars.map((bar: any) => ({
      date: bar.t.split('T')[0], // Extract date part
      timestamp: bar.t,
      open: parseFloat(bar.o.toFixed(2)),
      high: parseFloat(bar.h.toFixed(2)),
      low: parseFloat(bar.l.toFixed(2)),
      close: parseFloat(bar.c.toFixed(2)),
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
