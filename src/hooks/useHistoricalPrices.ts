
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HistoricalDataPoint {
  date: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface HistoricalPricesResponse {
  symbol: string;
  data: HistoricalDataPoint[];
  count: number;
}

export const useHistoricalPrices = (symbol: string, timeframe: string = '1Day', limit: number = 30) => {
  return useQuery({
    queryKey: ['historical-prices', symbol, timeframe, limit],
    queryFn: async (): Promise<HistoricalPricesResponse> => {
      console.log(`Fetching historical prices for ${symbol} with timeframe ${timeframe} and limit ${limit}`);
      
      const { data, error } = await supabase.functions.invoke('historical-prices', {
        body: { symbol, timeframe, limit },
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to fetch historical prices');
      }
      
      if (data?.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }
      
      console.log(`Successfully fetched ${data?.count || 0} historical data points for ${symbol}`);
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - cache data longer
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes (new name for cacheTime)
    refetchInterval: false, // Don't auto-refetch to reduce API calls
    retry: 1,
    retryDelay: 30000,
    enabled: !!symbol,
  });
};
