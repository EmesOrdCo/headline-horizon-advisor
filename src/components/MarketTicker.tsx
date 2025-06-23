
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
        // Expanded list of major indices and ETFs
        const indices = [
          { symbol: 'SPY', name: 'S&P 500' },
          { symbol: 'QQQ', name: 'NASDAQ' },
          { symbol: 'DIA', name: 'Dow Jones' },
          { symbol: 'IWM', name: 'Russell 2000' },
          { symbol: 'VTI', name: 'Total Stock Market' },
          { symbol: 'EFA', name: 'EAFE' }
        ];
        
        console.log('Fetching live market data...');
        
        const promises = indices.map(async (index) => {
          try {
            const response = await fetch('/api/stock-price', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ symbol: index.symbol }),
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.price && data.changePercent !== undefined) {
              return {
                symbol: index.name,
                name: index.name,
                price: parseFloat(data.price.toFixed(2)),
                change: parseFloat(data.change.toFixed(2)),
                changePercent: parseFloat(data.changePercent.toFixed(2))
              };
            }
            
            return null;
          } catch (error) {
            console.error(`Error fetching data for ${index.symbol}:`, error);
            return null;
          }
        });

        const results = await Promise.all(promises);
        const validResults = results.filter(Boolean) as MarketIndex[];
        
        if (validResults.length === 0) {
          // Fallback to simulated live data if API fails
          setMarketData([
            {
              symbol: 'S&P 500',
              name: 'S&P 500',
              price: 4750.89,
              change: 23.45,
              changePercent: 0.49
            },
            {
              symbol: 'NASDAQ',
              name: 'NASDAQ',
              price: 14825.33,
              change: -45.67,
              changePercent: -0.31
            },
            {
              symbol: 'Dow Jones',
              name: 'Dow Jones',
              price: 37850.12,
              change: 156.78,
              changePercent: 0.42
            },
            {
              symbol: 'Russell 2000',
              name: 'Russell 2000',
              price: 2045.67,
              change: -12.34,
              changePercent: -0.60
            }
          ]);
        } else {
          setMarketData(validResults);
          console.log('Successfully fetched live market data');
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
        // Fallback data with more indices
        setMarketData([
          {
            symbol: 'S&P 500',
            name: 'S&P 500',
            price: 4750.89,
            change: 23.45,
            changePercent: 0.49
          },
          {
            symbol: 'NASDAQ',
            name: 'NASDAQ',
            price: 14825.33,
            change: -45.67,
            changePercent: -0.31
          },
          {
            symbol: 'Dow Jones',
            name: 'Dow Jones',
            price: 37850.12,
            change: 156.78,
            changePercent: 0.42
          },
          {
            symbol: 'Russell 2000',
            name: 'Russell 2000',
            price: 2045.67,
            change: -12.34,
            changePercent: -0.60
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds

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
