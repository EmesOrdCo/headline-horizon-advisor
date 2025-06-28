
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
    name: 'CNBC Top News',
    url: 'https://feeds.nbcnews.com/nbcnews/public/business',
    category: 'Business'
  },
  {
    name: 'MarketWatch',
    url: 'https://feeds.marketwatch.com/marketwatch/topstories/',
    category: 'Markets'
  },
  {
    name: 'Bloomberg',
    url: 'https://feeds.bloomberg.com/politics/news.rss',
    category: 'Markets'
  },
  {
    name: 'Financial Times',
    url: 'https://www.ft.com/rss/home',
    category: 'Markets'
  }
];

async function parseRSSFeed(url: string, sourceName: string, category: string) {
  try {
    console.log(`🔄 Fetching RSS feed from ${sourceName}: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch RSS from ${sourceName}: ${response.status} ${response.statusText}`);
      return [];
    }

    const xmlText = await response.text();
    console.log(`📄 Received ${xmlText.length} characters from ${sourceName}`);
    
    // Simple XML parsing for RSS items
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];
      
      try {
        // Extract title
        const titleMatch = itemContent.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
        const rawTitle = titleMatch ? titleMatch[1].trim() : '';
        const title = rawTitle.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        
        // Extract description
        const descMatch = itemContent.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/i);
        const rawDescription = descMatch ? descMatch[1].trim() : '';
        const description = rawDescription.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        
        // Extract link
        const linkMatch = itemContent.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>|<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/i);
        const link = linkMatch ? (linkMatch[1] || linkMatch[2] || '').trim() : '';
        
        // Extract publication date
        const pubDateMatch = itemContent.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);
        const pubDate = pubDateMatch ? new Date(pubDateMatch[1].trim()).toISOString() : new Date().toISOString();

        if (title && link && title.length > 0) {
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
      } catch (itemError) {
        console.error(`⚠️ Error parsing item from ${sourceName}:`, itemError);
        continue;
      }
    }

    console.log(`✅ Successfully parsed ${items.length} articles from ${sourceName}`);
    return items.slice(0, 15); // Limit to 15 most recent articles per source
    
  } catch (error) {
    console.error(`❌ Error fetching RSS from ${sourceName}:`, error.message);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting RSS news fetch from 5 specified sources (NO Yahoo Finance)...');
    
    // Fetch from all RSS sources in parallel with individual error handling
    const rssPromises = RSS_SOURCES.map(async (source) => {
      try {
        const articles = await parseRSSFeed(source.url, source.name, source.category);
        return { source: source.name, articles, success: true };
      } catch (error) {
        console.error(`❌ Failed to fetch from ${source.name}:`, error.message);
        return { source: source.name, articles: [], success: false, error: error.message };
      }
    });
    
    const results = await Promise.allSettled(rssPromises);
    
    // Combine all successful results
    const allArticles = [];
    const sourceResults = [];
    
    results.forEach((result, index) => {
      const sourceName = RSS_SOURCES[index].name;
      
      if (result.status === 'fulfilled') {
        const sourceResult = result.value;
        allArticles.push(...sourceResult.articles);
        sourceResults.push({
          source: sourceName,
          count: sourceResult.articles.length,
          success: sourceResult.success,
          error: sourceResult.error || null
        });
        console.log(`✅ ${sourceName}: ${sourceResult.articles.length} articles (${sourceResult.success ? 'SUCCESS' : 'FAILED'})`);
      } else {
        console.error(`❌ ${sourceName}: Promise rejected - ${result.reason}`);
        sourceResults.push({
          source: sourceName,
          count: 0,
          success: false,
          error: result.reason?.message || 'Promise rejected'
        });
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
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log(`💾 Successfully stored ${allArticles.length} RSS news articles from 5 sources in database`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully fetched ${allArticles.length} RSS articles from 5 sources (Reuters, CNBC, MarketWatch, Bloomberg, Financial Times)`,
      sources: RSS_SOURCES.map(s => s.name),
      articleCount: allArticles.length,
      sourceResults: sourceResults,
      note: "Yahoo Finance has been removed - only using the 5 specified sources"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ RSS fetch error:', error.message);
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
