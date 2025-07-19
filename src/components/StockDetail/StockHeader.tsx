
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface StockHeaderProps {
  symbol: string;
  stockInfo: {
    name: string;
    price: number;
    change: number;
    changePercent: number;
  };
  cameFromWatchlist: boolean;
}

const StockHeader = ({ symbol, stockInfo, cameFromWatchlist }: StockHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <Link to={cameFromWatchlist ? "/watchlist" : "/dashboard"}>
          <Button variant="ghost" className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {cameFromWatchlist ? "Back to Watchlist" : "Back to Dashboard"}
          </Button>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">{symbol.slice(0, 2)}</span>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{symbol}</h1>
            <Badge className="bg-emerald-600 text-white">{stockInfo.name}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-white">${stockInfo.price.toFixed(2)}</span>
            <div className={`flex items-center gap-1 ${stockInfo.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stockInfo.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)} ({stockInfo.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockHeader;
