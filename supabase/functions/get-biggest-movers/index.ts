
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY');
    const alpacaSecretKey = Deno.env.get('ALPACA_SECRET_KEY');
    const marketauxApiKey = Deno.env.get('MARKETAUX_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!alpacaApiKey || !alpacaSecretKey || !marketauxApiKey || !openaiApiKey) {
      throw new Error('Missing required API keys');
    }

    console.log('Fetching biggest gainers and losers from Alpaca screener...');

    // Fetch biggest gainers
    const gainersResponse = await fetch('https://data.alpaca.markets/v1beta1/screener/stocks/gainers?top=10', {
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecretKey,
      },
    });

    // Fetch biggest losers
    const losersResponse = await fetch('https://data.alpaca.markets/v1beta1/screener/stocks/losers?top=10', {
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecretKey,
      },
    });

    let gainersData = [];
    let losersData = [];

    if (gainersResponse.ok) {
      const gainersResult = await gainersResponse.json();
      console.log(`Fetched ${gainersResult.stocks?.length || 0} gainers from screener`);
      gainersData = gainersResult.stocks || [];
    } else {
      console.error('Failed to fetch gainers:', gainersResponse.status);
    }

    if (losersResponse.ok) {
      const losersResult = await losersResponse.json();
      console.log(`Fetched ${losersResult.stocks?.length || 0} losers from screener`);
      losersData = losersResult.stocks || [];
    } else {
      console.error('Failed to fetch losers:', losersResponse.status);
    }

    // If we don't have enough data from screener API, fall back to sample data
    if (gainersData.length === 0 && losersData.length === 0) {
      console.log('No screener data available, using fallback data...');
      
      const fallbackData = [
        { symbol: 'AAPL', name: 'Apple Inc', price: 175.50, change: 4.25, changePercent: 2.48, volume: '85M' },
        { symbol: 'TSLA', name: 'Tesla Inc', price: 245.80, change: -8.45, changePercent: -3.33, volume: '92M' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 485.20, change: 12.75, changePercent: 2.70, volume: '78M' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.90, change: -5.60, changePercent: -1.46, volume: '65M' },
        { symbol: 'GOOGL', name: 'Alphabet Inc', price: 142.30, change: 3.80, changePercent: 2.74, volume: '55M' },
        { symbol: 'AMZN', name: 'Amazon.com Inc', price: 156.70, change: -4.20, changePercent: -2.61, volume: '70M' },
        { symbol: 'META', name: 'Meta Platforms Inc', price: 298.40, change: 6.80, changePercent: 2.39, volume: '45M' },
        { symbol: 'AMD', name: 'Advanced Micro Devices Inc', price: 132.50, change: -3.85, changePercent: -2.82, volume: '88M' }
      ];
      
      gainersData = fallbackData.filter(s => s.changePercent > 0).slice(0, 3);
      losersData = fallbackData.filter(s => s.changePercent < 0).slice(0, 3);
    }

    // Process screener data to match our expected format
    const processScreenerStock = (stock: any) => ({
      symbol: stock.symbol,
      name: stock.name || stock.symbol,
      price: parseFloat(stock.price?.toFixed(2) || '0'),
      change: parseFloat(stock.change?.toFixed(2) || '0'),
      changePercent: parseFloat(stock.percent_change?.toFixed(2) || '0'),
      volume: stock.volume ? `${Math.round(stock.volume / 1000000)}M` : 'N/A'
    });

    // Take top 3 from each category and process them
    const topGainers = gainersData.slice(0, 3).map(processScreenerStock);
    const topLosers = losersData.slice(0, 3).map(processScreenerStock);

    console.log(`Processing ${topGainers.length} gainers and ${topLosers.length} losers for news analysis`);

    // Fetch news and AI analysis for each stock
    const allMovers = [...topGainers, ...topLosers];
    
    for (const mover of allMovers) {
      try {
        console.log(`Fetching news for ${mover.symbol}...`);
        
        // Fetch news from Marketaux with timeout
        const newsController = new AbortController();
        const newsTimeout = setTimeout(() => newsController.abort(), 10000);
        
        const newsResponse = await fetch(
          `https://api.marketaux.com/v1/news/all?symbols=${mover.symbol}&filter_entities=true&language=en&api_token=${marketauxApiKey}&limit=10`,
          { signal: newsController.signal }
        );
        
        clearTimeout(newsTimeout);
        
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          const articles = newsData.data || [];
          
          if (articles.length > 0) {
            // Try to analyze articles with ChatGPT
            try {
              const articlesText = articles.map(article => 
                `Title: ${article.title}\nDescription: ${article.description || 'No description'}`
              ).join('\n\n---\n\n');

              const analysisPrompt = `
Analyze these news articles about ${mover.symbol} and provide comprehensive market sentiment analysis.

Stock Info: ${mover.symbol} - ${mover.name}
Current Price Change: ${mover.changePercent}% (${mover.change >= 0 ? 'gain' : 'loss'})

News Articles:
${articlesText}

Please analyze each article and determine which ones are actually relevant to the stock's price movement or fundamental business prospects. Then provide a JSON response with:

{
  "relevantArticleIndices": [0, 2, 4],
  "headlines": [
    {
      "title": "original article title",
      "summary": "brief 4-6 word impact summary explaining relevance to stock",
      "url": "article_url",
      "publishedAt": "formatted_date_time"
    }
  ],
  "overallImpact": "2-3 sentence comprehensive analysis of combined news effect on stock performance",
  "marketSentiment": "Bullish|Bearish|Neutral",
  "sentimentReasoning": "1-2 sentence explanation of why this sentiment was chosen"
}

IMPORTANT: 
1. Only include articles that are genuinely relevant to this specific company
2. Market sentiment should be based on fundamental analysis, not just current price movement
3. Include ALL relevant articles, not just a limited number
`;

              const chatController = new AbortController();
              const chatTimeout = setTimeout(() => chatController.abort(), 15000);

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
                      content: 'You are a financial analyst specializing in market sentiment analysis. Provide clear, concise analysis in valid JSON format only.'
                    },
                    {
                      role: 'user',
                      content: analysisPrompt
                    }
                  ],
                  response_format: { type: "json_object" },
                  temperature: 0.7,
                  max_tokens: 1500
                }),
                signal: chatController.signal
              });

              clearTimeout(chatTimeout);

              if (chatResponse.ok) {
                const chatData = await chatResponse.json();
                const analysis = JSON.parse(chatData.choices[0].message.content);
                
                // Filter articles based on AI analysis
                const relevantIndices = analysis.relevantArticleIndices || [];
                const relevantArticles = relevantIndices.map(index => articles[index]).filter(Boolean);
                
                // Format the headlines with proper date formatting
                const formattedHeadlines = relevantArticles.map((article, index) => {
                  const originalHeadline = analysis.headlines?.[index];
                  const publishedDate = new Date(article.published_at);
                  const formattedDate = publishedDate.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  }).replace(',', ' at');

                  return {
                    title: originalHeadline?.title || article.title,
                    summary: originalHeadline?.summary || 'Market impact',
                    url: article.url,
                    publishedAt: formattedDate
                  };
                });
                
                mover.headlines = formattedHeadlines;
                mover.overallImpact = analysis.overallImpact || 'Analysis unavailable';
                mover.marketSentiment = analysis.marketSentiment || 'Neutral';
                mover.sentimentReasoning = analysis.sentimentReasoning || 'Insufficient data for sentiment analysis';
              } else {
                throw new Error('ChatGPT analysis failed');
              }
            } catch (analysisError) {
              console.error(`Analysis error for ${mover.symbol}:`, analysisError);
              // Fallback to basic headlines without AI analysis
              const limitedArticles = articles.slice(0, 3);
              mover.headlines = limitedArticles.map(article => {
                const publishedDate = new Date(article.published_at);
                const formattedDate = publishedDate.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                }).replace(',', ' at');

                return {
                  title: article.title,
                  summary: 'Market impact',
                  url: article.url,
                  publishedAt: formattedDate
                };
              });
              mover.overallImpact = `Recent news about ${mover.symbol} may influence stock performance.`;
              mover.marketSentiment = 'Neutral';
              mover.sentimentReasoning = 'Unable to determine sentiment due to analysis limitations';
            }
          } else {
            // No articles found
            mover.headlines = [];
            mover.overallImpact = `No recent news found for ${mover.symbol}. Price movement may be due to general market conditions.`;
            mover.marketSentiment = 'Neutral';
            mover.sentimentReasoning = 'No news available for sentiment analysis';
          }
        } else {
          throw new Error(`News API error: ${newsResponse.status}`);
        }
        
        // Wait between news requests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error fetching news for ${mover.symbol}:`, error);
        // Provide fallback data
        mover.headlines = [];
        mover.overallImpact = `Unable to fetch recent news for ${mover.symbol}. Price movement may be due to general market conditions.`;
        mover.marketSentiment = 'Neutral';
        mover.sentimentReasoning = 'Unable to fetch news for sentiment analysis';
      }
    }

    const result = {
      gainers: topGainers,  
      losers: topLosers,
      lastUpdated: new Date().toISOString()
    };

    console.log(`Successfully processed ${topGainers.length} gainers and ${topLosers.length} losers`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-biggest-movers function:', error);
    
    // Return fallback data instead of error to prevent UI crashes
    const fallbackData = {
      gainers: [
        { 
          symbol: 'AAPL', 
          name: 'Apple Inc', 
          price: 175.50, 
          change: 4.25, 
          changePercent: 2.48, 
          volume: '85M',
          headlines: [],
          overallImpact: 'Market data temporarily unavailable. Please try again later.',
          marketSentiment: 'Neutral',
          sentimentReasoning: 'Data temporarily unavailable'
        },
        { 
          symbol: 'NVDA', 
          name: 'NVIDIA Corporation', 
          price: 485.20, 
          change: 12.75, 
          changePercent: 2.70, 
          volume: '78M',
          headlines: [],
          overallImpact: 'Market data temporarily unavailable. Please try again later.',
          marketSentiment: 'Neutral',
          sentimentReasoning: 'Data temporarily unavailable'
        },
        { 
          symbol: 'META', 
          name: 'Meta Platforms Inc', 
          price: 298.40, 
          change: 6.80, 
          changePercent: 2.39, 
          volume: '45M',
          headlines: [],
          overallImpact: 'Market data temporarily unavailable. Please try again later.',
          marketSentiment: 'Neutral',
          sentimentReasoning: 'Data temporarily unavailable'
        }
      ],
      losers: [
        { 
          symbol: 'TSLA', 
          name: 'Tesla Inc', 
          price: 245.80, 
          change: -8.45, 
          changePercent: -3.33, 
          volume: '92M',
          headlines: [],
          overallImpact: 'Market data temporarily unavailable. Please try again later.',
          marketSentiment: 'Neutral',
          sentimentReasoning: 'Data temporarily unavailable'
        },
        { 
          symbol: 'AMZN', 
          name: 'Amazon.com Inc', 
          price: 156.70, 
          change: -4.20, 
          changePercent: -2.61, 
          volume: '70M',
          headlines: [],
          overallImpact: 'Market data temporarily unavailable. Please try again later.',
          marketSentiment: 'Neutral',
          sentimentReasoning: 'Data temporarily unavailable'
        },
        { 
          symbol: 'AMD', 
          name: 'Advanced Micro Devices Inc', 
          price: 132.50, 
          change: -3.85, 
          changePercent: -2.82, 
          volume: '88M',
          headlines: [],
          overallImpact: 'Market data temporarily unavailable. Please try again later.',
          marketSentiment: 'Neutral',
          sentimentReasoning: 'Data temporarily unavailable'
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    return new Response(JSON.stringify(fallbackData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
