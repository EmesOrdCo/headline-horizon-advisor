
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface NewsCardProps {
  symbol: string;
  priority?: string;
  title: string;
  description?: string;
  prediction?: string;
  confidence?: number;
  sentiment?: string;
  category?: string;
  isHistorical?: boolean;
}

const NewsCard = ({ symbol, priority, title, description, prediction, confidence, sentiment, category, isHistorical }: NewsCardProps) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge className="bg-blue-500 text-white">{symbol}</Badge>
        {priority && (
          <Badge className={`${
            priority === 'HIGH' ? 'bg-red-500' : 
            priority === 'MEDIUM' ? 'bg-orange-500' : 
            'bg-gray-500'
          } text-white`}>
            {priority}
          </Badge>
        )}
        {isHistorical && (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-xs">
            HISTORICAL*
          </Badge>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 leading-tight">{title}</h3>
      
      {description && (
        <p className="text-slate-300 mb-4 leading-relaxed">{description}</p>
      )}
      
      {prediction && confidence && (
        <>
          <div className="bg-slate-800/50 border border-emerald-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">AI Prediction</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                {prediction}
              </Badge>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              {isHistorical 
                ? `*Based on historical market analysis and trends for ${symbol}.`
                : `Based on AI analysis of this news and market patterns, ${symbol} shows potential for movement.`
              }
            </p>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Confidence Level</span>
                <span className="text-emerald-400 font-semibold">{confidence}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                  style={{width: `${confidence}%`}}
                ></div>
              </div>
            </div>
          </div>
          
          {sentiment && (
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
          )}
          
          {category && (
            <div className="flex items-center gap-2">
              <Badge className={`${
                sentiment === 'Bullish' ? 'bg-emerald-500' :
                sentiment === 'Bearish' ? 'bg-red-500' :
                'bg-gray-500'
              } text-white text-xs`}>{sentiment?.toUpperCase()}</Badge>
              <span className="text-slate-400 text-sm">{category}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsCard;
