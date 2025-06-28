
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStockArticle {
  id: string;
  symbol: string;
  title: string;
  description: string | null;
  url: string | null;
  published_at: string | null;
  ai_sentiment: string | null;
  ai_confidence: number | null;
  ai_reasoning: string | null;
  created_at: string;
}

export const useUserStockArticles = (symbols: string[]) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-stock-articles', user?.id, symbols],
    queryFn: async (): Promise<UserStockArticle[]> => {
      if (!user || symbols.length === 0) return [];

      const { data, error } = await supabase
        .from('user_stock_articles')
        .select('*')
        .in('symbol', symbols)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching user stock articles:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && symbols.length > 0,
  });
};

export const useFetchUserStockNews = () => {
  return useQuery({
    queryKey: ['fetch-user-stock-news'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-user-stock-news');

      if (error) {
        console.error('Error fetching user stock news:', error);
        throw error;
      }

      return data;
    },
    enabled: false, // Only run when manually triggered
  });
};
