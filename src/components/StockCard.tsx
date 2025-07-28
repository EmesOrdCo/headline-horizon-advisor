
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CompanyLogo from "@/components/CompanyLogo";
import { X, TrendingUp, TrendingDown } from "lucide-react";

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface UserStock {
  id: string;
  symbol: string;
  created_at: string;
}

interface StockCardProps {
  stock: UserStock;
  stockPrice?: StockPrice;
  onRemove: (stockId: string) => void;
}

const StockCard = ({ stock, stockPrice, onRemove }: StockCardProps) => {
  console.log(`StockCard for ${stock.symbol}:`, { stock, stockPrice });
  
  return (
    <div className="flex items-center justify-between bg-slate-700/50 border border-slate-600 rounded-lg p-3 min-w-[200px]">
      <div className="flex items-center gap-3">
        <CompanyLogo 
          symbol={stock.symbol} 
          size="sm" 
        />
        <div>
          <Badge className="bg-emerald-600 text-white text-xs mb-1">{stock.symbol}</Badge>
          <div className="text-right">
            {stockPrice ? (
              <>
                <div className="text-white font-semibold">${stockPrice.price.toFixed(2)}</div>
                <div className={`text-xs flex items-center gap-1 ${
                  stockPrice.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {stockPrice.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stockPrice.change >= 0 ? '+' : ''}{stockPrice.change.toFixed(2)} ({stockPrice.changePercent.toFixed(2)}%)
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-sm">
                {stock.symbol.includes('.') ? 'Non-US Stock' : 'Price Loading...'}
              </div>
            )}
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(stock.id)}
        className="text-slate-400 hover:text-red-400 hover:bg-red-900/20"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default StockCard;
