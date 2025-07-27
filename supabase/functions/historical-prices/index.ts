import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol, timeframe = '1h', limit = 100 } = await req.json();
    
    console.log(`📊 Fetching historical prices for ${symbol} with timeframe ${timeframe}, limit ${limit}`);

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Alpaca API credentials from environment
    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY');
    const alpacaSecretKey = Deno.env.get('ALPACA_SECRET_KEY');
    
    if (!alpacaApiKey || !alpacaSecretKey) {
      console.error('❌ Missing Alpaca API credentials');
      return new Response(
        JSON.stringify({ error: 'API credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Map timeframes to Alpaca format
    const timeframeMap: { [key: string]: string } = {
      '1m': '1Min',
      '5m': '5Min', 
      '15m': '15Min',
      '30m': '30Min',
      '1h': '1Hour',
      '4h': '4Hour',
      '1d': '1Day',
      '1D': '1Day',
      '1w': '1Week',
      '1W': '1Week',
      '1M': '1Month'
    };

    const alpacaTimeframe = timeframeMap[timeframe] || '1Hour';
    
    // Calculate date range - get enough data for the requested limit
    const endDate = new Date();
    const startDate = new Date();
    
    // Adjust start date based on timeframe to ensure we get enough data
    switch (alpacaTimeframe) {
      case '1Min':
        startDate.setHours(startDate.getHours() - Math.max(limit * 0.5, 24)); // At least 24 hours back
        break;
      case '5Min':
        startDate.setHours(startDate.getHours() - Math.max(limit * 2, 48)); // At least 48 hours back
        break;
      case '15Min':
        startDate.setDate(startDate.getDate() - Math.max(Math.ceil(limit * 0.25), 7)); // At least 7 days back
        break;
      case '30Min':
        startDate.setDate(startDate.getDate() - Math.max(Math.ceil(limit * 0.5), 14)); // At least 14 days back
        break;
      case '1Hour':
        startDate.setDate(startDate.getDate() - Math.max(Math.ceil(limit * 0.25), 30)); // At least 30 days back
        break;
      case '4Hour':
        startDate.setDate(startDate.getDate() - Math.max(Math.ceil(limit * 4), 120)); // At least 120 days back
        break;
      case '1Day':
        startDate.setDate(startDate.getDate() - Math.max(limit * 2, 365)); // At least 1 year back
        break;
      default:
        startDate.setDate(startDate.getDate() - 30); // Default 30 days
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`📅 Date range: ${startDateStr} to ${endDateStr}`);

    // Build Alpaca API URL
    const alpacaUrl = new URL('https://paper-api.alpaca.markets/v2/stocks/bars');
    alpacaUrl.searchParams.set('symbols', symbol);
    alpacaUrl.searchParams.set('timeframe', alpacaTimeframe);
    alpacaUrl.searchParams.set('start', startDateStr);
    alpacaUrl.searchParams.set('end', endDateStr);
    alpacaUrl.searchParams.set('limit', limit.toString());
    alpacaUrl.searchParams.set('adjustment', 'raw');
    alpacaUrl.searchParams.set('feed', 'iex'); // Use IEX feed for better data quality

    console.log(`🔗 Alpaca URL: ${alpacaUrl.toString()}`);

    // Make request to Alpaca API
    const alpacaResponse = await fetch(alpacaUrl.toString(), {
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecretKey,
        'Accept': 'application/json'
      }
    });

    if (!alpacaResponse.ok) {
      const errorText = await alpacaResponse.text();
      console.error(`❌ Alpaca API error: ${alpacaResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: `Alpaca API error: ${alpacaResponse.status}`,
          details: errorText
        }),
        { 
          status: alpacaResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const alpacaData = await alpacaResponse.json();
    console.log(`📈 Received ${alpacaData.bars?.[symbol]?.length || 0} bars from Alpaca for ${symbol}`);

    // Transform data for TradingView
    const bars = alpacaData.bars?.[symbol] || [];
    
    if (bars.length === 0) {
      console.warn(`⚠️ No historical data found for ${symbol}`);
      return new Response(
        JSON.stringify({ 
          bars: [],
          message: `No historical data available for ${symbol}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sort bars by timestamp to ensure correct order
    const sortedBars = bars
      .map((bar: any) => ({
        timestamp: bar.t,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v,
        // Also provide alternative field names for compatibility
        t: bar.t,
        o: bar.o,
        h: bar.h,
        l: bar.l,
        c: bar.c,
        v: bar.v
      }))
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-limit); // Take only the most recent bars up to the limit

    console.log(`✅ Returning ${sortedBars.length} processed bars for ${symbol}`);

    return new Response(
      JSON.stringify({
        symbol,
        timeframe: alpacaTimeframe,
        bars: sortedBars,
        count: sortedBars.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error in historical-prices function:', error);
    return new Response(
      JSON.stringify({ 
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