
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
          { symbol: 'SPY', name: 'S&P 500' },
          { symbol: 'QQQ', name: 'NASDAQ' },
          { symbol: 'DIA', name: 'Dow Jones' }
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
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-center">
          <div className="text-slate-400">Loading live market data...</div>
        </div>
      </div>
    );
  }

  if (marketData.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-center">
          <div className="text-red-400">Unable to fetch live market data. Please check your Finnhub API key and rate limits.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-emerald-400 text-sm font-medium">LIVE MARKETS</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto">
          {marketData.map((index) => (
            <div key={index.symbol} className="flex items-center gap-3 min-w-fit">
              <div>
                <div className="text-white font-semibold text-sm">{index.symbol}</div>
                <div className="text-slate-400 text-xs">${index.price.toFixed(2)}</div>
              </div>
              <div className={`flex items-center gap-1 ${
                index.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {index.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="text-xs font-medium">
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
