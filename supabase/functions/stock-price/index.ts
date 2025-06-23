
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
    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');

    if (!finnhubApiKey) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    console.log(`Fetching live price for ${symbol} from Finnhub...`);
    
    // Add delay to respect rate limits for free tier (60 calls/minute)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get current price
    const quoteResponse = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`
    );
    
    if (!quoteResponse.ok) {
      console.error(`Finnhub API error for ${symbol}: ${quoteResponse.status}`);
      throw new Error(`Finnhub API error: ${quoteResponse.status}`);
    }
    
    const quoteData = await quoteResponse.json();
    console.log(`Finnhub response for ${symbol}:`, quoteData);
    
    if (quoteData.c && quoteData.c > 0) {
      const price = quoteData.c; // Current price
      const change = quoteData.d || 0; // Dollar change
      const changePercent = quoteData.dp || 0; // Percent change
      
      return new Response(JSON.stringify({
        symbol,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    throw new Error(`Invalid or empty data from Finnhub API for ${symbol}`);
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
