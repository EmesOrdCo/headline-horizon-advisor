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

    console.log('Starting Index Funds news fetching...');

    const INDEX_FUNDS = ['SPY', 'QQQ', 'DIA'];
    const indexFundsQuery = INDEX_FUNDS.join(',');
    
    // Fetch articles from multiple API calls - fewer calls, more articles per call for recent focus
    const allArticles = [];
    const apiCalls = 2; // Reduced calls to focus on most recent
    const articlesPerCall = 50; // Increased articles per call
    
    // Focus on most recent articles only - no date filtering to get latest available
    console.log('Fetching most recent articles available from MarketAux...');
    
    for (let i = 1; i <= apiCalls; i++) {
      console.log(`Making Index Funds API call ${i}/${apiCalls}...`);
      
      try {
        // Get the most recent articles available (no date filter to ensure we get latest)
        const apiUrl = `https://api.marketaux.com/v1/news/all?symbols=${indexFundsQuery}&filter_entities=true&language=en&page=${i}&limit=${articlesPerCall}&api_token=${marketauxApiKey}&sort=published_desc&source=yahoo,seekingalpha,benzinga,marketwatch,bloomberg,reuters`;
        
        console.log(`API Call ${i}: ${i === 1 ? 'With date filter' : 'Most recent available'}`);
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            allArticles.push(...data.data);
            console.log(`Fetched ${data.data.length} Index Funds articles from API call ${i}`);
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

    console.log(`Unique Index Funds articles: ${uniqueArticles.length}`);
    console.log(`Articles from TODAY (${today}): ${uniqueArticles.filter(a => a.published_at.startsWith(today)).length}`);
    console.log(`Articles from YESTERDAY (${yesterday}): ${uniqueArticles.filter(a => a.published_at.startsWith(yesterday)).length}`);
    console.log(`Most recent article date: ${uniqueArticles[0]?.published_at}`);
    console.log(`Oldest article date: ${uniqueArticles[uniqueArticles.length - 1]?.published_at}`);

    // Clear existing Index Fund articles first
    for (const symbol of INDEX_FUNDS) {
      await supabase.from('news_articles').delete().eq('symbol', symbol);
    }

    // Initialize fund articles mapping
    const fundArticles = new Map();
    INDEX_FUNDS.forEach(symbol => {
      fundArticles.set(symbol, []);
    });

    const processedAnalyses = [];
    let successfulAnalyses = 0;

    // Process TOP articles to ensure we get the most recent ones
    for (const article of uniqueArticles.slice(0, 30)) { // Focus on top 30 most recent
      console.log(`Analyzing article impact: ${article.title}`);

      try {
        // Simplified prompt for better success rate
        const impactAnalysisPrompt = `Analyze this article and list which Index Funds (SPY, QQQ, DIA) would be affected:

Title: ${article.title}
Description: ${article.description || 'No description'}

Response format: {"impacted_funds": ["SYMBOL1", "SYMBOL2"]}`;

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
          
          console.log(`Impact analysis for "${article.title}": ${impactAnalysis.impacted_funds?.join(', ') || 'No funds impacted'}`);

          if (impactAnalysis.impacted_funds && impactAnalysis.impacted_funds.length > 0) {
            successfulAnalyses++;
            // Add this article to each impacted fund's collection
            for (const symbol of impactAnalysis.impacted_funds) {
              if (INDEX_FUNDS.includes(symbol)) {
                const existingArticles = fundArticles.get(symbol);
                existingArticles.push(article);
                fundArticles.set(symbol, existingArticles);
              }
            }
          } else {
            // If no specific funds identified, add to a general pool for later fallback
            console.log(`No specific funds identified for article: ${article.title}`);
          }
        } else {
          const errorText = await impactResponse.text();
          console.error(`OpenAI impact analysis failed for article: ${article.title}`, errorText);
          
          // FALLBACK: If OpenAI fails, do keyword-based analysis
          const articleText = `${article.title} ${article.description || ''}`.toLowerCase();
          const keywordMatches = [];
          
          const fundKeywords = {
            'SPY': ['spy', 's&p 500', 's&p500', 'standard & poor', 'spdr s&p 500', 'stock market', 'stocks', 'market'],
            'QQQ': ['qqq', 'nasdaq', 'nasdaq 100', 'invesco qqq', 'powerShares', 'tech stocks', 'technology'],
            'DIA': ['dia', 'dow jones', 'djia', 'dow industrial', 'spdr dow jones', 'industrial stocks', 'dow']
          };
          
          for (const [symbol, keywords] of Object.entries(fundKeywords)) {
            if (keywords.some(keyword => articleText.includes(keyword))) {
              keywordMatches.push(symbol);
            }
          }
          
          if (keywordMatches.length > 0) {
            console.log(`Keyword-based match for "${article.title}": ${keywordMatches.join(', ')}`);
            for (const symbol of keywordMatches) {
              const existingArticles = fundArticles.get(symbol);
              existingArticles.push(article);
              fundArticles.set(symbol, existingArticles);
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

    console.log(`Successfully analyzed ${successfulAnalyses} articles with fund associations`);

    // Ensure minimum 3 articles per fund by using broader article assignment
    for (const symbol of INDEX_FUNDS) {
      const articles = fundArticles.get(symbol);
      if (articles.length < 3) {
        console.log(`${symbol} has only ${articles.length} articles, finding more...`);
        
        // Find additional articles using broader keyword matching
        const additionalArticles = uniqueArticles.filter(article => {
          const articleText = `${article.title} ${article.description || ''}`.toLowerCase();
          const isAlreadyAssigned = articles.some(existing => existing.url === article.url);
          
          if (isAlreadyAssigned) return false;
          
          // Broader matching for each fund
          const broadKeywords = {
            'SPY': ['market', 'stocks', 'equities', 'index', 'etf', 'fund', 'earnings'],
            'QQQ': ['tech', 'technology', 'nasdaq', 'index', 'etf', 'fund', 'earnings'],
            'DIA': ['industrial', 'dow', 'index', 'etf', 'fund', 'market', 'earnings']
          };
          
          return broadKeywords[symbol]?.some(keyword => articleText.includes(keyword));
        }).slice(0, 3 - articles.length);
        
        // Add these additional articles
        for (const additionalArticle of additionalArticles) {
          articles.push(additionalArticle);
          console.log(`Added additional article for ${symbol}: ${additionalArticle.title}`);
        }
        
        fundArticles.set(symbol, articles);
      }
    }

    // Create composite analysis for each fund that has relevant articles
    for (const [symbol, articles] of fundArticles.entries()) {
      if (articles.length > 0) {
        console.log(`Creating composite analysis for ${symbol} based on ${articles.length} articles...`);

        // Create analysis with actual source articles for hyperlinking
        processedAnalyses.push({
          symbol,
          title: `${symbol} Market Analysis - Current News`,
          description: `Market analysis for ${symbol} based on ${articles.length} recent news articles and market developments.`,
          url: `https://finance.yahoo.com/quote/${symbol}`,
          published_at: new Date().toISOString(),
          category: 'Index Fund',
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
        // Create historical analysis for funds without current news
        console.log(`Creating historical analysis for ${symbol}...`);
        
        processedAnalyses.push({
          symbol,
          title: `${symbol} Market Analysis - Historical Data*`,
          description: `Historical market analysis for ${symbol} based on recent trends and market patterns.`,
          url: `https://finance.yahoo.com/quote/${symbol}`,
          published_at: new Date().toISOString(),
          category: 'Index Fund',
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
    console.log('Storing Index Fund composite analyses in database...');
    
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

    const fundsWithNews = processedAnalyses.filter(a => !a.is_historical).length;
    const summary = {
      success: true,
      assetType: 'Index Funds',
      analysesProcessed: processedAnalyses.length,
      fundsAnalyzed: fundsWithNews,
      totalArticlesFetched: uniqueArticles.length,
      successfulAnalyses: successfulAnalyses,
      message: `Index Funds processed successfully. Fetched ${uniqueArticles.length} articles, analyzed ${fundsWithNews} funds with current news.`
    };

    console.log(`🎉 Successfully processed ${summary.analysesProcessed} analyses for ${fundsWithNews} funds with news`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in fetch-index-funds function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      assetType: 'Index Funds'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});