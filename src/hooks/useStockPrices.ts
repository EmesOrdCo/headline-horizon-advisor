
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  error?: boolean;
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
        console.log('Fetching stock prices from REST API only...');
        
        const results: StockPrice[] = [];
        const errors: Array<{symbol: string, error: string}> = [];
        
        // Try to fetch just a few symbols to test if API works at all
        const testSymbols = uniqueSymbols.slice(0, 3); // Just test with first 3 symbols
        
        for (const symbol of testSymbols) {
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
              const stockPrice: StockPrice = {
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
            
            // Wait 2 seconds between requests to be very conservative
            if (testSymbols.indexOf(symbol) < testSymbols.length - 1) {
              console.log('Waiting 2 seconds before next request...');
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
          } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            errors.push({ symbol, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }

        console.log(`Final results: Successfully fetched ${results.length}/${testSymbols.length} stock prices`, results);
        if (errors.length > 0) {
          console.log(`Errors encountered:`, errors);
        }
        
        // If we got no results at all, throw an error so the component shows "not available"
        if (results.length === 0) {
          throw new Error('No stock data available from API');
        }
        
        return results;
      } catch (error) {
        console.error('Error fetching stock prices:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 1,
    retryDelay: 60000, // Wait 1 minute between retries
    enabled: true,
  });
};
