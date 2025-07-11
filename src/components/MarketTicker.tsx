import { useState, useEffect, useRef } from "react";
import { Triangle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from "@/hooks/use-mobile";

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
  const tickerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Major market indices and prominent stocks
        const indices = [
          { symbol: 'SPY', name: 'S&P 500' },
          { symbol: 'QQQ', name: 'NASDAQ' },
          { symbol: 'DIA', name: 'Dow Jones' },
          { symbol: 'AAPL', name: 'AAPL' },
          { symbol: 'MSFT', name: 'MSFT' },
          { symbol: 'GOOGL', name: 'GOOGL' },
          { symbol: 'AMZN', name: 'AMZN' },
          { symbol: 'NVDA', name: 'NVDA' },
          { symbol: 'TSLA', name: 'TSLA' },
          { symbol: 'META', name: 'META' },
          { symbol: 'BRK.B', name: 'BRK.B' },
          { symbol: 'JPM', name: 'JPM' },
          { symbol: 'V', name: 'VISA' },
          { symbol: 'JNJ', name: 'J&J' },
          { symbol: 'WMT', name: 'WMT' }
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
          setMarketData(prevData => {
            // Only update if data has actually changed to prevent unnecessary re-renders
            const hasChanged = JSON.stringify(prevData) !== JSON.stringify(results);
            return hasChanged ? results : prevData;
          });
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

    fetchMarketData();
    // Refetch every 3 minutes to reduce jarring updates
    const interval = setInterval(fetchMarketData, 180000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed top-[58px] left-0 right-0 z-40 bg-slate-800 border-none">
        <div className="w-[95%] mx-auto py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-400 text-sm font-medium">LIVE MARKETS</span>
            </div>
            <div className="text-slate-300 text-sm font-medium">Loading live market data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (marketData.length === 0) {
    return (
      <div className="fixed top-[58px] left-0 right-0 z-40 bg-slate-800 border-none">
        <div className="w-[95%] mx-auto py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-400 text-sm font-medium">LIVE MARKETS</span>
            </div>
            <div className="text-slate-300 text-sm font-medium">Unable to fetch live market data</div>
          </div>
        </div>
      </div>
    );
  }

  // Create seamless scrolling by triplicating the data for smooth transitions
  const scrollingData = marketData.length > 0 ? [...marketData, ...marketData, ...marketData] : [];

  return (
    <div className="fixed top-[58px] left-0 right-0 z-40 bg-slate-800 border-none overflow-hidden">
      <div className="w-[95%] mx-auto py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-sm font-medium">LIVE MARKETS</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div 
              ref={tickerRef}
              className={`flex ${isMobile ? 'gap-4' : 'gap-8'}`}
              style={{
                animation: `scroll ${isMobile ? '25s' : '60s'} linear infinite`,
                width: '300%',
                willChange: 'transform',
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden'
              }}
            >
              {scrollingData.map((item, index) => (
                <div key={`${item.symbol}-${index}`} className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'} whitespace-nowrap flex-shrink-0`}>
                  <span className={`text-white font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>{item.symbol}</span>
                  <span className={`text-slate-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>${item.price.toFixed(2)}</span>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1 transition-colors duration-300 ${
                    item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    <Triangle 
                      className={`w-3 h-3 transition-colors duration-300 ${
                        item.change >= 0 
                          ? 'text-emerald-400 fill-emerald-400' 
                          : 'text-red-400 fill-red-400 rotate-180'
                      }`} 
                    />
                    {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
