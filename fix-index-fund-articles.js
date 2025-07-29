import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zctmqrmnmmjrqbehcfis.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdG1xcm1ubW1qcnFiZWhjZmlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTA3NDU5OCwiZXhwIjoyMDUwNjUwNTk4fQ.mfBPxJvL9jV7zNmF8zrWJ_T5C6qYBOaHLqgE8rF2-qM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function reassignIndexFundArticles() {
  console.log('🔄 Reassigning index fund articles...');
  
  try {
    // Get all articles currently labeled as 'MARKET'
    const { data: marketArticles, error: fetchError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('symbol', 'MARKET');
    
    if (fetchError) {
      console.error('❌ Error fetching articles:', fetchError);
      return;
    }
    
    console.log(`📄 Found ${marketArticles.length} articles to process`);
    
    // Keyword mapping for index funds
    const keywordMapping = {
      'SPY': ['SPY', 'S&P 500', 'S&P500', 'Standard & Poor\'s 500', 'SPDR S&P 500'],
      'QQQ': ['QQQ', 'NASDAQ', 'Nasdaq', 'PowerShares QQQ', 'Invesco QQQ'],
      'DIA': ['DIA', 'Dow Jones', 'DJIA', 'Dow Industrial', 'SPDR Dow Jones']
    };
    
    let updatedCount = 0;
    
    for (const article of marketArticles) {
      let newSymbol = 'MARKET'; // Default fallback
      
      // Check title and description for keywords
      const articleText = `${article.title} ${article.description || ''}`.toLowerCase();
      
      for (const [symbol, keywords] of Object.entries(keywordMapping)) {
        if (keywords.some(keyword => articleText.includes(keyword.toLowerCase()))) {
          newSymbol = symbol;
          break; // Use first match found
        }
      }
      
      // If no specific fund keywords found, check for broader market terms and assign to SPY
      if (newSymbol === 'MARKET') {
        const marketTerms = ['market', 'stocks', 'equities', 'index', 'etf', 'fund'];
        if (marketTerms.some(term => articleText.includes(term))) {
          newSymbol = 'SPY'; // Default index fund for general market news
        }
      }
      
      // Update article if symbol changed
      if (newSymbol !== 'MARKET') {
        const { error: updateError } = await supabase
          .from('news_articles')
          .update({ 
            symbol: newSymbol,
            category: 'Index Fund',
            ai_reasoning: `Index fund news article - keyword-based assignment to ${newSymbol}`
          })
          .eq('id', article.id);
        
        if (updateError) {
          console.error(`❌ Error updating article ${article.id}:`, updateError);
        } else {
          console.log(`✅ Updated article "${article.title.substring(0, 50)}..." -> ${newSymbol}`);
          updatedCount++;
        }
      }
    }
    
    console.log(`🎉 Successfully reassigned ${updatedCount} articles to index funds`);
    
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

reassignIndexFundArticles();