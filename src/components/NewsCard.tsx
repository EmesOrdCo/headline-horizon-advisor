
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface NewsCardProps {
  symbol: string;
  priority?: string;
  title: string;
  description?: string;
  prediction?: string;
  confidence?: number;
  sentiment?: string;
  category?: string;
}

const NewsCard = ({ symbol, priority, title, description, prediction, confidence, sentiment, category }: NewsCardProps) => {
  const getPredictionIcon = () => {
    if (!prediction) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    
    if (prediction.startsWith('+')) {
      return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    } else if (prediction.startsWith('-')) {
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    } else {
      return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPredictionColor = () => {
    if (!prediction) return 'text-emerald-400';
    
    if (prediction.startsWith('+')) {
      return 'text-emerald-400';
    } else if (prediction.startsWith('-')) {
      return 'text-red-400';
    } else {
      return 'text-slate-400';
    }
  };

  const getSentimentColor = () => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
        return 'bg-emerald-500';
      case 'bearish':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-orange-500';
      case 'LOW':
        return 'bg-yellow-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge className="bg-blue-500 text-white">{symbol}</Badge>
        {priority && (
          <Badge className={`${getPriorityColor()} text-white`}>
            {priority}
          </Badge>
        )}
        {category && (
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            {category}
          </Badge>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 leading-tight">{title}</h3>
      
      {description && (
        <p className="text-slate-300 mb-4 leading-relaxed">{description}</p>
      )}
      
      {prediction && confidence !== undefined && (
        <>
          <div className="bg-slate-800/50 border border-emerald-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              {getPredictionIcon()}
              <span className="text-emerald-400 font-semibold">AI Prediction</span>
              <Badge className={`${getPredictionColor().includes('emerald') ? 'bg-emerald-500/20 text-emerald-400' : getPredictionColor().includes('red') ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'} text-xs`}>
                {prediction}
              </Badge>
            </div>
            
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
                <span className={`${sentiment === 'Bullish' ? 'text-emerald-400' : sentiment === 'Bearish' ? 'text-red-400' : 'text-slate-400'} font-semibold`}>
                  {sentiment}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Bearish</span>
                <span>Neutral</span>
                <span>Bullish</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 relative">
                <div 
                  className={`absolute h-2 rounded-full transition-all duration-500 ${
                    sentiment === 'Bullish' 
                      ? 'bg-emerald-500 right-0 w-1/3' 
                      : sentiment === 'Bearish' 
                      ? 'bg-red-500 left-0 w-1/3'
                      : 'bg-slate-500 left-1/3 w-1/3'
                  }`}
                ></div>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Badge className={`${getSentimentColor()} text-white text-xs`}>
              {sentiment?.toUpperCase()}
            </Badge>
          </div>
        </>
      )}
    </div>
  );
};

export default NewsCard;
