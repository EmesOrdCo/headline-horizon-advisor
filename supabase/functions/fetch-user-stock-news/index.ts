
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid user')
    }

    console.log(`Fetching news for user: ${user.id}`)

    // Get user's selected stocks
    const { data: userStocks, error: stocksError } = await supabaseClient
      .from('user_stocks')
      .select('symbol')
      .eq('user_id', user.id)

    if (stocksError) {
      throw stocksError
    }

    if (!userStocks || userStocks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No stocks selected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const symbols = userStocks.map(stock => stock.symbol).join(',')
    console.log(`Fetching news for symbols: ${symbols}`)

    // Fetch news from Marketaux API
    const marketauxKey = Deno.env.get('MARKETAUX_API_KEY')
    if (!marketauxKey) {
      throw new Error('MARKETAUX_API_KEY not configured')
    }

    const newsResponse = await fetch(
      `https://api.marketaux.com/v1/news/all?symbols=${symbols}&filter_entities=true&language=en&api_token=${marketauxKey}&limit=20`
    )

    if (!newsResponse.ok) {
      throw new Error(`Marketaux API error: ${newsResponse.status}`)
    }

    const newsData = await newsResponse.json()
    console.log(`Fetched ${newsData.data?.length || 0} articles`)

    if (!newsData.data || newsData.data.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No news articles found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Analyze each article with OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    const analyzedArticles = []

    for (const article of newsData.data) {
      try {
        // Analyze sentiment with OpenAI
        const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are a financial analyst. Analyze the sentiment of news articles for stock trading.
                
                Return a JSON object with:
                - sentiment: "Bullish", "Bearish", or "Neutral"
                - confidence: number from 0-100
                - reasoning: brief explanation (max 100 words)
                
                Focus on the article's potential impact on stock price.`
              },
              {
                role: 'user',
                content: `Analyze this article about ${article.entities?.[0]?.symbol || 'stocks'}:
                
                Title: ${article.title}
                Description: ${article.description || 'No description'}
                
                Return only valid JSON.`
              }
            ],
            max_tokens: 200,
            temperature: 0.3,
          }),
        })

        let sentiment = 'Neutral'
        let confidence = 50
        let reasoning = 'Unable to analyze article sentiment'

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json()
          try {
            const analysis = JSON.parse(analysisData.choices[0].message.content)
            sentiment = analysis.sentiment || 'Neutral'
            confidence = analysis.confidence || 50
            reasoning = analysis.reasoning || 'No reasoning provided'
          } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError)
          }
        }

        // Store the analyzed article
        const articleSymbol = article.entities?.[0]?.symbol || symbols.split(',')[0]
        
        const { error: insertError } = await supabaseClient
          .from('user_stock_articles')
          .insert({
            user_id: user.id,
            symbol: articleSymbol,
            title: article.title,
            description: article.description,
            url: article.url,
            published_at: article.published_at,
            ai_sentiment: sentiment,
            ai_confidence: confidence,
            ai_reasoning: reasoning,
          })

        if (insertError) {
          console.error('Error inserting article:', insertError)
        } else {
          analyzedArticles.push({
            symbol: articleSymbol,
            title: article.title,
            sentiment,
            confidence,
            reasoning,
          })
        }

        // Small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error('Error analyzing article:', error)
      }
    }

    console.log(`Successfully analyzed ${analyzedArticles.length} articles`)

    return new Response(
      JSON.stringify({ 
        message: `Successfully analyzed ${analyzedArticles.length} articles`,
        articles: analyzedArticles 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-user-stock-news function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
