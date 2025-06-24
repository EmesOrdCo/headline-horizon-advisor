
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
      throw new Error('Missing API keys - MarketAux or OpenAI');
    }

    console.log('Starting news fetching with OpenAI analysis for Magnificent 7...');
    
    const allArticles = [];
    const magnificentAnalysis = new Map();
    const allOtherAnalyzedArticles = [];

    // Make 2 API calls to get 40 articles total
    for (let apiCall = 0; apiCall < 2; apiCall++) {
      console.log(`Making MarketAux API call ${apiCall + 1}/2...`);
      
      const newsResponse = await fetch(
        `https://api.marketaux.com/v1/news/all?symbols=${MAGNIFICENT_7.join(',')}&filter_entities=true&language=en&limit=20&page=${apiCall}&api_token=${marketauxApiKey}`
      );

      if (!newsResponse.ok) {
        throw new Error(`MarketAux API error: ${newsResponse.status}`);
      }

      const newsData = await newsResponse.json();
      const articles = newsData.data || [];
      
      console.log(`Fetched ${articles.length} articles from API call ${apiCall + 1}`);
      allArticles.push(...articles);

      // Add delay between API calls
      if (apiCall < 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Total articles fetched: ${allArticles.length}`);

    // Sort all articles by published date first to ensure chronological order
    allArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    // Process articles for Magnificent 7 main analysis (one per stock with OpenAI)
    for (const article of allArticles) {
      const symbol = article.entities?.[0]?.symbol;
      
      if (!symbol || !MAGNIFICENT_7.includes(symbol)) {
        continue;
      }

      // For main analysis cards - only one per stock, analyzed by OpenAI
      if (!magnificentAnalysis.has(symbol)) {
        console.log(`Analyzing article for ${symbol} with OpenAI: ${article.title}`);

        try {
          const analysisPrompt = `
You are a professional financial analyst. Analyze this news article and provide a JSON response with the following structure:

{
  "confidence": "number between 1-100 representing your confidence level",
  "sentiment": "string that MUST be either 'Bullish', 'Bearish', or 'Neutral'",
  "category": "string describing the news category"
}

Rules:
1. Make a clear decision on sentiment - avoid neutral unless truly uncertain
2. Base confidence on the clarity and impact of the news
3. Consider the stock's recent performance and market context

Article to analyze:
Title: ${article.title}
Description: ${article.description || 'No description available'}
Stock Symbol: ${symbol}
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

          if (!chatResponse.ok) {
            console.error(`OpenAI API error for ${symbol}: ${chatResponse.status} - ${await chatResponse.text()}`);
            continue;
          }

          const chatData = await chatResponse.json();
          
          if (!chatData.choices || !chatData.choices[0] || !chatData.choices[0].message) {
            console.error(`Invalid OpenAI response for ${symbol}:`, chatData);
            continue;
          }

          const analysis = JSON.parse(chatData.choices[0].message.content);

          const processedArticle = {
            symbol,
            title: article.title,
            description: article.description || `Latest market analysis for ${symbol}`,
            confidence: analysis.confidence,
            sentiment: analysis.sentiment,
            category: analysis.category || 'Technology',
            url: article.url,
            published_at: article.published_at,
            ai_confidence: analysis.confidence,
            ai_sentiment: analysis.sentiment,
            ai_reasoning: `OpenAI analysis of: ${article.title}. ${article.description ? article.description.substring(0, 200) + '...' : ''}`,
            is_main_analysis: true,
            is_historical: false
          };

          magnificentAnalysis.set(symbol, processedArticle);
          console.log(`✅ Successfully analyzed ${symbol} with OpenAI: ${analysis.sentiment} sentiment, ${analysis.confidence}% confidence`);

        } catch (error) {
          console.error(`❌ Error analyzing article for ${symbol} with OpenAI:`, error);
        }
      }
    }

    // For stocks without current analysis, create historical data with OpenAI analysis
    for (const symbol of MAGNIFICENT_7) {
      if (!magnificentAnalysis.has(symbol)) {
        console.log(`Creating historical analysis for ${symbol} using OpenAI...`);
        
        try {
          const historicalPrompt = `
Analyze ${symbol} stock based on general market knowledge and recent trends. Provide a JSON response:

{
  "confidence": "number between 50-75 for historical analysis",
  "sentiment": "Bullish, Bearish, or Neutral based on general market sentiment",
  "category": "Technology"
}

Consider ${symbol}'s general market position, recent trends, and typical volatility patterns.
`;

          const historicalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  content: 'You are a financial analyst providing historical market analysis based on general market knowledge.'
                },
                {
                  role: 'user',
                  content: historicalPrompt
                }
              ],
              response_format: { type: "json_object" },
              temperature: 0.5
            }),
          });

          if (historicalResponse.ok) {
            const historicalData = await historicalResponse.json();
            const analysis = JSON.parse(historicalData.choices[0].message.content);

            const historicalAnalysis = {
              symbol,
              title: `${symbol} Market Analysis - Historical Data*`,
              description: `Historical market analysis for ${symbol} based on recent trends and market patterns.`,
              confidence: analysis.confidence,
              sentiment: analysis.sentiment,
              category: analysis.category,
              url: `https://finance.yahoo.com/quote/${symbol}`,
              published_at: new Date().toISOString(),
              ai_confidence: analysis.confidence,
              ai_sentiment: analysis.sentiment,
              ai_reasoning: `*Historical analysis based on market trends. No current news available for ${symbol}.`,
              is_main_analysis: true,
              is_historical: true
            };

            magnificentAnalysis.set(symbol, historicalAnalysis);
            console.log(`✅ Created historical analysis for ${symbol}: ${analysis.sentiment} sentiment`);
          }
        } catch (error) {
          console.error(`❌ Error creating historical analysis for ${symbol}:`, error);
          
          // Fallback to basic historical data
          const fallbackAnalysis = {
            symbol,
            title: `${symbol} Market Analysis - Historical Data*`,
            description: `Basic historical analysis for ${symbol}.`,
            confidence: 60,
            sentiment: 'Neutral',
            category: 'Technology',
            url: `https://finance.yahoo.com/quote/${symbol}`,
            published_at: new Date().toISOString(),
            ai_confidence: 60,
            ai_sentiment: 'Neutral',
            ai_reasoning: `*Basic historical analysis. No current news or AI analysis available for ${symbol}.`,
            is_main_analysis: true,
            is_historical: true
          };

          magnificentAnalysis.set(symbol, fallbackAnalysis);
        }
      }
    }

    // Process ALL remaining articles with AI analysis - ensuring every single article gets analyzed
    console.log('Starting AI analysis of ALL remaining headlines...');
    let analysisCount = 0;

    for (const article of allArticles) {
      const symbol = article.entities?.[0]?.symbol;
      
      if (symbol && MAGNIFICENT_7.includes(symbol)) {
        // Skip articles already used for main analysis
        const mainArticle = magnificentAnalysis.get(symbol);
        if (mainArticle && !mainArticle.is_historical && mainArticle.title === article.title) {
          continue;
        }

        console.log(`Analyzing headline ${analysisCount + 1} for ${symbol}: ${article.title.substring(0, 50)}...`);

        try {
          const headlinePrompt = `Analyse this article, decide if you are, as a result, bullish, bearish or neutral on the stock the article is about, and how confident you are out of 100% on that statement.

Article:
Title: ${article.title}
Description: ${article.description || 'No description available'}
Stock Symbol: ${symbol}

Provide JSON response:
{
  "sentiment": "Bullish, Bearish, or Neutral",
  "confidence": "number between 1-100"
}`;

          const headlineResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  content: 'You are a financial analyst providing quick market sentiment analysis.'
                },
                {
                  role: 'user',
                  content: headlinePrompt
                }
              ],
              response_format: { type: "json_object" },
              temperature: 0.6
            }),
          });

          if (headlineResponse.ok) {
            const headlineData = await headlineResponse.json();
            const headlineAnalysis = JSON.parse(headlineData.choices[0].message.content);

            allOtherAnalyzedArticles.push({
              symbol,
              title: article.title,
              description: article.description,
              url: article.url,
              published_at: article.published_at,
              category: 'Technology',
              ai_confidence: headlineAnalysis.confidence,
              ai_sentiment: headlineAnalysis.sentiment,
              ai_reasoning: `AI analysis: ${headlineAnalysis.sentiment} sentiment with ${headlineAnalysis.confidence}% confidence`,
              is_main_analysis: false
            });

            analysisCount++;
            console.log(`✅ Analyzed headline for ${symbol}: ${headlineAnalysis.sentiment} (${headlineAnalysis.confidence}%)`);
            
            // Add delay between analysis calls to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
          } else {
            console.error(`Failed to analyze headline for ${symbol}: ${headlineResponse.status}`);
            // Still add the article but without AI analysis - this should be rare
            allOtherAnalyzedArticles.push({
              symbol,
              title: article.title,
              description: article.description,
              url: article.url,
              published_at: article.published_at,
              category: 'Technology',
              ai_confidence: 50, // Default neutral confidence
              ai_sentiment: 'Neutral', // Default neutral sentiment
              ai_reasoning: 'AI analysis failed - default neutral assessment',
              is_main_analysis: false
            });
          }
        } catch (error) {
          console.error(`❌ Error analyzing headline for ${symbol}:`, error);
          
          // Add with default analysis to ensure consistency
          allOtherAnalyzedArticles.push({
            symbol,
            title: article.title,
            description: article.description,
            url: article.url,
            published_at: article.published_at,
            category: 'Technology',
            ai_confidence: 50, // Default neutral confidence
            ai_sentiment: 'Neutral', // Default neutral sentiment
            ai_reasoning: 'AI analysis error - default neutral assessment',
            is_main_analysis: false
          });
        }
      }
    }

    // Sort all other articles by published date to ensure strict chronological order
    allOtherAnalyzedArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    // Store all articles in database
    // First, clear existing articles
    console.log('Clearing existing articles from database...');
    await supabase.from('news_articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert main analysis articles (including historical)
    console.log('Inserting main analysis articles...');
    for (const article of magnificentAnalysis.values()) {
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
        console.error(`❌ Database error for main ${article.symbol}:`, error);
      } else {
        console.log(`✅ Stored analysis for ${article.symbol}`);
      }
    }

    // Insert ALL analyzed other headlines in chronological order
    console.log('Inserting all analyzed headlines in chronological order...');
    for (const article of allOtherAnalyzedArticles) {
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
        console.error(`❌ Database error for headline ${article.symbol}:`, error);
      }
    }

    const summary = {
      success: true,
      mainAnalyses: magnificentAnalysis.size,
      analyzedHeadlines: allOtherAnalyzedArticles.length,
      totalArticlesProcessed: allArticles.length,
      openaiAnalysisCount: Array.from(magnificentAnalysis.values()).filter(a => !a.is_historical).length + allOtherAnalyzedArticles.length,
      historicalAnalysisCount: Array.from(magnificentAnalysis.values()).filter(a => a.is_historical).length,
      message: 'All articles now have AI analysis and are in chronological order'
    };

    console.log(`🎉 Successfully processed ${summary.mainAnalyses} main analyses and ${summary.analyzedHeadlines} analyzed headlines with AI in chronological order`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in fetch-news function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
