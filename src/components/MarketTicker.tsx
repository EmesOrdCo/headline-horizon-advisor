
import { useStockPrices } from "@/hooks/useStockPrices";

const MarketTicker = () => {
  return (
    <div className="bg-slate-800 border-b border-slate-700 py-2">
      <div className="flex items-center justify-center">
        <div className="text-slate-400 text-sm">Market data not available</div>
      </div>
    </div>
  );
};

export default MarketTicker;
