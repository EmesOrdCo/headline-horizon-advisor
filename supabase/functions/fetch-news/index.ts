
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const marketauxApiKey = Deno.env.get('MARKETAUX_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!marketauxApiKey || !openaiApiKey) {
      throw new Error('Missing API keys');
    }

    console.log('Fetching news from MarketAux...');
    
    // Fetch news from MarketAux
    const newsResponse = await fetch(
      `https://api.marketaux.com/v1/news/all?symbols=TSLA,AAPL,NVDA,MSFT,GOOGL&filter_entities=true&language=en&api_token=${marketauxApiKey}`
    );

    if (!newsResponse.ok) {
      throw new Error(`MarketAux API error: ${newsResponse.status}`);
    }

    const newsData = await newsResponse.json();
    console.log(`Fetched ${newsData.data?.length || 0} articles`);

    const analyzedNews = [];

    // Process first 5 articles
    for (const article of (newsData.data || []).slice(0, 5)) {
      console.log(`Analyzing article: ${article.title}`);

      // Analyze with ChatGPT
      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a financial analyst. Analyze the given news article and provide a JSON response with: prediction (string like "+2.8% (24h)" or "-1.5% (24h)"), confidence (number 1-100), sentiment ("Bullish", "Bearish", or "Neutral"), priority ("HIGH", "MEDIUM", "LOW"), and category. Be realistic and conservative with predictions.'
            },
            {
              role: 'user',
              content: `Title: ${article.title}\nDescription: ${article.description}\nSymbols: ${article.entities?.map(e => e.symbol).join(', ') || 'Unknown'}`
            }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!chatResponse.ok) {
        console.error(`OpenAI API error: ${chatResponse.status}`);
        continue;
      }

      const chatData = await chatResponse.json();
      const analysis = JSON.parse(chatData.choices[0].message.content);

      // Get primary symbol
      const symbol = article.entities?.[0]?.symbol || 'MARKET';

      const processedArticle = {
        symbol,
        title: article.title,
        description: article.description,
        prediction: analysis.prediction,
        confidence: analysis.confidence,
        sentiment: analysis.sentiment,
        priority: analysis.priority,
        category: analysis.category || 'Technology',
        url: article.url,
        published_at: article.published_at,
        ai_confidence: analysis.confidence,
        ai_prediction: analysis.prediction,
        ai_sentiment: analysis.sentiment,
        ai_reasoning: `Analysis based on: ${article.title}. ${article.description ? article.description.substring(0, 200) + '...' : ''}`
      };

      analyzedNews.push(processedArticle);

      // Store in database
      const { error } = await supabase
        .from('news_articles')
        .upsert({
          title: processedArticle.title,
          description: processedArticle.description,
          symbol: processedArticle.symbol,
          url: processedArticle.url,
          published_at: processedArticle.published_at,
          ai_confidence: processedArticle.ai_confidence,
          ai_prediction: processedArticle.ai_prediction,
          ai_sentiment: processedArticle.ai_sentiment,
          ai_reasoning: processedArticle.ai_reasoning,
          priority: processedArticle.priority,
          category: processedArticle.category
        });

      if (error) {
        console.error('Database error:', error);
      }
    }

    console.log(`Successfully analyzed ${analyzedNews.length} articles`);

    return new Response(JSON.stringify({ 
      success: true, 
      articles: analyzedNews,
      count: analyzedNews.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-news function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
