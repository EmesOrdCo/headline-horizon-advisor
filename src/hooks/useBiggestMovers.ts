
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MoverStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  exchange: string;
  headlines: Array<{
    title: string;
    summary: string;
    url: string;
    publishedAt: string;
  }>;
  overallImpact?: string;
}

interface BiggestMoversData {
  gainers: MoverStock[];
  losers: MoverStock[];
  lastUpdated: string;
  totalStocksAnalyzed: number;
  exchangesCovered: number;
}

export const useBiggestMovers = () => {
  return useQuery({
    queryKey: ['biggest-movers-global'],
    queryFn: async (): Promise<BiggestMoversData> => {
      console.log('Fetching biggest movers from all global exchanges...');
      
      const { data, error } = await supabase.functions.invoke('get-biggest-movers-all');
      
      if (error) {
        console.error('Error fetching global biggest movers:', error);
        throw error;
      }
      
      if (data.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }
      
      console.log(`Received global movers: ${data.gainers?.length || 0} gainers and ${data.losers?.length || 0} losers from ${data.exchangesCovered || 0} exchanges (${data.totalStocksAnalyzed || 0} stocks analyzed)`);
      
      return {
        gainers: data.gainers || [],
        losers: data.losers || [],
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        totalStocksAnalyzed: data.totalStocksAnalyzed || 0,
        exchangesCovered: data.exchangesCovered || 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes (longer due to comprehensive analysis)
    retry: 1
  });
};
