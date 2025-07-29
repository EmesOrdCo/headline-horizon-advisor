
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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    console.log(`Using OpenAI API key for weight calculation`);

    const { articles, overallSentiment, overallConfidence, symbol } = await req.json();

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      throw new Error('No articles provided for weight calculation');
    }

    console.log(`Calculating article weights for ${symbol} with ${articles.length} articles...`);

    // Prepare articles for analysis
    const articlesText = articles.map((article, index) => 
      `Article ${index + 1}:
Title: ${article.title}
Description: ${article.description || 'No description available'}
Published: ${article.published_at}
---`
    ).join('\n\n');

    const weightPrompt = `
You are analyzing news articles that led to an overall ${overallSentiment} sentiment with ${overallConfidence}% confidence for ${symbol}.

Articles analyzed:
${articlesText}

For each article, calculate a weight (1-5 dots) representing how much it influenced the final ${overallSentiment} sentiment and ${overallConfidence}% confidence level.

Consider:
- Relevance to the stock's core business
- Potential market impact
- Credibility and specificity of information
- Timing and market context
- How much it supports or contradicts the overall sentiment

Provide a JSON response with this structure:
{
  "weights": [
    {
      "article_index": 0,
      "weight": 4,
      "reasoning": "Strong earnings data directly impacts stock valuation"
    },
    {
      "article_index": 1,
      "weight": 2,
      "reasoning": "General market news with indirect relevance"
    }
  ]
}

Weight scale:
- 5: Critical impact, major influence on sentiment
- 4: High impact, strong influence
- 3: Moderate impact, decent influence
- 2: Low impact, minor influence
- 1: Minimal impact, slight influence
`;

    // Add rate limiting delay to prevent quota exhaustion
    await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay

    let response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a financial analyst expert at evaluating the significance of news articles on stock sentiment. Provide accurate weight assessments in valid JSON format.'
          },
          {
            role: 'user',
            content: weightPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      }),
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    // Validate and ensure all articles have weights
    const weights = articles.map((_, index) => {
      const weightData = analysis.weights?.find((w: any) => w.article_index === index);
      return {
        article_index: index,
        weight: weightData?.weight || 3, // Default to moderate impact
        reasoning: weightData?.reasoning || 'Standard market relevance'
      };
    });

    console.log(`✅ Calculated weights for ${symbol}: ${weights.length} articles processed`);

    return new Response(JSON.stringify({
      success: true,
      symbol,
      weights,
      calculated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error calculating article weights:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
