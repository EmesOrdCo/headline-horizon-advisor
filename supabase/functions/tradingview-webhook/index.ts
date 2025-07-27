import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('TradingView webhook function called')
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const webhook = await req.json()
    console.log('TradingView webhook received:', webhook)

    // Extract trading information from TradingView alert
    const { 
      symbol, 
      action, // 'buy' or 'sell'
      price,
      quantity = 1,
      order_type = 'market',
      time_in_force = 'gtc',
      strategy_name,
      alert_message 
    } = webhook

    console.log(`Processing ${action} order for ${quantity} shares of ${symbol}`)

    // Validate required fields
    if (!symbol || !action) {
      throw new Error('Missing required fields: symbol and action')
    }

    // Validate action
    if (!['buy', 'sell'].includes(action.toLowerCase())) {
      throw new Error('Invalid action. Must be "buy" or "sell"')
    }

    // Get Alpaca API credentials
    const alpacaApiKey = Deno.env.get('ALPACA_TRADER_API_KEY') || Deno.env.get('ALPACA_API_KEY')
    const alpacaSecret = Deno.env.get('ALPACA_TRADER_SECRET_KEY') || Deno.env.get('ALPACA_SECRET_KEY')

    if (!alpacaApiKey || !alpacaSecret) {
      console.error('Missing Alpaca trader credentials')
      throw new Error('Alpaca trader API credentials not configured')
    }

    // Prepare order data for Alpaca
    const orderData = {
      symbol: symbol.toUpperCase(),
      qty: parseInt(quantity.toString()),
      side: action.toLowerCase(),
      type: order_type.toLowerCase(),
      time_in_force: time_in_force.toLowerCase()
    }

    // Add limit price if provided and order type is limit
    if (price && order_type.toLowerCase() === 'limit') {
      orderData.limit_price = parseFloat(price.toString())
    }

    console.log('Order data for Alpaca:', orderData)

    // Place order with Alpaca Trading API (sandbox/paper trading)
    const alpacaUrl = 'https://paper-api.alpaca.markets/v2/orders'
    
    const alpacaResponse = await fetch(alpacaUrl, {
      method: 'POST',
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })

    const responseText = await alpacaResponse.text()
    console.log('Alpaca response:', alpacaResponse.status, responseText)

    if (!alpacaResponse.ok) {
      throw new Error(`Alpaca Trading API error: ${alpacaResponse.status} ${responseText}`)
    }

    const orderResult = JSON.parse(responseText)
    console.log('Order placed successfully via webhook:', orderResult)

    // Log the successful trade
    const logEntry = {
      timestamp: new Date().toISOString(),
      symbol,
      action: action.toLowerCase(),
      quantity,
      order_type,
      price: price || 'market',
      strategy: strategy_name || 'TradingView Alert',
      order_id: orderResult.id,
      status: orderResult.status,
      source: 'tradingview_webhook'
    }

    console.log('Trade log entry:', logEntry)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `${action.toUpperCase()} order placed successfully`,
        order: orderResult,
        webhook_data: webhook,
        processed_at: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error processing TradingView webhook:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        processed_at: new Date().toISOString()
      }),
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