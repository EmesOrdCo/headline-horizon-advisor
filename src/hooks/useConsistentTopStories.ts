import { useMemo } from 'react';
import { Tables } from '@/integrations/supabase/types';

type NewsArticle = Tables<'news_articles'>;

interface UseConsistentTopStoriesProps {
  newsData: NewsArticle[] | undefined;
  magnificent7Symbols: string[];
  indexFundSymbols: string[];
}

export const useConsistentTopStories = ({
  newsData,
  magnificent7Symbols,
  indexFundSymbols
}: UseConsistentTopStoriesProps) => {
  
  // Helper function to get the most recent valid story for a symbol group
  const getTopStoryForSymbols = (symbols: string[]) => {
    if (!newsData || newsData.length === 0) return null;
    
    // For each symbol in the predefined order, find the most recent valid article
    for (const symbol of symbols) {
      const articles = newsData
        .filter(item => 
          item.symbol === symbol && 
          item.ai_confidence && 
          item.ai_sentiment &&
          item.ai_confidence > 0 // Ensure we have valid confidence
        )
        .sort((a, b) => {
          // Sort by created_at (most recent first)
          const aTime = new Date(a.created_at).getTime();
          const bTime = new Date(b.created_at).getTime();
          return bTime - aTime;
        });
      
      if (articles.length > 0) {
        return articles[0]; // Return the most recent valid article for this symbol
      }
    }
    
    return null;
  };

  // Helper function to check if there's new news (within last 24 hours)
  const hasRecentNews = (article: NewsArticle | null) => {
    if (!article) return false;
    
    const articleTime = new Date(article.created_at).getTime();
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    return articleTime > twentyFourHoursAgo;
  };

  const topMagnificent7Story = useMemo(() => {
    return getTopStoryForSymbols(magnificent7Symbols);
  }, [newsData, magnificent7Symbols]);

  const topIndexFundStory = useMemo(() => {
    return getTopStoryForSymbols(indexFundSymbols);
  }, [newsData, indexFundSymbols]);

  // Track if stories are from recent news (last 24 hours)
  const magnificent7HasRecentNews = useMemo(() => {
    return hasRecentNews(topMagnificent7Story);
  }, [topMagnificent7Story]);

  const indexFundsHasRecentNews = useMemo(() => {
    return hasRecentNews(topIndexFundStory);
  }, [topIndexFundStory]);

  return {
    topMagnificent7Story,
    topIndexFundStory,
    magnificent7HasRecentNews,
    indexFundsHasRecentNews
  };
};