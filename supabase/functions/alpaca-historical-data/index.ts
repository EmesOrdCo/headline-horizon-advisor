import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('alpaca-historical-data function called')
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol, timeframe = '1Min', limit = 100 } = await req.json()
    console.log(`Fetching data for ${symbol}, timeframe: ${timeframe}, limit: ${limit}`)

    // Get Alpaca API credentials from environment variables
    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY')
    const alpacaSecret = Deno.env.get('ALPACA_SECRET_KEY')

    if (!alpacaApiKey || !alpacaSecret) {
      console.error('Missing Alpaca credentials')
      throw new Error('Alpaca API credentials not configured')
    }

    console.log('Alpaca credentials found, fetching data...')

    // Calculate start date (for 100 bars, go back a few days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 7) // Go back 7 days to ensure we get enough data

    // Format dates for Alpaca API
    const start = startDate.toISOString().split('T')[0]
    const end = endDate.toISOString().split('T')[0]

    // Fetch historical data from Alpaca
    const url = `https://data.sandbox.alpaca.markets/v2/stocks/${symbol}/bars?timeframe=${timeframe}&start=${start}&end=${end}&limit=${limit}&asof=&feed=iex&sort=asc`
    console.log('Alpaca URL:', url)
    
    const response = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecret,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Alpaca API error:', response.status, errorText)
      throw new Error(`Alpaca API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('Successfully fetched data:', data)

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
    console.error('Error in alpaca-historical-data:', error)
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