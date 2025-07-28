import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BROKER_BASE_URL = 'https://broker-api.sandbox.alpaca.markets';

serve(async (req) => {
  console.log('alpaca-place-order function called')
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { account_id, symbol, qty, side, type, time_in_force } = await req.json()
    console.log(`Placing ${side} order for ${qty} shares of ${symbol} on account ${account_id}`)

    // Get Alpaca API credentials
    const apiKey = Deno.env.get('ALPACA_API_KEY')
    const secretKey = Deno.env.get('ALPACA_SECRET_KEY')

    if (!apiKey || !secretKey) {
      console.error('Missing Alpaca API credentials')
      throw new Error('Alpaca API credentials not configured')
    }

    // Use the broker API with Basic auth (same as alpaca-broker function)
    const basicAuth = btoa(`${apiKey}:${secretKey}`);
    const headers = {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const orderData = {
      symbol,
      qty: parseInt(qty),
      side,
      type,
      time_in_force
    }

    console.log('Order data:', orderData)

    const url = `${BROKER_BASE_URL}/v1/trading/accounts/${account_id}/orders`
    
    console.log(`Making place_order request to: ${url}`)
    console.log(`Request headers:`, JSON.stringify(headers, null, 2))
    console.log(`Request body:`, JSON.stringify(orderData, null, 2))
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    })

    console.log(`Response status: ${response.status}`)
    console.log(`Response headers:`, JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2))

    const responseText = await response.text()
    console.log('Alpaca response:', response.status, responseText)

    if (!response.ok) {
      // Parse error response for better error messages
      let errorMessage = `API request failed: ${response.status}`;
      
      try {
        if (responseText.trim().startsWith('{')) {
          const errorJson = JSON.parse(responseText);
          
          if (errorJson.message) {
            errorMessage = errorJson.message;
          } else if (errorJson.error) {
            errorMessage = errorJson.error;
          }
          
          // Map common error codes to user-friendly messages
          if (errorMessage.toLowerCase().includes('insufficient')) {
            errorMessage = "Insufficient buying power. You don't have enough funds for this trade.";
          } else if (errorMessage.toLowerCase().includes('not_tradable')) {
            errorMessage = "This stock is not available for trading.";
          } else if (errorMessage.toLowerCase().includes('market_closed')) {
            errorMessage = "Market is currently closed. Orders will be queued for next trading session.";
          }
        }
      } catch (parseError) {
        console.error('Failed to parse error JSON:', parseError);
      }
      
      throw new Error(errorMessage)
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