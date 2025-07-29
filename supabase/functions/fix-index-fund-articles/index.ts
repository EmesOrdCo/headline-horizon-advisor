import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting index fund article reassignment...');
    
    // Get all articles currently labeled as 'MARKET'
    const { data: marketArticles, error: fetchError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('symbol', 'MARKET');
    
    if (fetchError) {
      console.error('❌ Error fetching articles:', fetchError);
      throw fetchError;
    }
    
    console.log(`📄 Found ${marketArticles.length} articles to process`);
    
    // Keyword mapping for index funds
    const keywordMapping = {
      'SPY': ['spy', 's&p 500', 's&p500', 'standard & poor\'s 500', 'spdr s&p 500'],
      'QQQ': ['qqq', 'nasdaq', 'powerShares qqq', 'invesco qqq'],
      'DIA': ['dia', 'dow jones', 'djia', 'dow industrial', 'spdr dow jones']
    };
    
    let updatedCount = 0;
    const updates = [];
    
    for (const article of marketArticles) {
      let newSymbol = null;
      
      // Check title and description for keywords
      const articleText = `${article.title} ${article.description || ''}`.toLowerCase();
      
      for (const [symbol, keywords] of Object.entries(keywordMapping)) {
        if (keywords.some(keyword => articleText.includes(keyword.toLowerCase()))) {
          newSymbol = symbol;
          break; // Use first match found
        }
      }
      
      // Update article if symbol should change
      if (newSymbol) {
        const { error: updateError } = await supabase
          .from('news_articles')
          .update({ 
            symbol: newSymbol,
            category: 'Index Fund'
          })
          .eq('id', article.id);
        
        if (updateError) {
          console.error(`❌ Error updating article ${article.id}:`, updateError);
        } else {
          console.log(`✅ Updated article "${article.title.substring(0, 50)}..." -> ${newSymbol}`);
          updatedCount++;
          updates.push({
            id: article.id,
            title: article.title.substring(0, 100),
            oldSymbol: 'MARKET',
            newSymbol: newSymbol
          });
        }
      }
    }
    
    console.log(`🎉 Successfully reassigned ${updatedCount} articles to index funds`);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully reassigned ${updatedCount} articles to index funds`,
      totalProcessed: marketArticles.length,
      updatedCount: updatedCount,
      updates: updates
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in fix-index-fund-articles function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});