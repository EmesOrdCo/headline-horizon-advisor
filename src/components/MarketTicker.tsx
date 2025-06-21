
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const MarketTicker = () => {
  const marketData = [
    { symbol: "SPX", value: 5967.84, change: -0.22, changePercent: -0.22 },
    { symbol: "IXIC", value: 19447.41, change: -0.51, changePercent: -0.51 },
    { symbol: "DJI", value: 42206.82, change: 0.08, changePercent: 0.08 },
    { symbol: "STOXX", value: 536.53, change: 0.13, changePercent: 0.13 },
    { symbol: "FTSE", value: 8774.65, change: -0.20, changePercent: -0.20 },
  ];

  return (
    <div className="bg-slate-800 border-b border-slate-700 py-2 overflow-hidden">
      <div className="flex animate-scroll">
        <div className="flex items-center gap-8 px-4 whitespace-nowrap">
          {marketData.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="text-slate-300 font-medium">{item.symbol}</span>
              <span className="text-white">{item.value.toLocaleString()}</span>
              <div className={`flex items-center gap-1 ${
                item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {item.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{item.changePercent > 0 ? '+' : ''}{item.changePercent}%</span>
              </div>
            </div>
          ))}
        </div>
        {/* Duplicate for smooth infinite scroll */}
        <div className="flex items-center gap-8 px-4 whitespace-nowrap">
          {marketData.map((item, index) => (
            <div key={`dup-${index}`} className="flex items-center gap-2 text-sm">
              <span className="text-slate-300 font-medium">{item.symbol}</span>
              <span className="text-white">{item.value.toLocaleString()}</span>
              <div className={`flex items-center gap-1 ${
                item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {item.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{item.changePercent > 0 ? '+' : ''}{item.changePercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
