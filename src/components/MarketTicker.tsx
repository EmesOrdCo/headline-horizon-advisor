
import { Triangle } from "lucide-react";
import { useMarketData } from "@/contexts/MarketDataContext";

const MarketTicker = () => {
  const { marketData, isLoading } = useMarketData();

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

  // Duplicate the data to create seamless scrolling
  const duplicatedData = [...marketData, ...marketData];

  return (
    <div className="fixed top-[58px] left-0 right-0 z-40 bg-slate-800 border-none overflow-hidden">
      <div className="w-[95%] mx-auto py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-sm font-medium">LIVE MARKETS</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-scroll flex gap-8">
              {duplicatedData.map((item, index) => (
                <div key={`${item.symbol}-${index}`} className="flex items-center gap-4 whitespace-nowrap">
                  <span className="text-white font-semibold text-sm">{item.symbol}</span>
                  <span className="text-slate-300 text-sm">${item.price.toFixed(2)}</span>
                  <span className={`text-sm flex items-center gap-1 ${
                    item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    <Triangle 
                      className={`w-3 h-3 ${
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
