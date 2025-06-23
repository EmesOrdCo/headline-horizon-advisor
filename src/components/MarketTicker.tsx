import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

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
        // Major market indices and ETFs - using symbols that work with Finnhub free tier
        const indices = [
          { symbol: 'SPY', name: 'S&P 500' },
          { symbol: 'QQQ', name: 'NASDAQ' },
          { symbol: 'DIA', name: 'Dow Jones' },
          { symbol: 'IWM', name: 'Russell 2000' },
          { symbol: 'VTI', name: 'Total Market' },
          { symbol: 'EFA', name: 'EAFE' }
        ];
        
        console.log('Fetching live market data from Finnhub...');
        
        const results: MarketIndex[] = [];
        
        // Fetch sequentially to respect Finnhub free tier rate limits
        for (const index of indices) {
          try {
            const response = await fetch('/api/stock-price', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ symbol: index.symbol }),
            });
            
            if (!response.ok) {
              console.error(`HTTP error for ${index.symbol}! status: ${response.status}`);
              continue;
            }
            
            const data = await response.json();
            
            if (data.error) {
              console.error(`API error for ${index.symbol}:`, data.error);
              continue;
            }
            
            if (data.price && data.price > 0) {
              results.push({
                symbol: index.name,
                name: index.name,
                price: parseFloat(data.price.toFixed(2)),
                change: parseFloat(data.change.toFixed(2)),
                changePercent: parseFloat(data.changePercent.toFixed(2))
              });
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
          // Keep existing data if available, otherwise show error
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
    // Refetch every 2 minutes to respect rate limits
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
          <div className="text-red-400">Unable to fetch live market data. Please check your Finnhub API key.</div>
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
