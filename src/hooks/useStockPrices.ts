
import { useQuery } from '@tanstack/react-query';

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
        console.log('Fetching live stock prices from Finnhub with rate limiting...');
        
        const results: StockPrice[] = [];
        
        // Fetch with longer delays to respect Finnhub free tier limits
        // 60 calls/minute = 1 call per second minimum
        // Adding 3-second delays to be extra conservative
        for (const symbol of MAGNIFICENT_7) {
          try {
            console.log(`Fetching price for ${symbol}...`);
            
            const response = await fetch('/api/stock-price', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ symbol }),
            });
            
            if (!response.ok) {
              if (response.status === 429) {
                console.error(`Rate limit hit for ${symbol}, skipping...`);
                // Wait longer before next request if we hit rate limit
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
              }
              console.error(`HTTP error for ${symbol}! status: ${response.status}`);
              continue;
            }
            
            const data = await response.json();
            
            if (data.error) {
              console.error(`API error for ${symbol}:`, data.error);
              continue;
            }
            
            if (data.price && data.price > 0) {
              results.push({
                symbol,
                price: parseFloat(data.price.toFixed(2)),
                change: parseFloat(data.change.toFixed(2)),
                changePercent: parseFloat(data.changePercent.toFixed(2))
              });
              console.log(`Successfully fetched price for ${symbol}: $${data.price}`);
            }
            
            // Wait 3 seconds between each request to respect rate limits
            if (MAGNIFICENT_7.indexOf(symbol) < MAGNIFICENT_7.length - 1) {
              console.log('Waiting 3 seconds before next request...');
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
            
          } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
          }
        }

        if (results.length === 0) {
          throw new Error('No valid stock data received from Finnhub - check rate limits');
        }

        console.log(`Successfully fetched ${results.length}/${MAGNIFICENT_7.length} stock prices`);
        return results;
      } catch (error) {
        console.error('Error fetching stock prices:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - longer cache to reduce API calls
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes instead of 1 minute
    retry: 1, // Reduce retries to avoid hitting rate limits
    retryDelay: 60000, // Wait 1 minute between retries
  });
};
