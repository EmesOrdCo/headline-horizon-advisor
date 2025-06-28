
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];

// Function to fetch full article content
async function fetchArticleContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch article content from ${url}: ${response.status}`);
      return '';
    }
    
    const html = await response.text();
    
    // Basic HTML parsing to extract text content
    // Remove script and style tags
    let cleanText = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanText = cleanText.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags
    cleanText = cleanText.replace(/<[^>]*>/g, ' ');
    
    // Clean up whitespace
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    // Limit to reasonable length (first 3000 characters to avoid token limits)
    return cleanText.length > 3000 ? cleanText.substring(0, 3000) + '...' : cleanText;
  } catch (error) {
    console.error(`Error fetching article content from ${url}:`, error);
    return '';
  }
}

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
      
      // Check if this is a Magnificent 7 stock - if so, duplicate from news_articles
      if (MAGNIFICENT_7.includes(symbol)) {
        console.log(`${symbol} is Magnificent 7 - duplicating existing data`);
        
        const { data: existingArticle, error: fetchError } = await supabase
          .from('news_articles')
          .select('*')
          .eq('symbol', symbol)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError) {
          console.error(`Failed to fetch existing article for ${symbol}:`, fetchError);
          continue;
        }

        if (existingArticle) {
          // Create user-specific copy
          const { error: insertError } = await supabase
            .from('user_stock_articles')
            .insert({
              user_id: userId,
              symbol: symbol,
              title: existingArticle.title,
              description: existingArticle.description,
              url: existingArticle.url,
              published_at: existingArticle.published_at,
              ai_sentiment: existingArticle.ai_sentiment,
              ai_confidence: existingArticle.ai_confidence,
              ai_reasoning: existingArticle.ai_reasoning
            });

          if (insertError) {
            console.error(`Failed to create user copy for ${symbol}:`, insertError);
          } else {
            console.log(`Successfully duplicated ${symbol} analysis for user`);
          }
        }
      } else {
        // Not Magnificent 7 - fetch and analyze new data
        console.log(`${symbol} is not Magnificent 7 - fetching fresh data`);
        
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

        if (articles.length > 0) {
          // Fetch full content for top 3 articles (to balance comprehensiveness with API limits)
          const articlesWithContent = [];
          
          for (let i = 0; i < Math.min(3, articles.length); i++) {
            const article = articles[i];
            console.log(`Fetching full content for article ${i + 1}: ${article.title}`);
            
            const fullContent = await fetchArticleContent(article.url);
            
            articlesWithContent.push({
              ...article,
              fullContent: fullContent || article.description || 'No content available'
            });
          }

          // Create composite analysis with full article content
          const articleSummaries = articlesWithContent.map((article: any, index: number) => 
            `Article ${index + 1}:
Title: ${article.title}
Published: ${article.published_at}
URL: ${article.url}
Full Content: ${article.fullContent}`
          ).join('\n\n');

          const compositePrompt = `
You are a professional financial analyst. Analyze the following complete news articles for their impact on ${symbol} stock and provide a comprehensive composite analysis:

${articleSummaries}

Based on all these complete articles together, provide a JSON response:
{
  "confidence": "number between 1-100 representing your confidence level for the overall analysis",
  "sentiment": "string that MUST be either 'Bullish', 'Bearish', or 'Neutral' based on the collective impact",
  "reasoning": "comprehensive explanation analyzing the collective impact of all articles on ${symbol}, referencing specific details from the article content"
}

Focus on the overall trend and sentiment across all articles for ${symbol}. Use specific details from the article content to support your analysis.`;

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
                  content: 'You are a professional financial analyst. Provide comprehensive market analysis based on complete article content in valid JSON format only.'
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

          // Store composite analysis
          const { error: insertError } = await supabase
            .from('user_stock_articles')
            .insert({
              user_id: userId,
              symbol: symbol,
              title: `${symbol} Comprehensive Market Analysis`,
              description: `In-depth analysis based on ${articlesWithContent.length} complete news articles`,
              url: `https://finance.yahoo.com/quote/${symbol}`,
              published_at: new Date().toISOString(),
              ai_sentiment: analysis.sentiment,
              ai_confidence: analysis.confidence,
              ai_reasoning: analysis.reasoning
            });

          if (insertError) {
            console.error(`Failed to store analysis for ${symbol}:`, insertError);
          } else {
            console.log(`Successfully analyzed and stored ${symbol}: ${analysis.sentiment} sentiment`);
          }
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
