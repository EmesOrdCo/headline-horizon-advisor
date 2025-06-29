
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

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

// Props for BiggestMovers page
interface BiggestMoversStockCardProps {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  trendingIcon?: LucideIcon;
  trendingColor?: string;
  onRemove?: never;
  stock?: never;
  stockPrice?: never;
}

// Props for MyStocks page
interface MyStocksStockCardProps {
  stock: UserStock;
  stockPrice?: StockPrice;
  onRemove: (stockId: string) => void;
  symbol?: never;
  name?: never;
  price?: never;
  change?: never;
  changePercent?: never;
  trendingIcon?: never;
  trendingColor?: never;
}

type StockCardProps = BiggestMoversStockCardProps | MyStocksStockCardProps;

const StockCard = (props: StockCardProps) => {
  // Handle MyStocks case
  if ('stock' in props && props.stock) {
    const { stock, stockPrice, onRemove } = props;
    
    return (
      <div className="flex items-center justify-between bg-slate-700/50 border border-slate-600 rounded-lg p-3 min-w-[200px]">
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-600 text-white">{stock.symbol}</Badge>
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
  }

  // Handle BiggestMovers case
  const { symbol, name, price, change, changePercent, trendingIcon: TrendingIcon, trendingColor } = props;
  
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <Badge className="bg-blue-600 text-white">{symbol}</Badge>
        {TrendingIcon && (
          <TrendingIcon className={`w-5 h-5 ${trendingColor}`} />
        )}
      </div>
      
      {name && (
        <h3 className="text-white font-medium text-sm mb-2 truncate">{name}</h3>
      )}
      
      <div className="space-y-1">
        <div className="text-white text-lg font-semibold">
          ${price.toFixed(2)}
        </div>
        <div className={`text-sm flex items-center gap-1 ${
          change >= 0 ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {change >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
        </div>
      </div>
    </div>
  );
};

export default StockCard;
