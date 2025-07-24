
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

// Primary assets for main analysis
const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
const MAJOR_INDEX_FUNDS = ['SPY', 'QQQ', 'IWM', 'VTI', 'VOO'];
const MAJOR_CRYPTOCURRENCIES = ['BTC-USD', 'ETH-USD', 'ADA-USD', 'SOL-USD', 'DOGE-USD'];

// Combine all primary assets
const PRIMARY_ASSETS = [...MAGNIFICENT_7, ...MAJOR_INDEX_FUNDS, ...MAJOR_CRYPTOCURRENCIES];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Temporarily disable Marketaux API calls
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Marketaux API calls temporarily disabled',
      summary: { success: true, totalArticles: 0 }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );

  try {
    const marketauxApiKey = Deno.env.get('MARKETAUX_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!marketauxApiKey || !openaiApiKey) {
      throw new Error('Missing API keys - MarketAux or OpenAI');
    }

    console.log('Starting news fetching with OpenAI analysis for all primary assets...');
    
    const allArticles = [];
    const primaryAnalysis = new Map();
    const allProcessedArticles = [];

    // First, fetch news for primary assets (6 API calls to get 120 articles)
    console.log('Fetching primary assets news...');
    for (let apiCall = 0; apiCall < 6; apiCall++) {
      console.log(`Making primary assets API call ${apiCall + 1}/6...`);
      
      const newsResponse = await fetch(
        `https://api.marketaux.com/v1/news/all?symbols=${PRIMARY_ASSETS.join(',')}&filter_entities=true&language=en&limit=20&page=${apiCall}&api_token=${marketauxApiKey}`
      );

      if (!newsResponse.ok) {
        console.error(`MarketAux API error for primary assets: ${newsResponse.status}`);
        continue;
      }

      const newsData = await newsResponse.json();
      const articles = newsData.data || [];
      
      console.log(`Fetched ${articles.length} primary assets articles from API call ${apiCall + 1}`);
      allArticles.push(...articles);

      // Add delay between API calls
      if (apiCall < 5) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Then, fetch general market news (4 API calls to get 80 more articles)
    console.log('Fetching general market news...');
    for (let apiCall = 0; apiCall < 4; apiCall++) {
      console.log(`Making general market API call ${apiCall + 1}/4...`);
      
      const newsResponse = await fetch(
        `https://api.marketaux.com/v1/news/all?filter_entities=true&language=en&limit=20&page=${apiCall}&api_token=${marketauxApiKey}`
      );

      if (!newsResponse.ok) {
        console.error(`MarketAux API error for general market: ${newsResponse.status}`);
        continue;
      }

      const newsData = await newsResponse.json();
      const articles = newsData.data || [];
      
      console.log(`Fetched ${articles.length} general market articles from API call ${apiCall + 1}`);
      allArticles.push(...articles);

      // Add delay between API calls
      if (apiCall < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Total articles fetched: ${allArticles.length}`);

    // Remove duplicates based on title and symbol combination
    const uniqueArticles = [];
    const seenTitles = new Set();
    
    for (const article of allArticles) {
      const symbol = article.entities?.[0]?.symbol;
      if (!symbol) {
        continue;
      }
      
      const uniqueKey = `${symbol}-${article.title}`;
      if (!seenTitles.has(uniqueKey)) {
        seenTitles.add(uniqueKey);
        uniqueArticles.push(article);
      }
    }

    console.log(`Unique articles after deduplication: ${uniqueArticles.length}`);

    // Sort all unique articles by published date first to ensure chronological order
    uniqueArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    // Process articles for primary assets main analysis (one per asset with OpenAI)
    for (const article of uniqueArticles) {
      const symbol = article.entities?.[0]?.symbol;
      
      if (!symbol || !PRIMARY_ASSETS.includes(symbol)) {
        continue;
      }

      // For main analysis cards - only one per asset, analyzed by OpenAI
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

Rules:
1. Make a clear decision on sentiment - avoid neutral unless truly uncertain
2. Base confidence on the clarity and impact of the news
3. Consider the asset's recent performance and market context

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
            category: analysis.category || 'Financial Markets',
            url: article.url,
            published_at: article.published_at,
            ai_confidence: analysis.confidence,
            ai_sentiment: analysis.sentiment,
            ai_reasoning: `OpenAI analysis of: ${article.title}. ${article.description ? article.description.substring(0, 200) + '...' : ''}`,
            is_main_analysis: true,
            is_historical: false
          };

          primaryAnalysis.set(symbol, processedArticle);
          console.log(`✅ Successfully analyzed ${symbol} with OpenAI: ${analysis.sentiment} sentiment, ${analysis.confidence}% confidence`);

        } catch (error) {
          console.error(`❌ Error analyzing article for ${symbol} with OpenAI:`, error);
        }
      }
    }

    // For assets without current analysis, create historical data with OpenAI analysis
    for (const symbol of PRIMARY_ASSETS) {
      if (!primaryAnalysis.has(symbol)) {
        console.log(`Creating historical analysis for ${symbol} using OpenAI...`);
        
        try {
          const assetType = MAGNIFICENT_7.includes(symbol) ? 'Technology Stock' :
                           MAJOR_INDEX_FUNDS.includes(symbol) ? 'Index Fund' : 'Cryptocurrency';
          
          const historicalPrompt = `
Analyze ${symbol} (${assetType}) based on general market knowledge and recent trends. Provide a JSON response:

{
  "confidence": "number between 50-75 for historical analysis",
  "sentiment": "Bullish, Bearish, or Neutral based on general market sentiment",
  "category": "${assetType}"
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

            primaryAnalysis.set(symbol, historicalAnalysis);
            console.log(`✅ Created historical analysis for ${symbol}: ${analysis.sentiment} sentiment`);
          }
        } catch (error) {
          console.error(`❌ Error creating historical analysis for ${symbol}:`, error);
          
          // Fallback to basic historical data
          const assetType = MAGNIFICENT_7.includes(symbol) ? 'Technology' :
                           MAJOR_INDEX_FUNDS.includes(symbol) ? 'Index Fund' : 'Cryptocurrency';
          
          const fallbackAnalysis = {
            symbol,
            title: `${symbol} Market Analysis - Historical Data*`,
            description: `Basic historical analysis for ${symbol}.`,
            confidence: 60,
            sentiment: 'Neutral',
            category: assetType,
            url: `https://finance.yahoo.com/quote/${symbol}`,
            published_at: new Date().toISOString(),
            ai_confidence: 60,
            ai_sentiment: 'Neutral',
            ai_reasoning: `*Basic historical analysis. No current news or AI analysis available for ${symbol}.`,
            is_main_analysis: true,
            is_historical: true
          };

          primaryAnalysis.set(symbol, fallbackAnalysis);
        }
      }
    }

    // Process ALL remaining unique articles with AI analysis - including non-primary assets
    console.log('Starting AI analysis of ALL remaining unique headlines...');
    let analysisCount = 0;

    for (const article of uniqueArticles) {
      const symbol = article.entities?.[0]?.symbol;
      
      if (symbol) {
        // Skip articles already used for primary assets main analysis
        if (PRIMARY_ASSETS.includes(symbol)) {
          const mainArticle = primaryAnalysis.get(symbol);
          if (mainArticle && !mainArticle.is_historical && mainArticle.title === article.title) {
            continue;
          }
        }

        console.log(`Analyzing headline ${analysisCount + 1} for ${symbol}: ${article.title.substring(0, 50)}...`);

        try {
          const headlinePrompt = `Analyse this article, decide if you are, as a result, bullish, bearish or neutral on the asset the article is about, and how confident you are out of 100% on that statement.

Article:
Title: ${article.title}
Description: ${article.description || 'No description available'}
Asset Symbol: ${symbol}

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

            allProcessedArticles.push({
              symbol,
              title: article.title,
              description: article.description,
              url: article.url,
              published_at: article.published_at,
              category: 'Market News',
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
            // Still add the article but without AI analysis
            allProcessedArticles.push({
              symbol,
              title: article.title,
              description: article.description,
              url: article.url,
              published_at: article.published_at,
              category: 'Market News',
              ai_confidence: 50,
              ai_sentiment: 'Neutral',
              ai_reasoning: 'AI analysis failed - default neutral assessment',
              is_main_analysis: false
            });
          }
        } catch (error) {
          console.error(`❌ Error analyzing headline for ${symbol}:`, error);
          
          // Add with default analysis to ensure consistency
          allProcessedArticles.push({
            symbol,
            title: article.title,
            description: article.description,
            url: article.url,
            published_at: article.published_at,
            category: 'Market News',
            ai_confidence: 50,
            ai_sentiment: 'Neutral',
            ai_reasoning: 'AI analysis error - default neutral assessment',
            is_main_analysis: false
          });
        }
      }
    }

    // Sort all processed articles by published date to ensure strict chronological order
    allProcessedArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    // Store all articles in database
    // First, clear existing articles
    console.log('Clearing existing articles from database...');
    await supabase.from('news_articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert main analysis articles (including historical)
    console.log('Inserting main analysis articles...');
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
        console.error(`❌ Database error for main ${article.symbol}:`, error);
      } else {
        console.log(`✅ Stored analysis for ${article.symbol}`);
      }
    }

    // Insert ALL analyzed unique headlines in chronological order
    console.log('Inserting all analyzed unique headlines in chronological order...');
    for (const article of allProcessedArticles) {
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
      mainAnalyses: primaryAnalysis.size,
      analyzedHeadlines: allProcessedArticles.length,
      totalUniqueArticlesProcessed: uniqueArticles.length,
      openaiAnalysisCount: Array.from(primaryAnalysis.values()).filter(a => !a.is_historical).length + allProcessedArticles.length,
      historicalAnalysisCount: Array.from(primaryAnalysis.values()).filter(a => a.is_historical).length,
      duplicatesRemoved: allArticles.length - uniqueArticles.length,
      primaryAssetsCount: Array.from(primaryAnalysis.values()).length,
      allAssetsHeadlinesCount: allProcessedArticles.length,
      message: 'All unique articles from primary assets and general market have AI analysis and are in chronological order'
    };

    console.log(`🎉 Successfully processed ${summary.mainAnalyses} main analyses and ${summary.analyzedHeadlines} unique analyzed headlines from ALL assets with AI in chronological order. Removed ${summary.duplicatesRemoved} duplicates.`);

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
