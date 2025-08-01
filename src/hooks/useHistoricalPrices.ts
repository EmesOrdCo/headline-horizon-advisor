
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
      
      // Map timeframe to Alpaca timeframe format
      const alpacaTimeframe = timeframe === '1Day' ? '1Hour' : '1Day';
      
      const { data, error } = await supabase.functions.invoke('alpaca-historical-data', {
        body: { 
          symbol, 
          timeframe: alpacaTimeframe, 
          limit: Math.min(limit, 1000)
        },
      });
      
      if (error) {
        console.error('Alpaca function error:', error);
        throw new Error(error.message || 'Failed to fetch historical prices');
      }
      
      if (data?.error) {
        console.error('Alpaca API error:', data.error);
        throw new Error(data.error);
      }
      
      // Transform Alpaca data format to expected format
      const transformedData: HistoricalDataPoint[] = data?.bars?.map((bar: any) => ({
        date: new Date(bar.t).toISOString().split('T')[0],
        timestamp: bar.t,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v || 0,
      })) || [];
      
      const result: HistoricalPricesResponse = {
        symbol: data?.symbol || symbol,
        data: transformedData,
        count: transformedData.length,
      };
      
      console.log(`Successfully fetched ${result.count} historical data points for ${symbol}`);
      return result;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - cache data longer
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes (new name for cacheTime)
    refetchInterval: false, // Don't auto-refetch to reduce API calls
    retry: 1,
    retryDelay: 30000,
    enabled: !!symbol,
  });
};
