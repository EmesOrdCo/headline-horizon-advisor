
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

    console.log(`=== DEBUGGING FINNHUB API FOR ${symbol} ===`);
    console.log('Finnhub API Key exists:', !!finnhubApiKey);
    console.log('Finnhub API Key length:', finnhubApiKey?.length || 0);

    if (!finnhubApiKey) {
      console.error('FINNHUB_API_KEY not configured in environment');
      throw new Error('FINNHUB_API_KEY not configured');
    }

    if (finnhubApiKey.length < 10) {
      console.error('FINNHUB_API_KEY appears to be invalid (too short)');
      throw new Error('FINNHUB_API_KEY appears to be invalid');
    }

    const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`;
    console.log(`Making request to: ${apiUrl.replace(finnhubApiKey, 'API_KEY_HIDDEN')}`);
    
    // Add delay to respect rate limits for free tier (60 calls/minute)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get current price
    const quoteResponse = await fetch(apiUrl);
    
    console.log(`Response status for ${symbol}:`, quoteResponse.status);
    console.log(`Response headers for ${symbol}:`, Object.fromEntries(quoteResponse.headers.entries()));
    
    if (!quoteResponse.ok) {
      const errorText = await quoteResponse.text();
      console.error(`Finnhub API error for ${symbol}: ${quoteResponse.status} - ${errorText}`);
      throw new Error(`Finnhub API error: ${quoteResponse.status} - ${errorText}`);
    }
    
    const responseText = await quoteResponse.text();
    console.log(`Raw response for ${symbol}:`, responseText);
    
    let quoteData;
    try {
      quoteData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`JSON parse error for ${symbol}:`, parseError);
      console.error(`Response text that failed to parse:`, responseText);
      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }
    
    console.log(`Parsed data for ${symbol}:`, quoteData);
    
    // Check if we got an error from Finnhub
    if (quoteData.error) {
      console.error(`Finnhub API returned error for ${symbol}:`, quoteData.error);
      throw new Error(`Finnhub API error: ${quoteData.error}`);
    }
    
    // Check if we have valid price data
    if (!quoteData.c || quoteData.c <= 0) {
      console.error(`Invalid price data for ${symbol}:`, quoteData);
      throw new Error(`Invalid or missing price data for ${symbol}`);
    }
    
    const price = quoteData.c; // Current price
    const change = quoteData.d || 0; // Dollar change
    const changePercent = quoteData.dp || 0; // Percent change
    
    const result = {
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    };
    
    console.log(`Successful result for ${symbol}:`, result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
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
