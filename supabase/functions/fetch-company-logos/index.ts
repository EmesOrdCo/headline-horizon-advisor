import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json();
    
    if (!symbols || !Array.isArray(symbols)) {
      return new Response(
        JSON.stringify({ error: 'symbols array is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnhubApiKey) {
      return new Response(
        JSON.stringify({ error: 'Finnhub API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const results = [];

    for (const symbol of symbols) {
      try {
        console.log(`Fetching logo for symbol: ${symbol}`);
        
        // Fetch company profile from Finnhub
        const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${finnhubApiKey}`;
        const profileResponse = await fetch(profileUrl);
        
        if (!profileResponse.ok) {
          console.error(`Failed to fetch profile for ${symbol}:`, profileResponse.status);
          continue;
        }
        
        const profileData = await profileResponse.json();
        console.log(`Profile data for ${symbol}:`, profileData);
        
        if (profileData.logo) {
          results.push({
            symbol,
            logo_url: profileData.logo,
            name: profileData.name || symbol
          });
        } else {
          console.log(`No logo found for ${symbol}`);
        }
      } catch (error) {
        console.error(`Error fetching logo for ${symbol}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ logos: results }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in fetch-company-logos:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});