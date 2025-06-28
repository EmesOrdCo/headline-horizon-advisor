
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
        .limit(100);

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
    console.log('Starting to fetch news from all sources...');
    
    const results = await Promise.allSettled([
      supabase.functions.invoke('fetch-magnificent-7'),
      supabase.functions.invoke('fetch-index-funds'),
      supabase.functions.invoke('fetch-crypto')
    ]);

    const responses = results.map((result, index) => {
      const assetTypes = ['Magnificent 7', 'Index Funds', 'Cryptocurrencies'];
      if (result.status === 'fulfilled') {
        console.log(`✅ ${assetTypes[index]} fetch completed:`, result.value.data);
        return { success: true, assetType: assetTypes[index], data: result.value.data };
      } else {
        console.error(`❌ ${assetTypes[index]} fetch failed:`, result.reason);
        return { success: false, assetType: assetTypes[index], error: result.reason };
      }
    });

    const successCount = responses.filter(r => r.success).length;
    console.log(`Completed fetching news: ${successCount}/3 asset types successful`);
    
    return {
      success: successCount > 0,
      results: responses,
      message: `Fetched news for ${successCount} out of 3 asset types`
    };
  };
};
