
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from '@/integrations/supabase/client';

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketDataContextType {
  marketData: MarketIndex[];
  isLoading: boolean;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};

interface MarketDataProviderProps {
  children: ReactNode;
}

export const MarketDataProvider = ({ children }: MarketDataProviderProps) => {
  const [marketData, setMarketData] = useState<MarketIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Major market indices - using fewer symbols to respect rate limits
        const indices = [
          { symbol: 'SPY', name: 'S&P 500' },
          { symbol: 'QQQ', name: 'NASDAQ' },
          { symbol: 'DIA', name: 'Dow Jones' },
          { symbol: 'AAPL', name: 'AAPL' },
          { symbol: 'TSLA', name: 'TSLA' },
          { symbol: 'NVDA', name: 'NVDA' },
          { symbol: 'MSFT', name: 'MSFT' },
          { symbol: 'GOOGL', name: 'GOOGL' }
        ];

        console.log('Fetching live market data from Finnhub...');

        const results: MarketIndex[] = [];

        // Fetch with 1.5 second delays
        for (const index of indices) {
          try {
            console.log(`Fetching data for ${index.symbol}...`);

            const { data, error } = await supabase.functions.invoke('stock-price', {
              body: { symbol: index.symbol },
            });

            if (error) {
              console.error(`Supabase function error for ${index.symbol}:`, error);
              continue;
            }

            if (data?.error) {
              console.error(`API error for ${index.symbol}:`, data.error);
              continue;
            }

            if (data?.price && data.price > 0) {
              results.push({
                symbol: index.name,
                name: index.name,
                price: parseFloat(data.price.toFixed(2)),
                change: parseFloat(data.change.toFixed(2)),
                changePercent: parseFloat(data.changePercent.toFixed(2))
              });
              console.log(`Successfully fetched data for ${index.symbol}: $${data.price}`);
            }

            // Wait 1.5 seconds between each request
            if (indices.indexOf(index) < indices.length - 1) {
              console.log('Waiting 1.5 seconds before next request...');
              await new Promise(resolve => setTimeout(resolve, 1500));
            }

          } catch (error) {
            console.error(`Error fetching data for ${index.symbol}:`, error);
          }
        }

        if (results.length > 0) {
          setMarketData(results);
          console.log(`Successfully fetched ${results.length} market indices`);
        } else {
          console.error('No valid market data received');
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch once when the context is first created
    fetchMarketData();
  }, []);

  return (
    <MarketDataContext.Provider value={{ marketData, isLoading }}>
      {children}
    </MarketDataContext.Provider>
  );
};
