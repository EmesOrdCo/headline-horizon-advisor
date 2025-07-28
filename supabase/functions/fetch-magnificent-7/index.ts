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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const marketauxApiKey = Deno.env.get('MARKETAUX_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_2') || Deno.env.get('OPENAI_API_KEY');

    if (!marketauxApiKey || !openaiApiKey) {
      throw new Error('Missing required API keys');
    }

    console.log('Starting Magnificent 7 news fetching...');

    const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
    const magnificent7Query = MAGNIFICENT_7.join(',');
    
    // Fetch articles from multiple API calls to get more comprehensive coverage
    const allArticles = [];
    const apiCalls = 3;
    
    for (let i = 1; i <= apiCalls; i++) {
      console.log(`Making Magnificent 7 API call ${i}/${apiCalls}...`);
      
      const offset = (i - 1) * 20;
      const response = await fetch(
        `https://api.marketaux.com/v1/news/all?symbols=${magnificent7Query}&filter_entities=true&language=en&page=${i}&limit=20&api_token=${marketauxApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          allArticles.push(...data.data);
          console.log(`Fetched ${data.data.length} Magnificent 7 articles from API call ${i}`);
        }
      }
    }

    // Remove duplicates based on URL
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.url === article.url)
    );

    console.log(`Unique Magnificent 7 articles: ${uniqueArticles.length}`);

    // Clear existing Magnificent 7 articles first
    for (const symbol of MAGNIFICENT_7) {
      await supabase.from('news_articles').delete().eq('symbol', symbol);
    }

    // Store ALL articles immediately for hyperlinking, regardless of AI analysis success
    console.log('Storing all articles for immediate hyperlinking...');
    const allStoredArticles = [];
    
    for (const article of uniqueArticles) {
      const articleToStore = {
        title: article.title,
        description: article.description || 'No description available',
        url: article.url,
        published_at: article.published_at,
        symbol: 'MARKET', // Will be updated based on analysis
        category: 'Market News',
        ai_confidence: 70, // Default confidence
        ai_sentiment: 'Neutral', // Default sentiment
        ai_reasoning: 'Market news article - analysis pending',
        source_links: JSON.stringify([{
          title: article.title,
          url: article.url,
          published_at: article.published_at,
          description: article.description || 'No description available'
        }])
      };

      allStoredArticles.push(articleToStore);
      
      // Store article immediately
      const { error } = await supabase
        .from('news_articles')
        .insert(articleToStore);
        
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error storing article ${article.title}:`, error);
      }
    }

    // Now create stock-specific analysis
    const stockArticles = new Map();
    MAGNIFICENT_7.forEach(symbol => {
      stockArticles.set(symbol, []);
    });

    // Process articles for AI analysis (but articles are already stored for hyperlinking)
    for (const article of uniqueArticles.slice(0, 20)) {
      console.log(`Analyzing article impact: ${article.title}`);

      try {
        const impactAnalysisPrompt = `
Analyze this news article and determine which stocks from the Magnificent 7 would be meaningfully impacted by this news.

Magnificent 7 stocks: AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META

Article:
Title: ${article.title}
Description: ${article.description}
URL: ${article.url}
Published: ${article.published_at}

Respond in JSON format:
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

Be DECISIVE and CONFIDENT in your directional assessment. Given the data, push toward higher confidence levels when the news clearly supports a direction.`;

          const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  content: 'You are a professional financial analyst. Provide comprehensive market analysis in valid JSON format only.'
                },
                {
                  role: 'user',
                  content: compositePrompt
                }
              ],
              response_format: { type: "json_object" },
              temperature: 0.3
            }),
          });

          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            const analysis = JSON.parse(analysisData.choices[0].message.content);

            // Store the composite analysis with source links
            processedAnalyses.push({
              symbol,
              title: `${symbol} Market Analysis - ${analysis.sentiment} Outlook`,
              description: analysis.reasoning,
              url: `https://finance.yahoo.com/quote/${symbol}`,
              published_at: new Date().toISOString(),
              category: analysis.category || 'Technology Stock',
              ai_confidence: parseInt(analysis.confidence) || 75,
              ai_sentiment: analysis.sentiment || 'Neutral',
              ai_reasoning: analysis.reasoning,
              source_links: JSON.stringify(articles.slice(0, 5).map(article => ({
                title: article.title,
                url: article.url,
                published_at: article.published_at,
                description: article.description || 'No description available'
              }))),
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

    // Store composite analyses
    console.log('Storing Magnificent 7 composite analyses in database...');
    
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
      totalArticlesStored: allStoredArticles.length,
      message: 'Magnificent 7 stocks processed successfully with all articles stored for hyperlinking'
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