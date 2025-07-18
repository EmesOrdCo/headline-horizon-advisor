
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    
    if (!query || query.length < 1) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY')
    const alpacaSecretKey = Deno.env.get('ALPACA_SECRET_KEY')
    
    if (!alpacaApiKey || !alpacaSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Alpaca API keys not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use Alpaca's assets endpoint to search for stocks
    const response = await fetch(
      `https://paper-api.alpaca.markets/v2/assets?status=active&asset_class=us_equity&search=${encodeURIComponent(query)}`,
      {
        headers: {
          'APCA-API-KEY-ID': alpacaApiKey,
          'APCA-API-SECRET-KEY': alpacaSecretKey,
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform Alpaca response to match expected format
    const formattedData = {
      result: data.map((asset: any) => ({
        symbol: asset.symbol,
        description: asset.name,
        displaySymbol: asset.symbol,
        type: 'Common Stock'
      })).slice(0, 10) // Limit to 10 results
    }

    return new Response(
      JSON.stringify(formattedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error searching stocks:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to search stocks' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
