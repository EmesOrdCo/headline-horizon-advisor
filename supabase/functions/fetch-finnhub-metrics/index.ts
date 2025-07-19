import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Finnhub Edge Function: Starting fetch')
    
    const { symbol } = await req.json()
    console.log('Finnhub Edge Function: Fetching metrics for symbol:', symbol)

    if (!symbol) {
      console.error('Finnhub Edge Function: No symbol provided')
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const apiKey = Deno.env.get('FINNHUB_API_KEY')
    if (!apiKey) {
      console.error('Finnhub Edge Function: No API key found')
      return new Response(
        JSON.stringify({ error: 'Finnhub API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Finnhub Edge Function: API key found, making requests...')

    // Fetch multiple endpoints for comprehensive data
    const endpoints = [
      `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`,
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`,
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
    ]

    console.log('Finnhub Edge Function: Fetching from endpoints:', endpoints)

    const responses = await Promise.allSettled(
      endpoints.map(async (url, index) => {
        console.log(`Finnhub Edge Function: Fetching endpoint ${index + 1}: ${url}`)
        const response = await fetch(url)
        
        if (!response.ok) {
          console.error(`Finnhub Edge Function: Endpoint ${index + 1} failed with status:`, response.status)
          const errorText = await response.text()
          console.error(`Finnhub Edge Function: Error response:`, errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
        
        const data = await response.json()
        console.log(`Finnhub Edge Function: Endpoint ${index + 1} response:`, data)
        return data
      })
    )

    // Extract data from responses
    const metricsData = responses[0].status === 'fulfilled' ? responses[0].value : {}
    const profileData = responses[1].status === 'fulfilled' ? responses[1].value : {}
    const quoteData = responses[2].status === 'fulfilled' ? responses[2].value : {}

    console.log('Finnhub Edge Function: Raw metrics data:', metricsData)
    console.log('Finnhub Edge Function: Raw profile data:', profileData)
    console.log('Finnhub Edge Function: Raw quote data:', quoteData)

    // Process and format the data
    const metric = metricsData.metric || {}
    
    const processedMetrics = {
      // Valuation metrics
      marketCap: profileData.marketCapitalization,
      peRatio: metric.peBasicExclExtraTTM || metric.peTTM || metric.peAnnual,
      pegRatio: metric.pegRatio,
      priceToBook: metric.pbAnnual || metric.pbTTM,
      priceToSales: metric.psAnnual || metric.psTTM,
      enterpriseValue: metric.enterpriseValue,
      evToEbitda: metric.evToEbitdaTTM,
      
      // Financial health
      currentRatio: metric.currentRatioAnnual || metric.currentRatioTTM,
      quickRatio: metric.quickRatioAnnual || metric.quickRatioTTM,
      returnOnEquity: metric.roeTTM || metric.roeAnnual,
      returnOnAssets: metric.roaTTM || metric.roaAnnual,
      grossMargin: metric.grossMarginTTM || metric.grossMarginAnnual,
      operatingMargin: metric.operatingMarginTTM || metric.operatingMarginAnnual,
      netMargin: metric.netProfitMarginTTM || metric.netProfitMarginAnnual,
      debtToEquity: metric.totalDebtToEquityAnnual || metric.totalDebtToEquityTTM,
      
      // Dividends
      dividendYield: metric.dividendYieldIndicatedAnnual,
      dividendPerShare: metric.dividendPerShareAnnual,
      payoutRatio: metric.payoutRatioAnnual,
      
      // Growth metrics
      revenueGrowth: metric.revenueGrowthTTMYoy,
      earningsGrowth: metric.epsGrowthTTMYoy,
      
      // Additional metrics
      beta: metric.beta,
      eps: metric.epsBasicExclExtraItemsTTM || metric.epsTTM,
      bookValuePerShare: metric.bookValuePerShareAnnual || metric.bookValuePerShareTTM,
      
      // 52-week data
      fiftyTwoWeekHigh: metric['52WeekHigh'],
      fiftyTwoWeekLow: metric['52WeekLow'],
    }

    console.log('Finnhub Edge Function: Processed metrics:', processedMetrics)

    return new Response(
      JSON.stringify(processedMetrics),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Finnhub Edge Function: Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch financial metrics',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})