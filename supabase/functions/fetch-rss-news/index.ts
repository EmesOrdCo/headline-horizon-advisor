
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

// RSS Feed sources - ONLY the 5 specified sources, NO Yahoo Finance
const RSS_SOURCES = [
  {
    name: 'Reuters Business',
    url: 'https://feeds.reuters.com/reuters/businessNews',
    category: 'Business'
  },
  {
    name: 'CNBC Markets',
    url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    category: 'Markets'
  },
  {
    name: 'MarketWatch',
    url: 'https://feeds.marketwatch.com/marketwatch/marketpulse/',
    category: 'Markets'
  },
  {
    name: 'Bloomberg Markets',
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    category: 'Markets'
  },
  {
    name: 'Financial Times',
    url: 'https://www.ft.com/markets?format=rss',
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
          title: title.substring(0, 500), // Limit title length
          description: description.substring(0, 1000), // Limit description length
          url: link,
          published_at: pubDate,
          source: sourceName,
          category: category,
          symbol: 'RSS', // Mark as RSS source
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
    return items.slice(0, 10); // Limit to 10 most recent articles per source
    
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
    console.log('🚀 Starting RSS news fetch from 5 specified sources (NO Yahoo Finance)...');
    
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

    console.log(`📰 Total articles collected from 5 sources: ${allArticles.length}`);

    if (allArticles.length > 0) {
      // Store articles in database
      const { data, error } = await supabase
        .from('news_articles')
        .upsert(allArticles, { 
          onConflict: 'url',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log(`💾 Successfully stored RSS news articles from 5 sources in database`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully fetched ${allArticles.length} RSS articles from 5 sources (Reuters, CNBC, MarketWatch, Bloomberg, Financial Times)`,
      sources: RSS_SOURCES.map(s => s.name),
      articleCount: allArticles.length,
      note: "Yahoo Finance has been removed - only using the 5 specified sources"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ RSS fetch error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
