
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try primary key first, then fallback to secondary key
    let openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    let usingSecondaryKey = false;
    
    if (!openaiApiKey) {
      openaiApiKey = Deno.env.get('OPENAI_API_KEY_2');
      usingSecondaryKey = true;
    }

    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    console.log(`Using ${usingSecondaryKey ? 'secondary' : 'primary'} OpenAI API key for analysis`)

    const requestBody = await req.json();
    const { articles, symbol } = requestBody;

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      throw new Error('No articles provided for analysis');
    }

    console.log(`Starting ChatGPT analysis for ${symbol} with ${articles.length} articles...`);

    // Prepare articles text for analysis
    const articlesText = articles.map((article, index) => 
      `Article ${index + 1}:
Title: ${article.title}
Description: ${article.description || 'No description available'}
Published: ${article.published_at}
URL: ${article.url}
---`
    ).join('\n\n');

    const analysisPrompt = `
You are a professional financial analyst. Analyze the following news articles about ${symbol} stock and provide a comprehensive market analysis.

Articles to analyze:
${articlesText}

Based on these articles, provide a JSON response with the following structure:

{
  "overall_sentiment": "string that MUST be either 'Bullish', 'Bearish', or 'Neutral'",
  "confidence": "number between 1-100 representing your confidence level",
  "prediction": "string showing expected price movement like '+2.8% (24h)' or '-1.5% (24h)'",
  "priority": "string that MUST be either 'HIGH', 'MEDIUM', or 'LOW'",
  "category": "string describing the main news category (e.g., 'Earnings', 'Technology', 'Market Analysis')",
  "key_factors": "array of strings listing the main factors influencing your analysis",
  "summary": "string providing a brief summary of your analysis (max 200 characters)",
  "reasoning": "string explaining your analysis in detail (max 500 characters)"
}

Rules:
1. Be realistic and conservative with predictions
2. Make a clear decision on sentiment - avoid neutral unless truly uncertain
3. Base confidence on the clarity and impact of the news
4. Consider the stock's recent performance and market context
5. Factor in multiple articles to provide a comprehensive view
6. Higher priority for breaking news or significant market events
`;

    console.log(`Sending ${articlesText.length} characters of article data to OpenAI for ${symbol}...`);

    let chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial analyst with expertise in stock market analysis. Provide clear, actionable market analysis in valid JSON format only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    // If primary key fails with quota error and we have a secondary key, try it
    if (!chatResponse.ok && !usingSecondaryKey) {
      const errorText = await chatResponse.text();
      if (errorText.includes('quota') || errorText.includes('429')) {
        const secondaryKey = Deno.env.get('OPENAI_API_KEY_2');
        if (secondaryKey) {
          console.log(`Primary key failed with quota error, trying secondary key for ${symbol}...`);
          chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${secondaryKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4.1-2025-04-14',
              messages: [
                {
                  role: 'system',
                  content: 'You are a professional financial analyst with expertise in stock market analysis. Provide clear, actionable market analysis in valid JSON format only.'
                },
                {
                  role: 'user',
                  content: analysisPrompt
                }
              ],
              response_format: { type: "json_object" },
              temperature: 0.7,
              max_tokens: 1000
            }),
          });
        }
      }
    }

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error(`OpenAI API error for ${symbol}: ${chatResponse.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${chatResponse.status} - ${errorText}`);
    }

    const chatData = await chatResponse.json();
    
    if (!chatData.choices || !chatData.choices[0] || !chatData.choices[0].message) {
      console.error(`Invalid OpenAI response for ${symbol}:`, chatData);
      throw new Error(`Invalid OpenAI response format`);
    }

    let analysis;
    try {
      analysis = JSON.parse(chatData.choices[0].message.content);
    } catch (parseError) {
      console.error(`Failed to parse OpenAI response for ${symbol}:`, parseError);
      throw new Error(`Failed to parse OpenAI analysis response`);
    }

    // Validate required fields
    const requiredFields = ['overall_sentiment', 'confidence', 'prediction', 'priority', 'category'];
    for (const field of requiredFields) {
      if (!analysis[field]) {
        throw new Error(`Missing required field in analysis: ${field}`);
      }
    }

    // Validate sentiment values
    const validSentiments = ['Bullish', 'Bearish', 'Neutral'];
    if (!validSentiments.includes(analysis.overall_sentiment)) {
      analysis.overall_sentiment = 'Neutral';
    }

    // Validate priority values
    const validPriorities = ['HIGH', 'MEDIUM', 'LOW'];
    if (!validPriorities.includes(analysis.priority)) {
      analysis.priority = 'MEDIUM';
    }

    // Ensure confidence is within range
    if (typeof analysis.confidence !== 'number' || analysis.confidence < 1 || analysis.confidence > 100) {
      analysis.confidence = Math.max(1, Math.min(100, Number(analysis.confidence) || 60));
    }

    const result = {
      symbol,
      analysis,
      articles_analyzed: articles.length,
      analyzed_at: new Date().toISOString(),
      success: true
    };

    console.log(`✅ Successfully analyzed ${symbol}: ${analysis.overall_sentiment} sentiment with ${analysis.confidence}% confidence`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in analyze-articles function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      analyzed_at: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
