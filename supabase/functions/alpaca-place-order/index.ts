import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('alpaca-place-order function called')
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol, qty, side, type, time_in_force } = await req.json()
    console.log(`Placing ${side} order for ${qty} shares of ${symbol}`)

    // Get Alpaca API credentials - using trader credentials for orders
    const alpacaApiKey = Deno.env.get('ALPACA_TRADER_API_KEY') || Deno.env.get('ALPACA_API_KEY')
    const alpacaSecret = Deno.env.get('ALPACA_TRADER_SECRET_KEY') || Deno.env.get('ALPACA_SECRET_KEY')

    if (!alpacaApiKey || !alpacaSecret) {
      console.error('Missing Alpaca trader credentials')
      throw new Error('Alpaca trader API credentials not configured')
    }

    // For sandbox/paper trading, we'll use the trading API directly
    const orderData = {
      symbol,
      qty: parseInt(qty),
      side,
      type,
      time_in_force
    }

    console.log('Order data:', orderData)

    // Use the trading API for paper trading
    const url = 'https://paper-api.alpaca.markets/v2/orders'
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })

    const responseText = await response.text()
    console.log('Alpaca response:', response.status, responseText)

    if (!response.ok) {
      throw new Error(`Alpaca Trading API error: ${response.status} ${responseText}`)
    }

    const data = JSON.parse(responseText)
    console.log('Order placed successfully:', data)

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