
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

// Magnificent 7 stocks
const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];

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

    console.log('Starting iterative news fetching for Magnificent 7...');
    
    const analyzedNews = [];
    const stockAnalysis = new Map(); // Track one analysis per stock
    let totalFetched = 0;
    let page = 0;

    // Continue fetching until we have analysis for all Magnificent 7 stocks or reach limit
    while (stockAnalysis.size < MAGNIFICENT_7.length && totalFetched < 100) {
      console.log(`Fetching page ${page + 1}...`);
      
      // Fetch news from MarketAux with pagination
      const newsResponse = await fetch(
        `https://api.marketaux.com/v1/news/all?symbols=${MAGNIFICENT_7.join(',')}&filter_entities=true&language=en&limit=20&page=${page}&api_token=${marketauxApiKey}`
      );

      if (!newsResponse.ok) {
        throw new Error(`MarketAux API error: ${newsResponse.status}`);
      }

      const newsData = await newsResponse.json();
      const articles = newsData.data || [];
      
      if (articles.length === 0) {
        console.log('No more articles available');
        break;
      }

      console.log(`Fetched ${articles.length} articles from page ${page + 1}`);
      totalFetched += articles.length;

      // Process articles for stocks we don't have analysis for yet
      for (const article of articles) {
        const symbol = article.entities?.[0]?.symbol;
        
        // Skip if not Magnificent 7 or already analyzed
        if (!symbol || !MAGNIFICENT_7.includes(symbol) || stockAnalysis.has(symbol)) {
          continue;
        }

        console.log(`Analyzing article for ${symbol}: ${article.title}`);

        try {
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
                  content: 'You are a financial analyst. Analyze the given news article and provide a JSON response with: prediction (string like "+2.8% (24h)" or "-1.5% (24h)"), confidence (number 1-100), sentiment ("Bullish", "Bearish", or "Neutral"), priority ("HIGH", "MEDIUM", "LOW"), and category. Be realistic and conservative with predictions. Make a clear decision on sentiment - avoid neutral unless truly uncertain.'
                },
                {
                  role: 'user',
                  content: `Title: ${article.title}\nDescription: ${article.description}\nSymbol: ${symbol}`
                }
              ],
              response_format: { type: "json_object" }
            }),
          });

          if (!chatResponse.ok) {
            console.error(`OpenAI API error for ${symbol}: ${chatResponse.status}`);
            continue;
          }

          const chatData = await chatResponse.json();
          const analysis = JSON.parse(chatData.choices[0].message.content);

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

          // Store this as the analysis for this stock
          stockAnalysis.set(symbol, processedArticle);
          analyzedNews.push(processedArticle);

          console.log(`Successfully analyzed ${symbol} with ${analysis.sentiment} sentiment`);

        } catch (error) {
          console.error(`Error analyzing article for ${symbol}:`, error);
        }
      }

      page++;
      
      // Add delay between API calls to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Store all analyzed articles in database
    for (const article of analyzedNews) {
      // Delete existing articles for this symbol to ensure only one per stock
      await supabase
        .from('news_articles')
        .delete()
        .eq('symbol', article.symbol);

      // Insert new analysis
      const { error } = await supabase
        .from('news_articles')
        .insert({
          title: article.title,
          description: article.description,
          symbol: article.symbol,
          url: article.url,
          published_at: article.published_at,
          ai_confidence: article.ai_confidence,
          ai_prediction: article.ai_prediction,
          ai_sentiment: article.ai_sentiment,
          ai_reasoning: article.ai_reasoning,
          priority: article.priority,
          category: article.category
        });

      if (error) {
        console.error(`Database error for ${article.symbol}:`, error);
      }
    }

    console.log(`Successfully analyzed ${analyzedNews.length} stocks from ${totalFetched} total articles`);
    console.log(`Stocks analyzed: ${Array.from(stockAnalysis.keys()).join(', ')}`);

    return new Response(JSON.stringify({ 
      success: true, 
      articles: analyzedNews,
      count: analyzedNews.length,
      stocksAnalyzed: Array.from(stockAnalysis.keys()),
      totalArticlesProcessed: totalFetched
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
