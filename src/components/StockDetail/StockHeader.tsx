
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
      {/* Back Navigation */}
      <div className="mb-6">
        <Link to={cameFromWatchlist ? "/watchlist" : "/dashboard"}>
          <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {cameFromWatchlist ? "Back to Watchlist" : "Back to Dashboard"}
          </Button>
        </Link>
      </div>
      
      {/* Stock Info Header */}
      <div className="flex items-start gap-4">
        {/* Stock Icon */}
        <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">{symbol.slice(0, 2)}</span>
        </div>
        
        {/* Stock Details */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-white">{symbol}</h1>
            <Badge className="bg-emerald-600 text-white px-3 py-1">
              {stockInfo.name}
            </Badge>
          </div>
          
          {/* Price Information */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                ${stockInfo.price.toFixed(2)}
              </span>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
              stockInfo.change >= 0 
                ? 'bg-emerald-900/30 text-emerald-400' 
                : 'bg-red-900/30 text-red-400'
            }`}>
              {stockInfo.change >= 0 ? 
                <TrendingUp className="w-4 h-4" /> : 
                <TrendingDown className="w-4 h-4" />
              }
              <span className="font-semibold">
                {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)} 
                ({stockInfo.change >= 0 ? '+' : ''}{stockInfo.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockHeader;
