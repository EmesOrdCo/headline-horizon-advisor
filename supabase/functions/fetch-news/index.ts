
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
      console.error('Missing API keys:', { 
        hasMediaStack: !!mediaStackApiKey, 
        hasOpenAI: !!openAIApiKey 
      });
      throw new Error('Missing API keys');
    }

    console.log('Fetching news from Mediastack...');

    // Updated Mediastack API call with better parameters
    const newsUrl = `http://api.mediastack.com/v1/news?access_key=${mediaStackApiKey}&keywords=stock,market,earnings,financial,trading&sources=cnn,bloomberg,reuters,cnbc&limit=15&sort=published_desc&languages=en`;
    
    console.log('Calling Mediastack API...');
    const newsResponse = await fetch(newsUrl);

    if (!newsResponse.ok) {
      const errorText = await newsResponse.text();
      console.error('Mediastack API error:', newsResponse.status, errorText);
      throw new Error(`Mediastack API error: ${newsResponse.status} - ${errorText}`);
    }

    const newsData = await newsResponse.json();
    console.log('Fetched news data:', { 
      totalArticles: newsData.data?.length || 0,
      pagination: newsData.pagination 
    });

    if (!newsData.data || newsData.data.length === 0) {
      console.log('No articles found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0,
          message: 'No new articles found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each article with OpenAI o1-mini
    const processedArticles = [];
    
    for (const article of newsData.data.slice(0, 10)) { // Limit to 10 articles
      try {
        console.log('Processing article:', article.title?.substring(0, 50) + '...');
        
        // Extract potential stock symbol from title/description
        const symbol = extractStockSymbol(article.title + ' ' + (article.description || ''));
        
        if (!symbol) {
          console.log('No stock symbol found, skipping article');
          continue; // Skip if no stock symbol found
        }

        // Analyze with OpenAI o1-mini
        const aiAnalysis = await analyzeWithOpenAI(article, openAIApiKey);
        
        const processedArticle = {
          symbol,
          title: article.title,
          description: article.description,
          url: article.url,
          published_at: article.published_at,
          category: article.category || 'Financial',
          priority: aiAnalysis.priority,
          ai_prediction: aiAnalysis.prediction,
          ai_confidence: aiAnalysis.confidence,
          ai_sentiment: aiAnalysis.sentiment,
          ai_reasoning: aiAnalysis.reasoning,
        };

        processedArticles.push(processedArticle);
        console.log('Successfully processed article for', symbol);
      } catch (error) {
        console.error('Error processing article:', error);
        continue;
      }
    }

    // Store in database
    if (processedArticles.length > 0) {
      console.log('Storing', processedArticles.length, 'articles in database');
      const { error: insertError } = await supabase
        .from('news_articles')
        .insert(processedArticles);

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }
    }

    console.log('Successfully processed', processedArticles.length, 'articles');

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
    { pattern: /\b(AAPL|Apple)\b/i, symbol: 'AAPL' },
    { pattern: /\b(TSLA|Tesla)\b/i, symbol: 'TSLA' },
    { pattern: /\b(NVDA|NVIDIA|Nvidia)\b/i, symbol: 'NVDA' },
    { pattern: /\b(MSFT|Microsoft)\b/i, symbol: 'MSFT' },
    { pattern: /\b(GOOGL|GOOG|Google|Alphabet)\b/i, symbol: 'GOOGL' },
    { pattern: /\b(AMZN|Amazon)\b/i, symbol: 'AMZN' },
    { pattern: /\b(META|Meta|Facebook)\b/i, symbol: 'META' },
    { pattern: /\b(JPM|JPMorgan|Chase)\b/i, symbol: 'JPM' },
    { pattern: /\b(BAC|Bank of America)\b/i, symbol: 'BAC' },
    { pattern: /\b(WMT|Walmart)\b/i, symbol: 'WMT' },
  ];

  for (const { pattern, symbol } of stockPatterns) {
    if (pattern.test(text)) {
      return symbol;
    }
  }

  return null;
}

async function analyzeWithOpenAI(article: any, apiKey: string) {
  const prompt = `
Analyze this financial news article and provide a JSON response with:
1. Stock price prediction direction (format: "+X%" or "-X%" for 24h movement)
2. Confidence level (0-100 integer)
3. Sentiment (exactly one of: "Bullish", "Bearish", "Neutral")
4. Priority level (exactly one of: "HIGH", "MEDIUM", "LOW")
5. Brief reasoning (max 100 words)

Article Title: "${article.title}"
Description: "${article.description || 'No description available'}"

Respond ONLY with valid JSON in this exact format:
{
  "prediction": "+2.5%",
  "confidence": 75,
  "sentiment": "Bullish",
  "priority": "HIGH",
  "reasoning": "Brief explanation here"
}
`;

  console.log('Calling OpenAI o1-mini API...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'o1-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('OpenAI response received');
  
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    console.error('No content in OpenAI response');
    throw new Error('No content in OpenAI response');
  }
  
  try {
    // Clean the content to extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : content;
    
    const analysis = JSON.parse(jsonContent);
    
    // Validate the response format
    if (!analysis.prediction || !analysis.confidence || !analysis.sentiment || !analysis.priority) {
      throw new Error('Invalid analysis format');
    }
    
    return analysis;
  } catch (parseError) {
    console.error('JSON parsing failed for content:', content);
    // Fallback with neutral analysis
    return {
      prediction: "+0.5%",
      confidence: 50,
      sentiment: "Neutral",
      priority: "MEDIUM",
      reasoning: "Unable to analyze article properly due to parsing error"
    };
  }
}
