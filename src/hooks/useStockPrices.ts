
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export const useStockPrices = () => {
  return useQuery({
    queryKey: ['stock-prices'],
    queryFn: async () => {
      const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
      
      try {
        console.log('Fetching live stock prices from Finnhub...');
        
        const results: StockPrice[] = [];
        
        // Fetch with 1 second delays to respect Finnhub limits (60 calls/minute)
        for (const symbol of MAGNIFICENT_7) {
          try {
            console.log(`Fetching price for ${symbol}...`);
            
            const { data, error } = await supabase.functions.invoke('stock-price', {
              body: { symbol },
            });
            
            if (error) {
              console.error(`Supabase function error for ${symbol}:`, error);
              continue;
            }
            
            if (data?.error) {
              console.error(`API error for ${symbol}:`, data.error);
              continue;
            }
            
            if (data?.price && data.price > 0) {
              results.push({
                symbol,
                price: parseFloat(data.price.toFixed(2)),
                change: parseFloat(data.change.toFixed(2)),
                changePercent: parseFloat(data.changePercent.toFixed(2))
              });
              console.log(`Successfully fetched price for ${symbol}: $${data.price}`);
            }
            
            // Wait 1.5 seconds between each request (40 calls/minute to be safe)
            if (MAGNIFICENT_7.indexOf(symbol) < MAGNIFICENT_7.length - 1) {
              console.log('Waiting 1.5 seconds before next request...');
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
            
          } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
          }
        }

        if (results.length === 0) {
          throw new Error('No valid stock data received from Finnhub');
        }

        console.log(`Successfully fetched ${results.length}/${MAGNIFICENT_7.length} stock prices`);
        return results;
      } catch (error) {
        console.error('Error fetching stock prices:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds - data is fresh for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 1 minute (allows for 7*1.5s = ~11s per cycle)
    retry: 1,
    retryDelay: 30000, // Wait 30 seconds between retries
  });
};
