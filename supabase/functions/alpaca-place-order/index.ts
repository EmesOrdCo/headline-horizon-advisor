import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol, qty, side, type, time_in_force } = await req.json()

    // Get Alpaca API credentials and account ID
    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY')
    const alpacaSecret = Deno.env.get('ALPACA_SECRET_KEY')
    const alpacaAccountId = Deno.env.get('ALPACA_ACCOUNT_ID')

    if (!alpacaApiKey || !alpacaSecret || !alpacaAccountId) {
      throw new Error('Alpaca API credentials or account ID not configured')
    }

    // Place order via Alpaca Broker API
    const orderData = {
      symbol,
      qty: parseInt(qty),
      side,
      type,
      time_in_force
    }

    const url = `https://broker-api.sandbox.alpaca.markets/v1/trading/accounts/${alpacaAccountId}/orders`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Alpaca Broker API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in alpaca-place-order:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})