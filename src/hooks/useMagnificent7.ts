import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMagnificent7Articles = () => {
  return useQuery({
    queryKey: ['magnificent-7-articles'],
    queryFn: async () => {
      console.log('🔍 Fetching Magnificent 7 articles...');
      
      const magnificent7Symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .in('symbol', magnificent7Symbols)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching Magnificent 7 articles:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} Magnificent 7 articles`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: false, // Disable auto-refetch, let component handle it
  });
};

export const useFetchMagnificent7 = () => {
  return async () => {
    console.log('🚀 Starting Magnificent 7 analysis...');
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-magnificent-7');
      
      if (error) {
        console.error('❌ Magnificent 7 fetch error:', error);
        throw error;
      }
      
      console.log('✅ Magnificent 7 analysis completed:', data);
      return {
        success: true,
        message: data.message || 'Successfully analyzed Magnificent 7 stocks',
        data: data
      };
    } catch (error) {
      console.error('❌ Magnificent 7 analysis failed:', error);
      return {
        success: false,
        message: 'Failed to analyze Magnificent 7 stocks',
        error: error
      };
    }
  };
};