import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchRecentHeadlines() {
  const marketauxApiKey = Deno.env.get('MARKETAUX_API_KEY');
  
  if (!marketauxApiKey) {
    throw new Error('Missing MarketAux API key');
  }

  try {
    console.log('🔍 Fetching recent headlines from MarketAux...');
    
    // Fetch recent general market news from MarketAux
    const response = await fetch(
      `https://api.marketaux.com/v1/news/all?filter_entities=true&language=en&limit=50&api_token=${marketauxApiKey}&sort=published_desc`
    );

    if (!response.ok) {
      console.error(`MarketAux API error: ${response.status}`);
      throw new Error(`MarketAux API error: ${response.status}`);
    }

    const data = await response.json();
    const articles = data.data || [];
    
    console.log(`📰 Fetched ${articles.length} articles from MarketAux`);
    
    // Sort by published date (most recent first) and take top 15
    const sortedArticles = articles
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 15);

    // Format for database storage
    const processedArticles = sortedArticles.map(article => ({
      title: article.title?.substring(0, 500) || 'No title',
      description: article.description?.substring(0, 1000) || '',
      url: article.url || '',
      published_at: article.published_at || new Date().toISOString(),
      category: 'Recent Headlines',
      symbol: 'GENERAL',
      ai_confidence: null,
      ai_sentiment: null,
      ai_reasoning: null,
      source_links: JSON.stringify([{
        title: article.title,
        url: article.url,
        published_at: article.published_at,
        source: article.source || 'MarketAux'
      }])
    }));

    console.log(`✅ Processed ${processedArticles.length} recent headlines`);
    return processedArticles;
    
  } catch (error) {
    console.error('❌ Error fetching recent headlines:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting recent headlines fetch from MarketAux...');
    
    // Delete old headlines (older than 6 hours) to keep database fresh
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('news_articles')
      .delete()
      .eq('symbol', 'GENERAL')
      .lt('created_at', sixHoursAgo);

    console.log('🧹 Cleaned up old headlines');
    
    // Fetch recent headlines from MarketAux
    const headlines = await fetchRecentHeadlines();

    if (headlines.length > 0) {
      // Store headlines in database
      const { data, error } = await supabase
        .from('news_articles')
        .upsert(headlines, { 
          onConflict: 'url',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log(`💾 Successfully stored ${headlines.length} recent headlines in database`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully fetched ${headlines.length} recent headlines from MarketAux`,
      headlineCount: headlines.length,
      headlines: headlines.slice(0, 5) // Return first 5 as preview
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Recent headlines fetch error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
