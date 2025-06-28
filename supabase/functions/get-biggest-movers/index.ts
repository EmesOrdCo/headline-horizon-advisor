
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
    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    const marketauxApiKey = Deno.env.get('MARKETAUX_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!finnhubApiKey || !marketauxApiKey || !openaiApiKey) {
      throw new Error('Missing required API keys');
    }

    // Define stocks to analyze
    const STOCKS = [
      { symbol: 'AAPL', name: 'Apple Inc' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'GOOGL', name: 'Alphabet Inc' },
      { symbol: 'AMZN', name: 'Amazon.com Inc' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation' },
      { symbol: 'TSLA', name: 'Tesla Inc' },
      { symbol: 'META', name: 'Meta Platforms Inc' },
      { symbol: 'NFLX', name: 'Netflix Inc' },
      { symbol: 'CRM', name: 'Salesforce Inc' },
      { symbol: 'UBER', name: 'Uber Technologies Inc' }
    ];

    console.log('Fetching stock prices from Finnhub...');
    
    const stockData = [];
    
    // Fetch stock data with delays to respect rate limits
    for (const stock of STOCKS) {
      try {
        console.log(`Fetching data for ${stock.symbol}...`);
        
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${finnhubApiKey}`);
        
        if (!response.ok) {
          console.error(`Finnhub API error for ${stock.symbol}: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        if (data.c && data.c > 0) {
          stockData.push({
            symbol: stock.symbol,
            name: stock.name,
            price: parseFloat(data.c.toFixed(2)),
            change: parseFloat(data.d.toFixed(2)),
            changePercent: parseFloat(data.dp.toFixed(2)),
            volume: Math.round(Math.random() * 100) + 'M' // Placeholder volume
          });
        }
        
        // Wait 1.5 seconds between requests
        if (STOCKS.indexOf(stock) < STOCKS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
      } catch (error) {
        console.error(`Error fetching data for ${stock.symbol}:`, error);
      }
    }

    if (stockData.length === 0) {
      throw new Error('No stock data retrieved');
    }

    // Sort by absolute percentage change to find biggest movers
    const sortedByChange = [...stockData].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    
    // Get top 3 gainers and top 3 losers
    const gainers = sortedByChange.filter(stock => stock.changePercent > 0).slice(0, 3);
    const losers = sortedByChange.filter(stock => stock.changePercent < 0).slice(0, 3);

    console.log(`Found ${gainers.length} gainers and ${losers.length} losers`);

    // Fetch news for each mover
    const allMovers = [...gainers, ...losers];
    
    for (const mover of allMovers) {
      try {
        console.log(`Fetching news for ${mover.symbol}...`);
        
        // Fetch news from Marketaux
        const newsResponse = await fetch(
          `https://api.marketaux.com/v1/news/all?symbols=${mover.symbol}&filter_entities=true&language=en&api_token=${marketauxApiKey}&limit=3`
        );
        
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          const articles = newsData.data || [];
          
          if (articles.length > 0) {
            // Analyze articles with ChatGPT
            const articlesText = articles.map(article => 
              `Title: ${article.title}\nDescription: ${article.description || 'No description'}\nURL: ${article.url}`
            ).join('\n\n---\n\n');

            const analysisPrompt = `
Analyze these news articles about ${mover.symbol} and provide a JSON response with headline summaries and overall impact:

${articlesText}

Provide a JSON response with:
{
  "headlines": [
    {
      "title": "original article title",
      "summary": "2-3 word summary of impact",
      "url": "article url",
      "publishedAt": "time ago format"
    }
  ],
  "overallImpact": "brief explanation of combined effect on stock"
}
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
                    content: 'You are a financial analyst. Provide clear, concise analysis in valid JSON format only.'
                  },
                  {
                    role: 'user',
                    content: analysisPrompt
                  }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 800
              }),
            });

            if (chatResponse.ok) {
              const chatData = await chatResponse.json();
              const analysis = JSON.parse(chatData.choices[0].message.content);
              
              mover.headlines = analysis.headlines || [];
              mover.overallImpact = analysis.overallImpact || 'Analysis unavailable';
            } else {
              mover.headlines = articles.slice(0, 2).map(article => ({
                title: article.title,
                summary: 'Impact analysis',
                url: article.url,
                publishedAt: new Date(article.published_at).toLocaleString()
              }));
            }
          } else {
            mover.headlines = [];
          }
        }
        
        // Wait between news requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error fetching news for ${mover.symbol}:`, error);
        mover.headlines = [];
      }
    }

    const result = {
      gainers,
      losers,
      lastUpdated: new Date().toISOString()
    };

    console.log(`Successfully processed ${gainers.length} gainers and ${losers.length} losers`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-biggest-movers function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      gainers: [],
      losers: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
