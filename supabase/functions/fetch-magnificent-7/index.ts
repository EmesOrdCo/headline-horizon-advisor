
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

const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const marketauxApiKey = Deno.env.get('MARKETAUX_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!marketauxApiKey || !openaiApiKey) {
      throw new Error('Missing API keys - MarketAux or OpenAI');
    }

    console.log('Starting Magnificent 7 news fetching...');
    
    const allArticles = [];

    // Fetch news for Magnificent 7 stocks (3 API calls to get 60 articles)
    for (let apiCall = 0; apiCall < 3; apiCall++) {
      console.log(`Making Magnificent 7 API call ${apiCall + 1}/3...`);
      
      const newsResponse = await fetch(
        `https://api.marketaux.com/v1/news/all?symbols=${MAGNIFICENT_7.join(',')}&filter_entities=true&language=en&limit=20&page=${apiCall}&api_token=${marketauxApiKey}`
      );

      if (!newsResponse.ok) {
        console.error(`MarketAux API error for Magnificent 7: ${newsResponse.status}`);
        continue;
      }

      const newsData = await newsResponse.json();
      const articles = newsData.data || [];
      
      console.log(`Fetched ${articles.length} Magnificent 7 articles from API call ${apiCall + 1}`);
      allArticles.push(...articles);

      if (apiCall < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Remove duplicates and process articles
    const uniqueArticles = [];
    const seenTitles = new Set();
    
    for (const article of allArticles) {
      const symbol = article.entities?.[0]?.symbol;
      if (!symbol || !MAGNIFICENT_7.includes(symbol)) continue;
      
      const uniqueKey = `${symbol}-${article.title}`;
      if (!seenTitles.has(uniqueKey)) {
        seenTitles.add(uniqueKey);
        uniqueArticles.push(article);
      }
    }

    console.log(`Unique Magnificent 7 articles: ${uniqueArticles.length}`);

    // Sort by date
    uniqueArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    const primaryAnalysis = new Map();
    const allProcessedArticles = [];

    // Process main analysis articles (one per stock)
    for (const article of uniqueArticles) {
      const symbol = article.entities?.[0]?.symbol;
      
      if (!symbol || !MAGNIFICENT_7.includes(symbol)) continue;

      if (!primaryAnalysis.has(symbol)) {
        console.log(`Analyzing article for ${symbol} with OpenAI: ${article.title}`);

        try {
          const analysisPrompt = `
You are a professional financial analyst. Analyze this news article and provide a JSON response with the following structure:

{
  "confidence": "number between 1-100 representing your confidence level",
  "sentiment": "string that MUST be either 'Bullish', 'Bearish', or 'Neutral'",
  "category": "string describing the news category"
}

Article to analyze:
Title: ${article.title}
Description: ${article.description || 'No description available'}
Asset Symbol: ${symbol}
Published: ${article.published_at}
`;

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
                  content: 'You are a professional financial analyst. Provide clear, actionable market analysis in valid JSON format only.'
                },
                {
                  role: 'user',
                  content: analysisPrompt
                }
              ],
              response_format: { type: "json_object" },
              temperature: 0.7
            }),
          });

          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            const analysis = JSON.parse(chatData.choices[0].message.content);

            const processedArticle = {
              symbol,
              title: article.title,
              description: article.description || `Latest market analysis for ${symbol}`,
              confidence: analysis.confidence,
              sentiment: analysis.sentiment,
              category: analysis.category || 'Technology Stock',
              url: article.url,
              published_at: article.published_at,
              ai_confidence: analysis.confidence,
              ai_sentiment: analysis.sentiment,
              ai_reasoning: `OpenAI analysis of: ${article.title}`,
              is_main_analysis: true,
              is_historical: false
            };

            primaryAnalysis.set(symbol, processedArticle);
            console.log(`✅ Successfully analyzed ${symbol} with OpenAI: ${analysis.sentiment} sentiment, ${analysis.confidence}% confidence`);
          }
        } catch (error) {
          console.error(`❌ Error analyzing article for ${symbol} with OpenAI:`, error);
        }
      }
    }

    // Create historical analysis for stocks without current news
    for (const symbol of MAGNIFICENT_7) {
      if (!primaryAnalysis.has(symbol)) {
        console.log(`Creating historical analysis for ${symbol}...`);
        
        const historicalAnalysis = {
          symbol,
          title: `${symbol} Market Analysis - Historical Data*`,
          description: `Historical market analysis for ${symbol} based on recent trends and market patterns.`,
          confidence: 65,
          sentiment: 'Neutral',
          category: 'Technology Stock',
          url: `https://finance.yahoo.com/quote/${symbol}`,
          published_at: new Date().toISOString(),
          ai_confidence: 65,
          ai_sentiment: 'Neutral',
          ai_reasoning: `*Historical analysis based on market trends. No current news available for ${symbol}.`,
          is_main_analysis: true,
          is_historical: true
        };

        primaryAnalysis.set(symbol, historicalAnalysis);
      }
    }

    // Process additional headlines with AI analysis
    for (const article of uniqueArticles) {
      const symbol = article.entities?.[0]?.symbol;
      
      if (symbol && MAGNIFICENT_7.includes(symbol)) {
        const mainArticle = primaryAnalysis.get(symbol);
        if (mainArticle && !mainArticle.is_historical && mainArticle.title === article.title) {
          continue;
        }

        try {
          const headlinePrompt = `Analyze this article and provide JSON response:
{
  "sentiment": "Bullish, Bearish, or Neutral",
  "confidence": "number between 1-100"
}

Title: ${article.title}
Symbol: ${symbol}`;

          const headlineResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are a financial analyst providing quick market sentiment analysis.' },
                { role: 'user', content: headlinePrompt }
              ],
              response_format: { type: "json_object" },
              temperature: 0.6
            }),
          });

          if (headlineResponse.ok) {
            const headlineData = await headlineResponse.json();
            const headlineAnalysis = JSON.parse(headlineData.choices[0].message.content);

            allProcessedArticles.push({
              symbol,
              title: article.title,
              description: article.description,
              url: article.url,
              published_at: article.published_at,
              category: 'Technology Stock',
              ai_confidence: headlineAnalysis.confidence,
              ai_sentiment: headlineAnalysis.sentiment,
              ai_reasoning: `AI analysis: ${headlineAnalysis.sentiment} sentiment with ${headlineAnalysis.confidence}% confidence`,
              is_main_analysis: false
            });

            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (error) {
          console.error(`❌ Error analyzing headline for ${symbol}:`, error);
        }
      }
    }

    // Store articles in database
    console.log('Storing Magnificent 7 articles in database...');
    
    // Clear existing Magnificent 7 articles
    for (const symbol of MAGNIFICENT_7) {
      await supabase.from('news_articles').delete().eq('symbol', symbol);
    }

    // Insert main analysis articles
    for (const article of primaryAnalysis.values()) {
      const { error } = await supabase
        .from('news_articles')
        .insert({
          title: article.title,
          description: article.description,
          symbol: article.symbol,
          url: article.url,
          published_at: article.published_at,
          ai_confidence: article.ai_confidence,
          ai_sentiment: article.ai_sentiment,
          ai_reasoning: article.ai_reasoning,
          category: article.category
        });

      if (error) {
        console.error(`❌ Database error for ${article.symbol}:`, error);
      } else {
        console.log(`✅ Stored analysis for ${article.symbol}`);
      }
    }

    // Insert additional headlines
    for (const article of allProcessedArticles) {
      await supabase
        .from('news_articles')
        .insert({
          title: article.title,
          description: article.description,
          symbol: article.symbol,
          url: article.url,
          published_at: article.published_at,
          ai_confidence: article.ai_confidence,
          ai_sentiment: article.ai_sentiment,
          ai_reasoning: article.ai_reasoning,
          category: article.category
        });
    }

    const summary = {
      success: true,
      assetType: 'Magnificent 7',
      mainAnalyses: primaryAnalysis.size,
      additionalHeadlines: allProcessedArticles.length,
      totalArticles: uniqueArticles.length,
      message: 'Magnificent 7 stocks processed successfully'
    };

    console.log(`🎉 Successfully processed ${summary.mainAnalyses} main analyses and ${summary.additionalHeadlines} additional headlines for Magnificent 7`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in fetch-magnificent-7 function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      assetType: 'Magnificent 7'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
