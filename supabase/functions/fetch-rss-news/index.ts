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

// Function to calculate string similarity
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Function to detect if text is in English
function isEnglishText(text: string): boolean {
  if (!text) return false;
  
  // Check for common English words
  const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must'];
  const words = text.toLowerCase().split(/\s+/);
  const englishWordCount = words.filter(word => englishWords.includes(word)).length;
  const englishRatio = englishWordCount / Math.min(words.length, 20); // Check first 20 words
  
  // Also check for non-Latin scripts
  const nonLatinRegex = /[\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/;
  const hasNonLatin = nonLatinRegex.test(text);
  
  return englishRatio > 0.15 && !hasNonLatin; // At least 15% English words and no non-Latin scripts
}

// Function to generate AI summary
async function generateAISummary(title: string, description: string): Promise<string | null> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ OpenAI API key not found, skipping AI summaries');
    return null;
  }
  
  try {
    const content = `${title}\n\n${description}`.substring(0, 1000); // Limit content length
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a financial news summarizer. Create a very brief 1-2 sentence summary of the key market impact or takeaway from this news article. Focus on actionable insights for investors.'
          },
          {
            role: 'user',
            content: `Summarize this financial news in 1-2 sentences:\n\n${content}`
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      console.error(`❌ OpenAI API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();
    
    if (summary) {
      console.log(`✅ Generated AI summary: ${summary.substring(0, 50)}...`);
      return summary;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error generating AI summary:', error);
    return null;
  }
}

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
    
    // Fetch recent general market news from MarketAux with better source diversity
    const apiUrl = `https://api.marketaux.com/v1/news/all?filter_entities=false&language=en&limit=100&sort=published_desc&api_token=${marketauxApiKey}`;
    console.log('📡 Making API request to MarketAux for diverse sources...');
    
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
    
    // Filter for recent articles (last 4 hours) and sort by published date
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    console.log('🕒 Filtering for articles published after:', fourHoursAgo.toISOString());
    
    const recentArticles = articles.filter(article => {
      if (!article.published_at) return false;
      
      const publishedDate = new Date(article.published_at);
      const isRecent = publishedDate > fourHoursAgo;
      
      if (!isRecent) {
        console.log(`⏰ Skipping older article: ${article.title} (published: ${article.published_at})`);
      }
      
      return isRecent;
    });
    
    console.log(`📅 Found ${recentArticles.length} recent articles (last 4 hours)`);
    
    const sortedArticles = recentArticles
      .filter(article => article.title && article.url && article.published_at) // Filter out invalid articles
      .filter(article => {
        // Blacklist Guru Focus articles
        const url = article.url?.toLowerCase() || '';
        const source = article.source?.toLowerCase() || '';
        return !url.includes('gurufocus') && !source.includes('guru focus') && !source.includes('gurufocus');
      })
      .filter(article => {
        // Filter for English-only articles
        const titleIsEnglish = isEnglishText(article.title || '');
        const descriptionIsEnglish = isEnglishText(article.description || '');
        const isEnglish = titleIsEnglish && (descriptionIsEnglish || !article.description);
        
        if (!isEnglish) {
          console.log(`🚫 Skipping non-English article: ${article.title}`);
        }
        
        return isEnglish;
      })
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 15);

    console.log(`🔄 Filtered and sorted to ${sortedArticles.length} English articles`);

    // Generate AI summaries for articles
    const processedArticles = [];
    for (const article of sortedArticles) {
      console.log(`🤖 Generating AI summary for: ${article.title.substring(0, 50)}...`);
      
      const aiSummary = await generateAISummary(
        article.title || 'No title',
        article.description || ''
      );
      
      processedArticles.push({
        title: article.title?.substring(0, 500) || 'No title',
        description: article.description?.substring(0, 1000) || '',
        url: article.url || '',
        published_at: article.published_at || new Date().toISOString(),
        category: 'Recent Headlines',
        symbol: 'GENERAL',
        ai_confidence: null,
        ai_sentiment: null,
        ai_reasoning: aiSummary, // Store AI summary in ai_reasoning field
        source_links: JSON.stringify([{
          title: article.title,
          url: article.url,
          published_at: article.published_at,
          source: article.source || 'MarketAux'
        }])
      });
    }

    console.log(`✅ Processed ${processedArticles.length} recent headlines with AI summaries`);
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

  // Temporarily disable Marketaux API calls
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Marketaux API calls temporarily disabled',
      headlines: [] 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );

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
      const existingUrls = new Set(existingArticles?.map(a => {
        // Normalize URLs by removing query parameters and fragments
        try {
          const url = new URL(a.url);
          return `${url.protocol}//${url.host}${url.pathname}`;
        } catch {
          return a.url;
        }
      }) || []);
      
      const existingTitles = new Set(existingArticles?.map(a => {
        // Normalize titles by removing punctuation and extra spaces
        return a.title.toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }) || []);
      
      // Filter out duplicates by URL and similar titles
      const newHeadlines = headlines.filter(headline => {
        // Normalize headline URL for comparison
        let normalizedUrl = headline.url;
        try {
          const url = new URL(headline.url);
          normalizedUrl = `${url.protocol}//${url.host}${url.pathname}`;
        } catch {
          // Keep original if URL parsing fails
        }
        
        // Check URL duplicates
        if (existingUrls.has(normalizedUrl)) {
          console.log(`🔄 Skipping duplicate URL: ${headline.url}`);
          return false;
        }
        
        // Normalize headline title for comparison
        const normalizedTitle = headline.title.toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Check title duplicates (normalized comparison)
        if (existingTitles.has(normalizedTitle)) {
          console.log(`🔄 Skipping duplicate title: ${headline.title}`);
          return false;
        }
        
        // Additional check for very similar titles (85% similarity)
        for (const existingTitle of existingTitles) {
          if (calculateSimilarity(normalizedTitle, existingTitle) > 0.85) {
            console.log(`🔄 Skipping similar title: ${headline.title}`);
            return false;
          }
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
