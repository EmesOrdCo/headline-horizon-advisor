
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MoverStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
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
}

export const useBiggestMovers = () => {
  return useQuery({
    queryKey: ['biggest-movers-all'],
    queryFn: async (): Promise<BiggestMoversData> => {
      console.log('Fetching comprehensive biggest movers data from expanded stock universe...');
      
      const { data, error } = await supabase.functions.invoke('get-biggest-movers-all');
      
      if (error) {
        console.error('Error fetching biggest movers:', error);
        throw error;
      }
      
      if (data.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }
      
      console.log(`Received ${data.gainers?.length || 0} gainers and ${data.losers?.length || 0} losers with comprehensive news coverage`);
      
      return {
        gainers: data.gainers || [],
        losers: data.losers || [],
        lastUpdated: data.lastUpdated || new Date().toISOString()
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 1
  });
};
