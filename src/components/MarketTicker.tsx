
import { useStockPrices } from "@/hooks/useStockPrices";
import { TrendingUp, TrendingDown } from "lucide-react";

const MarketTicker = () => {
  const { data: stockPrices, isLoading } = useStockPrices();

  if (isLoading) {
    return (
      <div className="bg-slate-800 border-b border-slate-700 py-2">
        <div className="flex items-center justify-center">
          <div className="text-slate-400 text-sm">Loading market data...</div>
        </div>
      </div>
    );
  }

  if (!stockPrices || stockPrices.length === 0) {
    return (
      <div className="bg-slate-800 border-b border-slate-700 py-2">
        <div className="flex items-center justify-center">
          <div className="text-slate-400 text-sm">Market data not available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border-b border-slate-700 py-2 overflow-hidden">
      <div className="flex animate-scroll">
        {stockPrices.map((stock, index) => (
          <div key={index} className="flex items-center gap-2 px-6 text-sm whitespace-nowrap">
            <span className="text-white font-medium">{stock.symbol}</span>
            <span className="text-slate-300">${stock.price?.toFixed(2) || 'N/A'}</span>
            <div className={`flex items-center gap-1 ${
              (stock.change || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {(stock.change || 0) >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {stock.change !== undefined ? (
                  `${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} (${stock.changePercent?.toFixed(2) || '0.00'}%)`
                ) : (
                  'N/A'
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
