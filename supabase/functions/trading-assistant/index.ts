import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { message, symbol, stockData } = await req.json();

    console.log('Trading Assistant Request:', { message, symbol, stockData });

    // Create context-aware system prompt with current stock data
    const systemPrompt = `You are an expert trading assistant specializing in financial markets and stock analysis. You have access to real-time market data and can provide insights on trading strategies, technical analysis, fundamental analysis, and market trends.

Current Context:
${symbol ? `- Current Stock: ${symbol}` : '- No specific stock selected'}
${stockData ? `- Current Price: $${stockData.price}
- Price Change: ${stockData.change >= 0 ? '+' : ''}${stockData.change} (${stockData.changePercent}%)
- Market Status: ${stockData.marketStatus || 'Unknown'}` : ''}

Guidelines:
- Provide actionable trading insights and analysis
- Use current market data when available
- Explain complex financial concepts in simple terms
- Always include risk disclaimers for trading advice
- Be concise but thorough in your responses
- Focus on educational content and market analysis

Remember: All trading involves risk. Past performance doesn't guarantee future results. Always do your own research before making investment decisions.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    console.log('Trading Assistant Response Generated:', { 
      responseLength: botResponse.length,
      symbol,
      hasStockData: !!stockData 
    });

    return new Response(JSON.stringify({ 
      response: botResponse,
      context: { symbol, stockData }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in trading-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackResponse: "I'm currently experiencing technical difficulties. Please try again in a moment. In the meantime, remember that all trading involves risk and you should always do your own research before making investment decisions."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});