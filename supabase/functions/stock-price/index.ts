
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: Store last request time per IP to enforce limits
const requestTimes = new Map<string, number[]>();

const enforceRateLimit = (clientIp: string): boolean => {
  const now = Date.now();
  const clientRequests = requestTimes.get(clientIp) || [];
  
  // Remove requests older than 1 minute
  const recentRequests = clientRequests.filter(time => now - time < 60000);
  
  // Check if we're under the 60 requests/minute limit
  if (recentRequests.length >= 60) {
    console.log(`Rate limit exceeded for ${clientIp}: ${recentRequests.length} requests in last minute`);
    return false;
  }
  
  // Add current request time
  recentRequests.push(now);
  requestTimes.set(clientIp, recentRequests);
  
  return true;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Enforce rate limiting
    if (!enforceRateLimit(clientIp)) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Maximum 60 requests per minute allowed.',
        details: 'Please wait before making another request'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { symbol } = await req.json();

    console.log(`→ RAW SYMBOL: "${symbol}" (length=${symbol.length})`);

    const cleanSymbol = encodeURIComponent(symbol.trim());

    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');

    console.log(`=== DEBUGGING FINNHUB API FOR ${cleanSymbol} ===`);
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

    const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${cleanSymbol}&token=${finnhubApiKey}`;
    console.log(`Making request to: ${apiUrl.replace(finnhubApiKey, 'API_KEY_HIDDEN')}`);
    
    // Add minimum 2-second delay between requests to respect 30 calls/second limit
    // This is conservative to ensure we stay well under the limit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const quoteResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StockApp/1.0)',
        'Accept': 'application/json',
      },
    });
    
    console.log(`Response status for ${cleanSymbol}:`, quoteResponse.status);
    console.log(`Response headers for ${cleanSymbol}:`, Object.fromEntries(quoteResponse.headers.entries()));
    
    if (!quoteResponse.ok) {
      const errorText = await quoteResponse.text();
      console.error(`Finnhub API error for ${cleanSymbol}: ${quoteResponse.status} - ${errorText}`);
      
      // Handle specific rate limiting responses
      if (quoteResponse.status === 429) {
        throw new Error(`Rate limit exceeded from Finnhub API`);
      }
      
      throw new Error(`Finnhub API error: ${quoteResponse.status} - ${errorText}`);
    }
    
    const responseText = await quoteResponse.text();
    console.log(`Raw response for ${cleanSymbol}:`, responseText);
    
    let quoteData;
    try {
      quoteData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`JSON parse error for ${cleanSymbol}:`, parseError);
      console.error(`Response text that failed to parse:`, responseText);
      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }
    
    console.log(`Parsed data for ${cleanSymbol}:`, quoteData);
    
    if (quoteData.error) {
      console.error(`Finnhub API returned error for ${cleanSymbol}:`, quoteData.error);
      throw new Error(`Finnhub API error: ${quoteData.error}`);
    }
    
    if (!quoteData.c || quoteData.c <= 0) {
      console.error(`Invalid price data for ${cleanSymbol}:`, quoteData);
      throw new Error(`Invalid or missing price data for ${cleanSymbol}`);
    }
    
    const price = quoteData.c;
    const change = quoteData.d || 0;
    const changePercent = quoteData.dp || 0;
    
    const result = {
      symbol: cleanSymbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    };
    
    console.log(`Successful result for ${cleanSymbol}:`, result);
    
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
