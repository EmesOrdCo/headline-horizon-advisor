
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols, userId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const marketauxKey = Deno.env.get('MARKETAUX_API_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Analyzing stocks for user:', userId, 'symbols:', symbols);

    // Clear existing articles for these symbols for this user
    await supabase
      .from('user_stock_articles')
      .delete()
      .eq('user_id', userId)
      .in('symbol', symbols);

    // Process each symbol
    for (const symbol of symbols) {
      console.log(`Processing ${symbol}...`);
      
      // Fetch news from Marketaux for all stocks (including Magnificent 7)
      console.log(`Fetching Marketaux news for ${symbol}...`);
      
      const newsResponse = await fetch(
        `https://api.marketaux.com/v1/news/all?symbols=${symbol}&filter_entities=true&language=en&api_token=${marketauxKey}&limit=10&sort=published_desc`
      );

      if (!newsResponse.ok) {
        console.error(`Failed to fetch news for ${symbol}:`, await newsResponse.text());
        continue;
      }

      const newsData = await newsResponse.json();
      const articles = newsData.data || [];

      console.log(`Found ${articles.length} articles for ${symbol}`);

      if (articles.length > 0) {
        // Take the top 5 most relevant articles
        const topArticles = articles.slice(0, 5);
        
        // Format source links for display
        const sourceLinks = topArticles.map(article => ({
          title: article.title,
          url: article.url,
          published_at: article.published_at,
          description: article.description || '',
          source: article.source || 'Marketaux'
        }));

        // Create composite analysis with article content
        const articleSummaries = topArticles.map((article: any, index: number) => 
          `Article ${index + 1}:
Title: ${article.title}
Published: ${article.published_at}
Description: ${article.description || 'No description available'}
URL: ${article.url}`
        ).join('\n\n');

        const compositePrompt = `
You are a professional financial analyst. Analyze the following news articles for their impact on ${symbol} stock:

${articleSummaries}

Based on all these articles together, provide a JSON response:
{
  "confidence": "number between 1-100 representing your confidence level for the overall analysis",
  "sentiment": "string that MUST be either 'Bullish', 'Bearish', or 'Neutral' based on the collective impact",
  "reasoning": "comprehensive explanation analyzing the collective impact of all articles on ${symbol}"
}

CONFIDENCE LEVEL GUIDELINES (BE CONSERVATIVE):
- 1-20: Very uncertain, conflicting information, speculative news
- 21-40: Low confidence, limited information, uncertain market conditions  
- 41-60: Moderate confidence, some clear indicators but mixed signals
- 61-80: High confidence, clear trends and strong supporting evidence
- 81-100: Very high confidence, major confirmed events with clear market impact (RARE - use sparingly)

IMPORTANT: DEFAULT to lower confidence levels (20-60 range) unless evidence is overwhelming. Confidence above 80 should be RARE and only for major confirmed events.

Focus on the overall sentiment and impact on ${symbol} stock price.`;

        const compositeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a professional financial analyst. Provide market analysis in valid JSON format only.'
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

        let analysis = { sentiment: 'Neutral', confidence: 50, reasoning: 'Unable to analyze' };
        
        if (compositeResponse.ok) {
          const compositeData = await compositeResponse.json();
          try {
            analysis = JSON.parse(compositeData.choices[0].message.content);
          } catch (e) {
            console.error('Failed to parse AI response:', e);
          }
        }

        // Store analysis with source links
        const { error: insertError } = await supabase
          .from('user_stock_articles')
          .insert({
            user_id: userId,
            symbol: symbol,
            title: `${symbol} Market Analysis - ${topArticles.length} News Sources`,
            description: `Analysis based on ${topArticles.length} recent news articles from Marketaux`,
            url: `https://finance.yahoo.com/quote/${symbol}`,
            published_at: new Date().toISOString(),
            ai_sentiment: analysis.sentiment,
            ai_confidence: analysis.confidence,
            ai_reasoning: analysis.reasoning,
            source_links: JSON.stringify(sourceLinks)
          });

        if (insertError) {
          console.error(`Failed to store analysis for ${symbol}:`, insertError);
        } else {
          console.log(`Successfully analyzed and stored ${symbol}: ${analysis.sentiment} sentiment with ${sourceLinks.length} source articles`);
        }
      } else {
        // Store empty analysis if no articles found
        const { error: insertError } = await supabase
          .from('user_stock_articles')
          .insert({
            user_id: userId,
            symbol: symbol,
            title: `${symbol} Market Analysis - No Recent News`,
            description: `No recent news articles found for ${symbol}`,
            url: `https://finance.yahoo.com/quote/${symbol}`,
            published_at: new Date().toISOString(),
            ai_sentiment: 'Neutral',
            ai_confidence: 50,
            ai_reasoning: 'No recent news available for analysis',
            source_links: JSON.stringify([])
          });

        if (insertError) {
          console.error(`Failed to store empty analysis for ${symbol}:`, insertError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Analysis completed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in analyze-user-stocks function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
