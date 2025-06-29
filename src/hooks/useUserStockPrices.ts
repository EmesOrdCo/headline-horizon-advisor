
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export const useUserStockPrices = (symbols: string[] = []) => {
  return useQuery({
    queryKey: ['user-stock-prices', symbols],
    queryFn: async () => {
      if (symbols.length === 0) return [];
      
      console.log('useUserStockPrices called with symbols:', symbols);
      
      try {
        const results: StockPrice[] = [];
        const errors: Array<{symbol: string, error: string}> = [];
        
        // Fetch with 1 second delays for user stocks only
        for (const symbol of symbols) {
          try {
            console.log(`Fetching price for user stock ${symbol}...`);
            
            const { data, error } = await supabase.functions.invoke('stock-price', {
              body: { symbol },
            });
            
            if (error) {
              console.error(`Supabase function error for ${symbol}:`, error);
              errors.push({ symbol, error: error.message || 'Function error' });
              continue;
            }
            
            if (data?.error) {
              console.error(`API error for ${symbol}:`, data.error);
              errors.push({ symbol, error: data.error });
              continue;
            }
            
            if (data?.price && data.price > 0) {
              const stockPrice = {
                symbol,
                price: parseFloat(data.price.toFixed(2)),
                change: parseFloat(data.change.toFixed(2)),
                changePercent: parseFloat(data.changePercent.toFixed(2))
              };
              results.push(stockPrice);
              console.log(`Successfully fetched price for ${symbol}:`, stockPrice);
            } else {
              console.warn(`No valid price data for ${symbol}:`, data);
              errors.push({ symbol, error: 'No price data available' });
            }
            
            // Wait 1 second between requests for faster loading
            if (symbols.indexOf(symbol) < symbols.length - 1) {
              console.log('Waiting 1 second before next request...');
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
          } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            errors.push({ symbol, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }

        console.log(`Final results: Successfully fetched ${results.length}/${symbols.length} user stock prices`, results);
        if (errors.length > 0) {
          console.log(`Errors encountered:`, errors);
        }
        return results;
      } catch (error) {
        console.error('Error fetching user stock prices:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 1 minute
    retry: 1,
    retryDelay: 15000, // Wait 15 seconds between retries
    enabled: symbols.length > 0,
  });
};
