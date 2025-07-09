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

// RSS Feed sources for financial news
const RSS_SOURCES = [
  {
    name: 'Reuters Business',
    url: 'https://feeds.reuters.com/reuters/businessNews',
    category: 'Business'
  },
  {
    name: 'MarketWatch',
    url: 'https://feeds.marketwatch.com/marketwatch/marketpulse/',
    category: 'Markets'
  },
  {
    name: 'CNBC Markets',
    url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    category: 'Markets'
  }
];

async function parseRSSFeed(url: string, sourceName: string, category: string) {
  try {
    console.log(`Fetching RSS feed from ${sourceName}: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch RSS from ${sourceName}: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    console.log(`Received XML from ${sourceName}, length: ${xmlText.length}`);
    
    // Simple XML parsing for RSS items
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];
      
      // Extract title
      const titleMatch = itemContent.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i);
      const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
      
      // Extract description
      const descMatch = itemContent.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i);
      const description = descMatch ? (descMatch[1] || descMatch[2] || '').replace(/<[^>]*>/g, '').trim() : '';
      
      // Extract link
      const linkMatch = itemContent.match(/<link[^>]*>(.*?)<\/link>|<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/i);
      const link = linkMatch ? (linkMatch[1] || linkMatch[2] || '').trim() : '';
      
      // Extract publication date
      const pubDateMatch = itemContent.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);
      const pubDate = pubDateMatch ? new Date(pubDateMatch[1].trim()).toISOString() : new Date().toISOString();

      if (title && link) {
        items.push({
          title: title.substring(0, 500),
          description: description.substring(0, 1000),
          url: link,
          published_at: pubDate,
          source: sourceName,
          category: category,
          symbol: 'GENERAL',
          ai_confidence: null,
          ai_sentiment: null,
          ai_reasoning: null,
          source_links: JSON.stringify([{
            title: title,
            url: link,
            published_at: pubDate
          }])
        });
      }
    }

    console.log(`✅ Parsed ${items.length} articles from ${sourceName}`);
    return items.slice(0, 15);
    
  } catch (error) {
    console.error(`❌ Error parsing RSS from ${sourceName}:`, error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting RSS news fetch from multiple sources...');
    
    // First, delete old RSS articles (older than 24 hours) to keep the database clean
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('news_articles')
      .delete()
      .eq('symbol', 'GENERAL')
      .lt('created_at', twentyFourHoursAgo);

    console.log('🧹 Cleaned up old RSS articles');
    
    // Fetch from all RSS sources in parallel
    const rssPromises = RSS_SOURCES.map(source => 
      parseRSSFeed(source.url, source.name, source.category)
    );
    
    const results = await Promise.allSettled(rssPromises);
    
    // Combine all successful results
    const allArticles = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
        console.log(`✅ ${RSS_SOURCES[index].name}: ${result.value.length} articles`);
      } else {
        console.error(`❌ ${RSS_SOURCES[index].name}: ${result.reason}`);
      }
    });

    console.log(`📰 Total articles collected: ${allArticles.length}`);

    if (allArticles.length > 0) {
      // Store articles in database
      const { data, error } = await supabase
        .from('news_articles')
        .upsert(allArticles, { 
          onConflict: 'url',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log(`💾 Successfully stored ${allArticles.length} RSS news articles in database`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully fetched ${allArticles.length} RSS articles from ${RSS_SOURCES.length} sources`,
      sources: RSS_SOURCES.map(s => s.name),
      articleCount: allArticles.length,
      articles: allArticles.slice(0, 5)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ RSS fetch error:', error);
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
