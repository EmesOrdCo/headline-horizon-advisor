
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useNews = () => {
  return useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Increased limit to get more articles

      if (error) {
        throw error;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFetchNews = () => {
  return async () => {
    const { data, error } = await supabase.functions.invoke('fetch-news');
    
    if (error) {
      throw error;
    }
    
    return data;
  };
};
