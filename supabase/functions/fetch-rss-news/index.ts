
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const marketauxApiKey = Deno.env.get('MARKETAUX_API_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// News sources we want to target
const TARGET_SOURCES = ['Reuters', 'CNBC', 'MarketWatch', 'Bloomberg', 'Financial Times'];

async function fetchNewsFromMarketaux() {
  try {
    console.log('🔄 Fetching news from MarketAux API...');
    
    const response = await fetch(
      `https://api.marketaux.com/v1/news/all?api_token=${marketauxApiKey}&limit=50&language=en&sort=published_desc&filter_entities=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      }
    );

    if (!response.ok) {
      console.error(`❌ MarketAux API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    console.log(`📄 Received ${data.data?.length || 0} articles from MarketAux`);

    if (!data.data || !Array.isArray(data.data)) {
      console.error('❌ Invalid response format from MarketAux');
      return [];
    }

    // Filter and process articles from our target sources
    const filteredArticles = data.data
      .filter((article: any) => {
        const source = article.source || '';
        return TARGET_SOURCES.some(targetSource => 
          source.toLowerCase().includes(targetSource.toLowerCase()) ||
          targetSource.toLowerCase().includes(source.toLowerCase())
        );
      })
      .slice(0, 30) // Limit to 30 articles
      .map((article: any) => ({
        title: article.title?.substring(0, 500) || 'No title',
        description: article.description?.substring(0, 1000) || article.snippet?.substring(0, 1000) || 'No description available',
        url: article.url || '',
        published_at: article.published_at ? new Date(article.published_at).toISOString() : new Date().toISOString(),
        source: article.source || 'Unknown',
        category: 'Business',
        symbol: 'RSS', // Mark as RSS source for compatibility
        ai_confidence: null,
        ai_sentiment: null,
        ai_reasoning: null,
        source_links: JSON.stringify([{
          title: article.title || 'No title',
          url: article.url || '',
          published_at: article.published_at ? new Date(article.published_at).toISOString() : new Date().toISOString()
        }])
      }));

    console.log(`✅ Filtered ${filteredArticles.length} articles from target sources`);
    
    // Group by source for logging
    const sourceGroups = filteredArticles.reduce((acc: any, article: any) => {
      acc[article.source] = (acc[article.source] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Articles by source:', sourceGroups);
    
    return filteredArticles;

  } catch (error) {
    console.error('❌ Error fetching from MarketAux:', error.message);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting news fetch from MarketAux API for 5 target sources...');
    console.log('🎯 Target sources:', TARGET_SOURCES.join(', '));
    
    const articles = await fetchNewsFromMarketaux();
    
    console.log(`📰 Total articles collected: ${articles.length}`);

    if (articles.length > 0) {
      // Store articles in database
      const { data, error } = await supabase
        .from('news_articles')
        .upsert(articles, { 
          onConflict: 'url',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log(`💾 Successfully stored ${articles.length} news articles from MarketAux in database`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully fetched ${articles.length} articles from MarketAux API`,
      sources: TARGET_SOURCES,
      articleCount: articles.length,
      note: "Using MarketAux API to fetch news from Reuters, CNBC, MarketWatch, Bloomberg, and Financial Times"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ News fetch error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
