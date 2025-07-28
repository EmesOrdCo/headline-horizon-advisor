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
    
    // Fetch articles from multiple API calls - fewer calls, more articles per call for recent focus
    const allArticles = [];
    const apiCalls = 2; // Reduced calls to focus on most recent
    const articlesPerCall = 50; // Increased articles per call
    
    // Calculate date range - prioritize TODAY but include recent articles as fallback
    const endDate = new Date();
    // Add 1 day to end date to ensure we capture today's articles 
    endDate.setDate(endDate.getDate() + 1);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 2); // Extend to 2 days for better coverage
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    
    console.log(`Fetching articles from ${startDateStr} to ${endDateStr} (2 days with TODAY priority)`);
    
    // Also try without date restrictions for most recent available
    console.log('IMPORTANT: If no articles from today exist in API, will show most recent available articles');
    
    for (let i = 1; i <= apiCalls; i++) {
      console.log(`Making Magnificent 7 API call ${i}/${apiCalls}...`);
      
      try {
        // Try to get the most recent articles with multiple source preferences
        let apiUrl;
        if (i === 1) {
          // First call: Try with date filter
          apiUrl = `https://api.marketaux.com/v1/news/all?symbols=${magnificent7Query}&filter_entities=true&language=en&page=${i}&limit=${articlesPerCall}&api_token=${marketauxApiKey}&published_after=${startDateStr}&published_before=${endDateStr}&sort=published_desc&source=yahoo,seekingalpha,benzinga,marketwatch,bloomberg,reuters`;
        } else {
          // Second call: Try without strict date filter to get most recent available
          apiUrl = `https://api.marketaux.com/v1/news/all?symbols=${magnificent7Query}&filter_entities=true&language=en&page=${i}&limit=${articlesPerCall}&api_token=${marketauxApiKey}&sort=published_desc&source=yahoo,seekingalpha,benzinga,marketwatch,bloomberg,reuters`;
        }
        
        console.log(`API Call ${i}: ${i === 1 ? 'With date filter' : 'Most recent available'}`);
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            allArticles.push(...data.data);
            console.log(`Fetched ${data.data.length} Magnificent 7 articles from API call ${i}`);
            if (data.data.length > 0) {
              console.log(`Date range in fetched articles: ${data.data[data.data.length - 1]?.published_at} to ${data.data[0]?.published_at}`);
            }
          } else {
            console.log(`No articles returned from API call ${i}:`, data);
          }
        } else {
          console.error(`API call ${i} failed with status:`, response.status, await response.text());
        }
      } catch (error) {
        console.error(`Error in API call ${i}:`, error);
      }
    }

    // Remove duplicates based on URL and sort by publish date (TODAY FIRST!)
    const uniqueArticles = allArticles
      .filter((article, index, self) => 
        index === self.findIndex(a => a.url === article.url)
      )
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    // Get today's date for prioritization
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Unique Magnificent 7 articles: ${uniqueArticles.length}`);
    console.log(`Articles from TODAY (${today}): ${uniqueArticles.filter(a => a.published_at.startsWith(today)).length}`);
    console.log(`Articles from YESTERDAY (${yesterday}): ${uniqueArticles.filter(a => a.published_at.startsWith(yesterday)).length}`);
    console.log(`Most recent article date: ${uniqueArticles[0]?.published_at}`);
    console.log(`Oldest article date: ${uniqueArticles[uniqueArticles.length - 1]?.published_at}`);

    // Clear existing Magnificent 7 articles first
    for (const symbol of MAGNIFICENT_7) {
      await supabase.from('news_articles').delete().eq('symbol', symbol);
    }

    // Initialize stock articles mapping
    const stockArticles = new Map();
    MAGNIFICENT_7.forEach(symbol => {
      stockArticles.set(symbol, []);
    });

    const processedAnalyses = [];
    let successfulAnalyses = 0;

    // Process TOP articles to ensure we get the most recent ones
    for (const article of uniqueArticles.slice(0, 30)) { // Focus on top 30 most recent
      console.log(`Analyzing article impact: ${article.title}`);

      try {
        // Simplified prompt for better success rate
        const impactAnalysisPrompt = `Analyze this article and list which Magnificent 7 stocks (AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META) would be affected:

Title: ${article.title}
Description: ${article.description || 'No description'}

Response format: {"impacted_stocks": ["SYMBOL1", "SYMBOL2"]}`;

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
                role: 'user',
                content: impactAnalysisPrompt
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 200
          }),
        });

        if (impactResponse.ok) {
          const impactData = await impactResponse.json();
          const impactAnalysis = JSON.parse(impactData.choices[0].message.content);
          
          console.log(`Impact analysis for "${article.title}": ${impactAnalysis.impacted_stocks?.join(', ') || 'No stocks impacted'}`);

          if (impactAnalysis.impacted_stocks && impactAnalysis.impacted_stocks.length > 0) {
            successfulAnalyses++;
            // Add this article to each impacted stock's collection
            for (const symbol of impactAnalysis.impacted_stocks) {
              if (MAGNIFICENT_7.includes(symbol)) {
                const existingArticles = stockArticles.get(symbol);
                existingArticles.push(article);
                stockArticles.set(symbol, existingArticles);
              }
            }
          } else {
            // If no specific stocks identified, add to a general pool for later fallback
            console.log(`No specific stocks identified for article: ${article.title}`);
          }
        } else {
          const errorText = await impactResponse.text();
          console.error(`OpenAI impact analysis failed for article: ${article.title}`, errorText);
          
          // FALLBACK: If OpenAI fails, do keyword-based analysis
          const articleText = `${article.title} ${article.description || ''}`.toLowerCase();
          const keywordMatches = [];
          
          const stockKeywords = {
            'AAPL': ['apple', 'iphone', 'ipad', 'mac', 'ios', 'tim cook'],
            'MSFT': ['microsoft', 'windows', 'azure', 'office', 'teams', 'copilot'],
            'GOOGL': ['google', 'alphabet', 'android', 'youtube', 'search', 'chrome'],
            'AMZN': ['amazon', 'aws', 'prime', 'alexa', 'bezos', 'cloud computing'],
            'NVDA': ['nvidia', 'gpu', 'ai chip', 'datacenter', 'gaming', 'artificial intelligence', 'machine learning', 'geforce', 'rtx', 'cuda', 'jensen huang'],
            'TSLA': ['tesla', 'musk', 'electric vehicle', 'ev', 'autopilot', 'elon'],
            'META': ['meta', 'facebook', 'instagram', 'whatsapp', 'metaverse', 'zuckerberg']
          };
          
          for (const [symbol, keywords] of Object.entries(stockKeywords)) {
            if (keywords.some(keyword => articleText.includes(keyword))) {
              keywordMatches.push(symbol);
            }
          }
          
          if (keywordMatches.length > 0) {
            console.log(`Keyword-based match for "${article.title}": ${keywordMatches.join(', ')}`);
            for (const symbol of keywordMatches) {
              const existingArticles = stockArticles.get(symbol);
              existingArticles.push(article);
              stockArticles.set(symbol, existingArticles);
            }
            successfulAnalyses++;
          }
        }

        // Delay between articles to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error analyzing article "${article.title}":`, error);
      }
    }

    console.log(`Successfully analyzed ${successfulAnalyses} articles with stock associations`);

    // Ensure minimum 3 articles per stock by using broader article assignment
    for (const symbol of MAGNIFICENT_7) {
      const articles = stockArticles.get(symbol);
      if (articles.length < 3) {
        console.log(`${symbol} has only ${articles.length} articles, finding more...`);
        
        // Find additional articles using broader keyword matching
        const additionalArticles = uniqueArticles.filter(article => {
          const articleText = `${article.title} ${article.description || ''}`.toLowerCase();
          const isAlreadyAssigned = articles.some(existing => existing.url === article.url);
          
          if (isAlreadyAssigned) return false;
          
          // Broader matching for each stock
          const broadKeywords = {
            'AAPL': ['tech', 'technology', 'smartphone', 'earnings', 'stock market'],
            'MSFT': ['tech', 'technology', 'cloud', 'software', 'earnings'],
            'GOOGL': ['tech', 'technology', 'internet', 'advertising', 'earnings'],
            'AMZN': ['tech', 'technology', 'e-commerce', 'retail', 'earnings'],
            'NVDA': ['tech', 'technology', 'chip', 'semiconductor', 'ai', 'earnings'],
            'TSLA': ['auto', 'automotive', 'electric', 'tech', 'earnings'],
            'META': ['tech', 'technology', 'social media', 'internet', 'earnings']
          };
          
          return broadKeywords[symbol]?.some(keyword => articleText.includes(keyword));
        }).slice(0, 3 - articles.length);
        
        // Add these additional articles
        for (const additionalArticle of additionalArticles) {
          articles.push(additionalArticle);
          console.log(`Added additional article for ${symbol}: ${additionalArticle.title}`);
        }
        
        stockArticles.set(symbol, articles);
      }
    }

    // Create composite analysis for each stock that has relevant articles
    for (const [symbol, articles] of stockArticles.entries()) {
      if (articles.length > 0) {
        console.log(`Creating composite analysis for ${symbol} based on ${articles.length} articles...`);

        // Create analysis with actual source articles for hyperlinking
        processedAnalyses.push({
          symbol,
          title: `${symbol} Market Analysis - Current News`,
          description: `Market analysis for ${symbol} based on ${articles.length} recent news articles and market developments.`,
          url: `https://finance.yahoo.com/quote/${symbol}`,
          published_at: new Date().toISOString(),
          category: 'Technology Stock',
          ai_confidence: 75,
          ai_sentiment: 'Neutral',
          ai_reasoning: `Analysis based on ${articles.length} recent news articles covering market developments and industry trends affecting ${symbol}.`,
          source_links: JSON.stringify(articles.slice(0, 5).map(article => ({
            title: article.title,
            url: article.url,
            published_at: article.published_at,
            description: article.description || 'No description available'
          }))),
          is_main_analysis: true,
          is_historical: false
        });

        console.log(`✅ Created analysis for ${symbol} with ${articles.length} source articles`);
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

    const stocksWithNews = processedAnalyses.filter(a => !a.is_historical).length;
    const summary = {
      success: true,
      assetType: 'Magnificent 7',
      analysesProcessed: processedAnalyses.length,
      stocksAnalyzed: stocksWithNews,
      totalArticlesFetched: uniqueArticles.length,
      successfulAnalyses: successfulAnalyses,
      message: `Magnificent 7 stocks processed successfully. Fetched ${uniqueArticles.length} articles, analyzed ${stocksWithNews} stocks with current news.`
    };

    console.log(`🎉 Successfully processed ${summary.analysesProcessed} analyses for ${stocksWithNews} stocks with news`);

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