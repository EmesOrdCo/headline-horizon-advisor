
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StockPrice {
  symbol: string;
  price: number;
  askPrice: number;
  bidPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  error?: boolean;
  errorMessage?: string;
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
        console.log('Fetching stock prices from REST API...');
        
        const results: StockPrice[] = [];
        const errors: Array<{symbol: string, error: string}> = [];
        
        // Try to fetch all symbols, but limit concurrent requests to avoid rate limits
        const batchSize = 3;
        const batches: string[][] = [];
        
        for (let i = 0; i < uniqueSymbols.length; i += batchSize) {
          batches.push(uniqueSymbols.slice(i, i + batchSize));
        }
        
        for (const batch of batches) {
          const batchPromises = batch.map(async (symbol) => {
            try {
              console.log(`Fetching price for ${symbol}...`);
              
              const { data, error } = await supabase.functions.invoke('stock-price', {
                body: { symbol },
              });
              
              if (error) {
                console.error(`Supabase function error for ${symbol}:`, error);
                return {
                  symbol,
                  price: 0,
                  askPrice: 0,
                  bidPrice: 0,
                  previousClose: 0,
                  change: 0,
                  changePercent: 0,
                  error: true,
                  errorMessage: error.message || 'Function error'
                };
              }
              
              if (data?.error) {
                console.error(`API error for ${symbol}:`, data.error);
                return {
                  symbol,
                  price: 0,
                  askPrice: 0,
                  bidPrice: 0,
                  previousClose: 0,
                  change: 0,
                  changePercent: 0,
                  error: true,
                  errorMessage: data.error
                };
              }
              
              if (data?.price && data.price > 0) {
                const stockPrice: StockPrice = {
                  symbol,
                  price: parseFloat(data.price.toFixed(2)),
                  askPrice: parseFloat((data.askPrice || data.price).toFixed(2)),
                  bidPrice: parseFloat((data.bidPrice || data.price).toFixed(2)),
                  previousClose: parseFloat((data.previousClose || data.price).toFixed(2)),
                  change: parseFloat(data.change.toFixed(2)),
                  changePercent: parseFloat(data.changePercent.toFixed(2)),
                  error: false
                };
                console.log(`Successfully fetched price for ${symbol}:`, stockPrice);
                return stockPrice;
              } else {
                console.warn(`No valid price data for ${symbol}:`, data);
                return {
                  symbol,
                  price: 0,
                  askPrice: 0,
                  bidPrice: 0,
                  previousClose: 0,
                  change: 0,
                  changePercent: 0,
                  error: true,
                  errorMessage: 'No price data available'
                };
              }
              
            } catch (error) {
              console.error(`Error fetching price for ${symbol}:`, error);
              return {
                symbol,
                price: 0,
                askPrice: 0,
                bidPrice: 0,
                previousClose: 0,
                change: 0,
                changePercent: 0,
                error: true,
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
          
          // Wait between batches to avoid rate limits
          if (batches.indexOf(batch) < batches.length - 1) {
            console.log('Waiting 1 second before next batch...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        console.log(`Final results: Processed ${results.length} symbols`);
        console.log('Success:', results.filter(r => !r.error).length);
        console.log('Errors:', results.filter(r => r.error).length);
        
        return results;
      } catch (error) {
        console.error('Error fetching stock prices:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 1,
    retryDelay: 60000,
    enabled: true,
  });
};
