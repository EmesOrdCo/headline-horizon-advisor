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
  
  console.log('🔑 Checking MarketAux API key...');
  if (!marketauxApiKey) {
    console.error('❌ MarketAux API key not found in environment variables');
    throw new Error('Missing MarketAux API key');
  }
  
  console.log('✅ MarketAux API key found');

  try {
    console.log('🔍 Fetching recent headlines from MarketAux...');
    
    // Get current time for recent news filtering (last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    // Fetch recent general market news from MarketAux with published_after filter for recent news
    const apiUrl = `https://api.marketaux.com/v1/news/all?filter_entities=true&language=en&limit=20&published_after=${twoHoursAgo}&api_token=${marketauxApiKey}`;
    console.log('📡 Making API request to MarketAux for news published after:', twoHoursAgo);
    
    const response = await fetch(apiUrl);
    
    console.log(`📊 MarketAux API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ MarketAux API error: ${response.status} - ${errorText}`);
      throw new Error(`MarketAux API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 MarketAux API response received');
    
    if (!data || !data.data) {
      console.error('❌ Invalid API response format:', data);
      throw new Error('Invalid API response format');
    }
    
    const articles = data.data || [];
    console.log(`📰 Fetched ${articles.length} articles from MarketAux`);
    
    if (articles.length === 0) {
      console.log('⚠️ No articles returned from MarketAux');
      return [];
    }
    
    // Sort by published date (most recent first) and ensure we have exactly 15
    const sortedArticles = articles
      .filter(article => article.title && article.url && article.published_at) // Filter out invalid articles
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 15);

    console.log(`🔄 Filtered and sorted to ${sortedArticles.length} articles`);

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
    
    // Delete old headlines (older than 4 hours) to keep database fresh
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    console.log('🧹 Cleaning up old headlines older than:', fourHoursAgo);
    
    const { error: deleteError } = await supabase
      .from('news_articles')
      .delete()
      .eq('symbol', 'GENERAL')
      .lt('published_at', fourHoursAgo);

    if (deleteError) {
      console.error('⚠️ Error cleaning up old headlines:', deleteError);
    } else {
      console.log('✅ Cleaned up old headlines');
    }
    
    // Fetch recent headlines from MarketAux
    const headlines = await fetchRecentHeadlines();

    if (headlines.length > 0) {
      console.log(`💾 Processing ${headlines.length} headlines for storage...`);
      
      // Get existing articles from the last 24 hours to prevent duplicates
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existingArticles, error: fetchError } = await supabase
        .from('news_articles')
        .select('url, title')
        .eq('symbol', 'GENERAL')
        .gt('published_at', twentyFourHoursAgo);
      
      if (fetchError) {
        console.error('⚠️ Error fetching existing articles:', fetchError);
      }
      
      // Create sets for efficient duplicate checking
      const existingUrls = new Set(existingArticles?.map(a => a.url) || []);
      const existingTitles = new Set(existingArticles?.map(a => a.title.toLowerCase()) || []);
      
      // Filter out duplicates by URL and similar titles
      const newHeadlines = headlines.filter(headline => {
        // Check URL duplicates
        if (existingUrls.has(headline.url)) {
          console.log(`🔄 Skipping duplicate URL: ${headline.url}`);
          return false;
        }
        
        // Check title duplicates (case-insensitive)
        const titleLower = headline.title.toLowerCase();
        if (existingTitles.has(titleLower)) {
          console.log(`🔄 Skipping duplicate title: ${headline.title}`);
          return false;
        }
        
        return true;
      });
      
      console.log(`📊 Found ${existingUrls.size} existing URLs and ${existingTitles.size} existing titles`);
      console.log(`📝 Filtered to ${newHeadlines.length} truly new headlines`);
      
      if (newHeadlines.length > 0) {
        const { error: insertError } = await supabase
          .from('news_articles')
          .insert(newHeadlines);

        if (insertError) {
          console.error('❌ Database insert error:', insertError);
          throw insertError;
        }

        console.log(`✅ Successfully stored ${newHeadlines.length} new headlines`);
      } else {
        console.log('ℹ️ No new headlines to store (all filtered as duplicates)');
      }
    } else {
      console.log('⚠️ No headlines to store');
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
