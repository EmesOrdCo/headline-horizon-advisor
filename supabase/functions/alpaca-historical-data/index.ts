import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 alpaca-historical-data function called')
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol, timeframe = '1Min', limit = 100 } = await req.json()
    console.log(`📊 Fetching data for ${symbol}, timeframe: ${timeframe}, limit: ${limit}`)

    // Get Alpaca API credentials - use market data API keys, not trader keys
    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY')
    const alpacaSecret = Deno.env.get('ALPACA_SECRET_KEY')

    console.log('🔑 API Key exists:', !!alpacaApiKey)
    console.log('🔑 Secret Key exists:', !!alpacaSecret)
    console.log('🔑 API Key prefix:', alpacaApiKey?.substring(0, 8) + '...')

    if (!alpacaApiKey || !alpacaSecret) {
      console.error('❌ Missing Alpaca credentials')
      throw new Error('Alpaca API credentials not configured')
    }

    console.log('✅ Alpaca credentials found, fetching data...')

    // Calculate start date (for 100 bars, go back a few days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 7) // Go back 7 days to ensure we get enough data

    // Format dates for Alpaca API
    const start = startDate.toISOString().split('T')[0]
    const end = endDate.toISOString().split('T')[0]

    console.log('📅 Date range:', start, 'to', end)

    // Try different Alpaca endpoints
    let url: string;
    let headers: Record<string, string>;

    // First try: Production market data API
    url = `https://data.alpaca.markets/v2/stocks/${symbol}/bars?timeframe=${timeframe}&start=${start}&end=${end}&limit=${limit}&asof=&feed=iex&sort=asc`
    headers = {
      'APCA-API-KEY-ID': alpacaApiKey,
      'APCA-API-SECRET-KEY': alpacaSecret,
      'Content-Type': 'application/json',
    }

    console.log('🔗 Trying production market data URL:', url)
    console.log('🔗 Using headers:', Object.keys(headers))
    
    let response = await fetch(url, { headers })

    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

    // If 403, try sandbox
    if (response.status === 403) {
      console.log('⚠️ Production failed with 403, trying sandbox...')
      url = `https://data.sandbox.alpaca.markets/v2/stocks/${symbol}/bars?timeframe=${timeframe}&start=${start}&end=${end}&limit=${limit}&asof=&feed=iex&sort=asc`
      console.log('🔗 Trying sandbox URL:', url)
      response = await fetch(url, { headers })
      console.log('📡 Sandbox response status:', response.status)
    }

    // If still 403, try different auth method
    if (response.status === 403) {
      console.log('⚠️ Sandbox also failed, trying Basic auth...')
      const basicAuth = btoa(`${alpacaApiKey}:${alpacaSecret}`)
      headers = {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      }
      response = await fetch(url, { headers })
      console.log('📡 Basic auth response status:', response.status)
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Alpaca API error:', response.status, errorText)
      console.error('🔗 Failed URL:', url)
      console.error('🔑 Using API key prefix:', alpacaApiKey?.substring(0, 8) + '...')
      throw new Error(`Alpaca API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Successfully fetched data keys:', Object.keys(data))
    console.log('📊 Bars count:', data.bars ? Object.keys(data.bars).length : 'No bars')

    // Transform the data format if needed
    let transformedData = data;
    if (data.bars && typeof data.bars === 'object' && !Array.isArray(data.bars)) {
      // Convert object format to array format
      const barsArray = data.bars[symbol] || [];
      transformedData = { ...data, bars: barsArray };
      console.log('🔄 Transformed data, bars array length:', barsArray.length);
    }

    return new Response(
      JSON.stringify(transformedData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Error in alpaca-historical-data:', error)
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