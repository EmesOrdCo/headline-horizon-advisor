
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockCardProps {
  stock: {
    id: string;
    symbol: string;
    created_at: string;
  };
  stockPrice?: StockPrice;
  onRemove: (stockId: string) => void;
}

const StockCard = ({ stock, stockPrice, onRemove }: StockCardProps) => {
  return (
    <div className="flex items-center gap-3 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2">
      <Badge variant="secondary" className="bg-slate-700 text-white">
        {stock.symbol}
      </Badge>
      
      {stockPrice && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white font-semibold">
            ${stockPrice.price.toFixed(2)}
          </span>
          <div className={`flex items-center gap-1 ${
            stockPrice.change >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {stockPrice.change >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="text-xs">
              {stockPrice.change >= 0 ? '+' : ''}{stockPrice.change.toFixed(2)} ({stockPrice.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}
      
      <button
        onClick={() => onRemove(stock.id)}
        className="ml-2 text-slate-400 hover:text-red-400 transition-colors"
      >
        ×
      </button>
    </div>
  );
};

export default StockCard;
