
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRSSHeadlines = () => {
  return useQuery({
    queryKey: ['rss-headlines'],
    queryFn: async () => {
      console.log('🔍 Fetching RSS headlines...');
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('symbol', 'GENERAL')
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Error fetching RSS headlines:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} RSS headlines`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: false, // Disable auto-refetch, let component handle it
  });
};

export const useFetchRSSNews = () => {
  return async () => {
    console.log('🚀 Starting RSS news fetch...');
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-rss-news');
      
      if (error) {
        console.error('❌ RSS fetch error:', error);
        throw error;
      }
      
      console.log('✅ RSS fetch completed:', data);
      return {
        success: true,
        message: data.message || 'Successfully fetched RSS headlines',
        data: data
      };
    } catch (error) {
      console.error('❌ RSS fetch failed:', error);
      return {
        success: false,
        message: 'Failed to fetch RSS headlines',
        error: error
      };
    }
  };
};
