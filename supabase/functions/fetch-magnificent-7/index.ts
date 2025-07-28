
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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_2') || Deno.env.get('OPENAI_API_KEY');

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

    // Remove duplicates based on title
    const uniqueArticles = [];
    const seenTitles = new Set();
    
    for (const article of allArticles) {
      if (!seenTitles.has(article.title)) {
        seenTitles.add(article.title);
        uniqueArticles.push(article);
      }
    }

    console.log(`Unique Magnificent 7 articles: ${uniqueArticles.length}`);

    // Sort by date
    uniqueArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    // Group articles by impacted stocks
    const stockArticles = new Map();
    
    // Initialize empty arrays for each stock
    MAGNIFICENT_7.forEach(symbol => {
      stockArticles.set(symbol, []);
    });

    // Process each article to determine stock impact and group them
    for (const article of uniqueArticles.slice(0, 20)) {
      console.log(`Analyzing article impact: ${article.title}`);

      try {
        const impactAnalysisPrompt = `
You are a professional financial analyst. Analyze this news article and determine which of the following Magnificent 7 stocks would be significantly impacted by this news:

Stocks to consider: ${MAGNIFICENT_7.join(', ')}

Article:
Title: ${article.title}
Description: ${article.description || 'No description available'}
Published: ${article.published_at}

Provide a JSON response with this structure:
{
  "impacted_stocks": ["SYMBOL1", "SYMBOL2"],
  "reasoning": "Brief explanation of why these stocks are impacted"
}

Only include stocks that would be meaningfully affected by this news. If no stocks would be significantly impacted, return an empty array for impacted_stocks.`;

        const impactResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: 'You are a professional financial analyst specializing in identifying stock market impacts. Provide clear analysis in valid JSON format only.'
              },
              {
                role: 'user',
                content: impactAnalysisPrompt
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
          }),
        });

        if (!impactResponse.ok) {
          console.error(`OpenAI impact analysis failed for article: ${article.title}`);
          continue;
        }

        const impactData = await impactResponse.json();
        const impactAnalysis = JSON.parse(impactData.choices[0].message.content);
        
        console.log(`Impact analysis for "${article.title}": ${impactAnalysis.impacted_stocks.join(', ')}`);

        if (impactAnalysis.impacted_stocks && impactAnalysis.impacted_stocks.length > 0) {
          // Add this article to each impacted stock's collection
          for (const symbol of impactAnalysis.impacted_stocks) {
            if (MAGNIFICENT_7.includes(symbol)) {
              const existingArticles = stockArticles.get(symbol);
              existingArticles.push(article);
              stockArticles.set(symbol, existingArticles);
            }
          }
        }

        // Delay between articles to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Error analyzing article "${article.title}":`, error);
      }
    }

    const processedAnalyses = [];

    // Create composite analysis for each stock that has relevant articles
    for (const [symbol, articles] of stockArticles.entries()) {
      if (articles.length > 0) {
        console.log(`Creating composite analysis for ${symbol} based on ${articles.length} articles...`);

        try {
          // Prepare article summaries for composite analysis
          const articleSummaries = articles.slice(0, 5).map((article, index) => 
            `Article ${index + 1}:
Title: ${article.title}
Description: ${article.description || 'No description available'}
Published: ${article.published_at}
URL: ${article.url}`
          ).join('\n\n');

          const compositePrompt = `
You are a professional financial analyst. Analyze the following news articles collectively for their impact on ${symbol} stock and provide a comprehensive composite analysis:

${articleSummaries}

Based on all these articles together, provide a JSON response:
{
  "confidence": "number between 60-100 representing the STRENGTH and CONVICTION of your directional prediction for ${symbol}",
  "sentiment": "string that MUST be either 'Bullish', 'Bearish', or 'Neutral' based on the collective impact",
  "category": "string describing the dominant news category across articles",
  "reasoning": "comprehensive explanation analyzing the collective impact of all articles on ${symbol}"
}

CRITICAL CONFIDENCE DEFINITION:
Confidence represents how STRONGLY and DECISIVELY the news supports your directional prediction (bullish/bearish).
You should be as confident as possible given the available evidence. This is about prediction strength, not analysis uncertainty.

CONFIDENCE SCALE (use FULL range 60-100):
- 95-100: (5 dots) Overwhelming directional evidence - major breaking news, clear market-moving events
- 86-94: (4 dots) Strong directional signals - significant developments with clear market implications  
- 76-85: (3 dots) Solid directional evidence - meaningful news with moderate market impact
- 66-75: (2 dots) Weak directional signals - minor news with limited market relevance
- 60-65: (1 dot) Very weak signals - minimal news or highly contradictory information

Be DECISIVE and CONFIDENT in your directional assessment. Given the data, push toward higher confidence levels when the news clearly supports a direction.

Focus on the overall trend and sentiment across all articles for ${symbol}.`;

          const compositeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  content: 'You are a professional financial analyst. Provide comprehensive market analysis based on multiple news sources in valid JSON format only.'
                },
                {
                  role: 'user',
                  content: compositePrompt
                }
              ],
              response_format: { type: "json_object" },
              temperature: 0.7
            }),
          });

          if (compositeResponse.ok) {
            const compositeData = await compositeResponse.json();
            const analysis = JSON.parse(compositeData.choices[0].message.content);

            // Create source links array
            const sourceLinks = articles.slice(0, 5).map(article => ({
              title: article.title,
              url: article.url,
              published_at: article.published_at
            }));

            processedAnalyses.push({
              symbol,
              title: `${symbol} Composite Market Analysis`,
              description: `Comprehensive analysis based on ${articles.length} recent news articles`,
              url: `https://finance.yahoo.com/quote/${symbol}`,
              published_at: new Date().toISOString(),
              category: analysis.category || 'Technology Stock',
              ai_confidence: analysis.confidence,
              ai_sentiment: analysis.sentiment,
              ai_reasoning: analysis.reasoning,
              source_links: JSON.stringify(sourceLinks),
              is_main_analysis: true,
              is_historical: false
            });

            console.log(`✅ Successfully created composite analysis for ${symbol}: ${analysis.sentiment} sentiment, ${analysis.confidence}% confidence based on ${articles.length} articles`);
          }

          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`❌ Error creating composite analysis for ${symbol}:`, error);
        }
      } else {
        // Create historical analysis for stocks without current news
        console.log(`Creating historical analysis for ${symbol}...`);
        
        processedAnalyses.push({
          symbol,
          title: `${symbol} Market Analysis - Historical Data*`,
          description: `Historical market analysis for ${symbol} based on recent trends and market patterns.`,
          url: `https://finance.yahoo.com/quote/${symbol}`,
          published_at: new Date().toISOString(),
          category: 'Technology Stock',
          ai_confidence: 65,
          ai_sentiment: 'Neutral',
          ai_reasoning: `*Historical analysis based on market trends. No current news available for ${symbol}.`,
          source_links: JSON.stringify([]),
          is_main_analysis: true,
          is_historical: true
        });
      }
    }

    // Store articles in database
    console.log('Storing Magnificent 7 composite analyses in database...');
    
    // Clear existing Magnificent 7 articles
    for (const symbol of MAGNIFICENT_7) {
      await supabase.from('news_articles').delete().eq('symbol', symbol);
    }

    // Insert processed analyses
    for (const analysis of processedAnalyses) {
      const { error } = await supabase
        .from('news_articles')
        .insert({
          title: analysis.title,
          description: analysis.description,
          symbol: analysis.symbol,
          url: analysis.url,
          published_at: analysis.published_at,
          ai_confidence: analysis.ai_confidence,
          ai_sentiment: analysis.ai_sentiment,
          ai_reasoning: analysis.ai_reasoning,
          category: analysis.category,
          source_links: analysis.source_links
        });

      if (error) {
        console.error(`❌ Database error for ${analysis.symbol}:`, error);
      } else {
        console.log(`✅ Stored composite analysis for ${analysis.symbol}`);
      }
    }

    const summary = {
      success: true,
      assetType: 'Magnificent 7',
      analysesProcessed: processedAnalyses.length,
      stocksAnalyzed: processedAnalyses.filter(a => !a.is_historical).length,
      message: 'Magnificent 7 stocks processed successfully with composite analysis from multiple sources'
    };

    console.log(`🎉 Successfully processed ${summary.analysesProcessed} composite analyses for ${summary.stocksAnalyzed} stocks`);

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
