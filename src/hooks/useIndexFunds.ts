import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useIndexFundsArticles = () => {
  return useQuery({
    queryKey: ['index-funds-articles'],
    queryFn: async () => {
      console.log('🔍 Fetching Index Funds articles...');
      
      const indexFundSymbols = ['SPY', 'QQQ', 'DIA'];
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .in('symbol', indexFundSymbols)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching Index Funds articles:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} Index Funds articles`);
      console.log('📊 Articles with AI analysis:', data?.filter(article => article.ai_confidence && article.ai_sentiment) || []);
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds - shorter to pick up new analyses
    refetchInterval: false, // Disable auto-refetch, let component handle it
  });
};

export const useFetchIndexFunds = () => {
  return async () => {
    console.log('🚀 Starting Index Funds analysis...');
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-index-funds');
      
      if (error) {
        console.error('❌ Index Funds fetch error:', error);
        throw error;
      }
      
      console.log('✅ Index Funds analysis completed:', data);
      return {
        success: true,
        message: data.message || 'Successfully analyzed Index Funds',
        data: data
      };
    } catch (error) {
      console.error('❌ Index Funds analysis failed:', error);
      return {
        success: false,
        message: 'Failed to analyze Index Funds',
        error: error
      };
    }
  };
};