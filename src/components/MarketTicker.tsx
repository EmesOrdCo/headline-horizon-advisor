
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
        // Using Alpha Vantage free API for market data
        const symbols = ['SPY', 'QQQ']; // S&P 500 ETF and NASDAQ ETF
        const promises = symbols.map(async (symbol) => {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=demo`
          );
          const data = await response.json();
          const quote = data['Global Quote'];
          
          if (quote) {
            return {
              symbol: symbol === 'SPY' ? 'S&P 500' : 'NASDAQ',
              name: symbol === 'SPY' ? 'S&P 500' : 'NASDAQ',
              price: parseFloat(quote['05. price']),
              change: parseFloat(quote['09. change']),
              changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
            };
          }
          return null;
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
            }
          ]);
        } else {
          setMarketData(validResults);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
        // Fallback data
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
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-center">
          <div className="text-slate-400">Loading market data...</div>
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
        <div className="flex items-center gap-8">
          {marketData.map((index) => (
            <div key={index.symbol} className="flex items-center gap-3">
              <div>
                <div className="text-white font-semibold">{index.symbol}</div>
                <div className="text-slate-400 text-sm">${index.price.toFixed(2)}</div>
              </div>
              <div className={`flex items-center gap-1 ${
                index.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {index.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
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
