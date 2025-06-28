
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Clear existing articles for these symbols
    await supabase
      .from('user_stock_articles')
      .delete()
      .eq('user_id', userId)
      .in('symbol', symbols);

    // Fetch news for each symbol
    for (const symbol of symbols) {
      console.log(`Fetching news for ${symbol}`);
      
      // Fetch news from Marketaux
      const newsResponse = await fetch(
        `https://api.marketaux.com/v1/news/all?symbols=${symbol}&filter_entities=true&language=en&api_token=${marketauxKey}&limit=10`
      );

      if (!newsResponse.ok) {
        console.error(`Failed to fetch news for ${symbol}:`, await newsResponse.text());
        continue;
      }

      const newsData = await newsResponse.json();
      const articles = newsData.data || [];

      console.log(`Found ${articles.length} articles for ${symbol}`);

      // Process each article with AI
      for (const article of articles) {
        try {
          // Analyze article with OpenAI
          const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  content: `You are a financial analyst. Analyze the following news article about ${symbol} and provide:
1. Sentiment (positive, negative, or neutral)
2. Confidence score (1-100)
3. Brief reasoning for your analysis

Respond in JSON format: {"sentiment": "positive/negative/neutral", "confidence": 85, "reasoning": "brief explanation"}`
                },
                {
                  role: 'user',
                  content: `Title: ${article.title}\nDescription: ${article.description || ''}\nURL: ${article.url}`
                }
              ],
              temperature: 0.3,
            }),
          });

          let analysis = { sentiment: 'neutral', confidence: 50, reasoning: 'Unable to analyze' };
          
          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            try {
              analysis = JSON.parse(analysisData.choices[0].message.content);
            } catch (e) {
              console.error('Failed to parse AI response:', e);
            }
          }

          // Store article with analysis
          await supabase
            .from('user_stock_articles')
            .insert({
              user_id: userId,
              symbol: symbol,
              title: article.title,
              description: article.description || '',
              url: article.url,
              published_at: article.published_at,
              ai_sentiment: analysis.sentiment,
              ai_confidence: analysis.confidence,
              ai_reasoning: analysis.reasoning
            });

          console.log(`Analyzed and stored article for ${symbol}: ${analysis.sentiment}`);
        } catch (error) {
          console.error(`Error processing article for ${symbol}:`, error);
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
