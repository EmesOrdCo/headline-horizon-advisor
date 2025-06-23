
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
        console.log('Fetching live stock prices from Finnhub...');
        
        // Fetch sequentially to respect rate limits on free tier
        const results: StockPrice[] = [];
        
        for (const symbol of MAGNIFICENT_7) {
          try {
            const response = await fetch('/api/stock-price', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ symbol }),
            });
            
            if (!response.ok) {
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
            }
          } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
          }
        }

        if (results.length === 0) {
          throw new Error('No valid stock data received from Finnhub');
        }

        console.log(`Successfully fetched ${results.length} stock prices`);
        return results;
      } catch (error) {
        console.error('Error fetching stock prices:', error);
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every 1 minute to respect rate limits
    retry: 2,
  });
};
