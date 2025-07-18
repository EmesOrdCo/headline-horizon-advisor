
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export const useStockPrices = (additionalSymbols: string[] = []) => {
  return useQuery({
    queryKey: ['stock-prices', additionalSymbols],
    queryFn: async () => {
      const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
      const MAJOR_INDEX_FUNDS = ['SPY', 'QQQ', 'DIA'];
      const ALL_SYMBOLS = [...MAGNIFICENT_7, ...MAJOR_INDEX_FUNDS, ...additionalSymbols];
      
      // Remove duplicates
      const uniqueSymbols = [...new Set(ALL_SYMBOLS)];
      
      console.log('useStockPrices called with additionalSymbols:', additionalSymbols);
      console.log('All unique symbols to fetch:', uniqueSymbols);
      
      try {
        console.log('Fetching live stock prices from Alpaca...');
        
        const results: StockPrice[] = [];
        const errors: Array<{symbol: string, error: string}> = [];
        
        // Fetch with 1 second delays to respect Alpaca limits
        for (const symbol of uniqueSymbols) {
          try {
            console.log(`Fetching price for ${symbol}...`);
            
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
            
            // Wait 1 second between requests (60 calls/minute to be safe)
            if (uniqueSymbols.indexOf(symbol) < uniqueSymbols.length - 1) {
              console.log('Waiting 1 second before next request...');
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
          } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            errors.push({ symbol, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }

        console.log(`Final results: Successfully fetched ${results.length}/${uniqueSymbols.length} stock prices`, results);
        if (errors.length > 0) {
          console.log(`Errors encountered:`, errors);
        }
        return results;
      } catch (error) {
        console.error('Error fetching stock prices:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds - data is fresh for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 1 minute
    retry: 1,
    retryDelay: 30000, // Wait 30 seconds between retries
    enabled: true, // Always enabled
  });
};
