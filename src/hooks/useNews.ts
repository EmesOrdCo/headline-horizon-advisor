
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
        .limit(50);

      if (error) {
        throw error;
      }

      return data;
    },
    staleTime: 30 * 1000, // 30 seconds - news is fresh for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 1 minute for faster news updates
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
