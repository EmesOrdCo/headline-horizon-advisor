
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface NewsCardHeaderProps {
  symbol: string;
  assetInfo: { type: string; color: string };
  isHistorical?: boolean;
  sourceLinksCount: number;
  stockPrice?: {
    price: number;
    change: number;
    changePercent: number;
  };
}

export const NewsCardHeader = ({ 
  symbol, 
  assetInfo, 
  isHistorical, 
  sourceLinksCount, 
  stockPrice 
}: NewsCardHeaderProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={`${assetInfo.color} text-white`}>{symbol}</Badge>
        <Badge variant="secondary" className="bg-slate-500/20 text-slate-400 text-xs">
          {assetInfo.type}
        </Badge>
        {isHistorical && (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-xs">
            HISTORICAL*
          </Badge>
        )}
        {sourceLinksCount > 0 && (
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 text-xs">
            {sourceLinksCount} SOURCES
          </Badge>
        )}
      </div>
      
      {stockPrice && (
        <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2">
          <div className="text-right">
            <div className="text-white font-semibold text-sm sm:text-base">${stockPrice.price.toFixed(2)}</div>
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
          </div>
        </div>
      )}
    </div>
  );
};
