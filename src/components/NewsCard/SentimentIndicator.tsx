
import { Badge } from "@/components/ui/badge";

interface SentimentIndicatorProps {
  sentiment: string;
  category?: string;
}

export const SentimentIndicator = ({ sentiment, category }: SentimentIndicatorProps) => {
  return (
    <>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Market Sentiment</span>
          <span className={`font-semibold ${
            sentiment === 'Bullish' ? 'text-emerald-400' :
            sentiment === 'Bearish' ? 'text-red-400' :
            'text-gray-400'
          }`}>{sentiment}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Bearish</span>
          <span>Neutral</span>
          <span>Bullish</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 relative">
          <div 
            className={`absolute h-2 rounded-full w-1/3 ${
              sentiment === 'Bullish' ? 'right-0 bg-emerald-500' :
              sentiment === 'Bearish' ? 'left-0 bg-red-500' :
              'left-1/3 bg-gray-500'
            }`}
          ></div>
        </div>
      </div>
      
      {category && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge className={`${
            sentiment === 'Bullish' ? 'bg-emerald-500' :
            sentiment === 'Bearish' ? 'bg-red-500' :
            'bg-gray-500'
          } text-white text-xs`}>{sentiment?.toUpperCase()}</Badge>
          <span className="text-slate-400 text-sm">{category}</span>
        </div>
      )}
    </>
  );
};
