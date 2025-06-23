
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mediaStackApiKey = Deno.env.get('MEDIASTACK_API_KEY');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!mediaStackApiKey || !openAIApiKey) {
      throw new Error('Missing API keys');
    }

    // Fetch news from Mediastack
    const newsResponse = await fetch(
      `http://api.mediastack.com/v1/news?access_key=${mediaStackApiKey}&keywords=stock,market,earnings,apple,tesla,nvidia,microsoft,google&limit=10&sort=published_desc`
    );

    if (!newsResponse.ok) {
      throw new Error(`Mediastack API error: ${newsResponse.statusText}`);
    }

    const newsData = await newsResponse.json();
    console.log('Fetched news:', newsData);

    // Process each article with ChatGPT
    const processedArticles = [];
    
    for (const article of newsData.data) {
      try {
        // Extract potential stock symbol from title/description
        const symbol = extractStockSymbol(article.title + ' ' + (article.description || ''));
        
        if (!symbol) continue; // Skip if no stock symbol found

        // Analyze with ChatGPT
        const aiAnalysis = await analyzeWithChatGPT(article, openAIApiKey);
        
        const processedArticle = {
          symbol,
          title: article.title,
          description: article.description,
          url: article.url,
          published_at: article.published_at,
          category: article.category || 'General',
          priority: aiAnalysis.priority,
          ai_prediction: aiAnalysis.prediction,
          ai_confidence: aiAnalysis.confidence,
          ai_sentiment: aiAnalysis.sentiment,
          ai_reasoning: aiAnalysis.reasoning,
        };

        processedArticles.push(processedArticle);
      } catch (error) {
        console.error('Error processing article:', error);
        continue;
      }
    }

    // Store in database
    if (processedArticles.length > 0) {
      const { error: insertError } = await supabase
        .from('news_articles')
        .insert(processedArticles);

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedArticles.length,
        articles: processedArticles 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-news function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function extractStockSymbol(text: string): string | null {
  const stockPatterns = [
    /\b(AAPL|Apple)\b/i,
    /\b(TSLA|Tesla)\b/i,
    /\b(NVDA|NVIDIA|Nvidia)\b/i,
    /\b(MSFT|Microsoft)\b/i,
    /\b(GOOGL|GOOG|Google|Alphabet)\b/i,
    /\b(AMZN|Amazon)\b/i,
    /\b(META|Meta|Facebook)\b/i,
  ];

  for (const pattern of stockPatterns) {
    if (pattern.test(text)) {
      if (/apple/i.test(text)) return 'AAPL';
      if (/tesla/i.test(text)) return 'TSLA';
      if (/nvidia/i.test(text)) return 'NVDA';
      if (/microsoft/i.test(text)) return 'MSFT';
      if (/google|alphabet/i.test(text)) return 'GOOGL';
      if (/amazon/i.test(text)) return 'AMZN';
      if (/meta|facebook/i.test(text)) return 'META';
    }
  }

  return null;
}

async function analyzeWithChatGPT(article: any, apiKey: string) {
  const prompt = `
Analyze this financial news article and provide:
1. Stock price prediction direction (+X% or -X% for 24h)
2. Confidence level (0-100)
3. Sentiment (Bullish/Bearish/Neutral)
4. Priority level (HIGH/MEDIUM/LOW)
5. Brief reasoning (max 100 words)

Article: "${article.title}"
Description: "${article.description || 'No description'}"

Respond in JSON format:
{
  "prediction": "+2.5%",
  "confidence": 75,
  "sentiment": "Bullish",
  "priority": "HIGH",
  "reasoning": "Brief explanation here"
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a financial analyst AI. Analyze news and provide stock predictions in JSON format only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    // Fallback if JSON parsing fails
    return {
      prediction: "+1.0%",
      confidence: 50,
      sentiment: "Neutral",
      priority: "MEDIUM",
      reasoning: "Unable to analyze article properly"
    };
  }
}
