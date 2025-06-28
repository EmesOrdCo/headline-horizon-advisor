
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const MarketTicker = () => {
  const [marketData, setMarketData] = useState<MarketIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Major market indices - using fewer symbols to respect rate limits
        const indices = [
          { symbol: 'SPY', name: 'SPX' },
          { symbol: 'QQQ', name: 'IXIC' },
          { symbol: 'DIA', name: 'DJI' },
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
          if (marketData.length === 0) {
            setMarketData([]);
          }
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    // Refetch every 2 minutes (allows time for all API calls to complete)
    const interval = setInterval(fetchMarketData, 120000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 py-2">
        <div className="flex items-center justify-center">
          <div className="text-gray-600 dark:text-slate-400 text-sm">Loading live market data...</div>
        </div>
      </div>
    );
  }

  if (marketData.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 py-2">
        <div className="flex items-center justify-center">
          <div className="text-red-600 dark:text-red-400 text-sm">Unable to fetch live market data</div>
        </div>
      </div>
    );
  }

  // Duplicate the data to create seamless scrolling
  const duplicatedData = [...marketData, ...marketData];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="relative">
        <div className="animate-scroll flex gap-8 py-2 px-4">
          {duplicatedData.map((item, index) => (
            <div key={`${item.symbol}-${index}`} className="flex items-center gap-2 whitespace-nowrap">
              <div className={`flex items-center gap-1 ${
                item.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {item.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
              </div>
              <span className="text-gray-900 dark:text-white font-semibold text-sm">{item.symbol}</span>
              <span className="text-gray-700 dark:text-slate-300 text-sm">{item.price.toFixed(2)}</span>
              <span className={`text-xs font-medium ${
                item.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
