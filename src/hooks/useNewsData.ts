
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NewsArticle {
  id: string;
  symbol: string;
  title: string;
  description?: string;
  url?: string;
  published_at?: string;
  category?: string;
  priority?: string;
  ai_prediction?: string;
  ai_confidence?: number;
  ai_sentiment?: string;
  ai_reasoning?: string;
  created_at: string;
}

export const useNewsData = () => {
  return useQuery({
    queryKey: ['news-articles'],
    queryFn: async (): Promise<NewsArticle[]> => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching news:', error);
        throw error;
      }

      return data || [];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useFetchNews = () => {
  return async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-news');
      
      if (error) {
        console.error('Error fetching news:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error invoking fetch-news function:', error);
      throw error;
    }
  };
};
