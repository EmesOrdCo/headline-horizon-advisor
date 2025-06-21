
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";

interface PredictionCardProps {
  symbol: string;
  current: number;
  predicted: number;
  change: number;
  confidence: number;
  timeframe: string;
}

const PredictionCard = ({ symbol, current, predicted, change, confidence, timeframe }: PredictionCardProps) => {
  const isPositive = change > 0;
  
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-500 text-white text-sm">{symbol}</Badge>
          <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
            {timeframe}
          </Badge>
        </div>
        <Badge className={`${isPositive ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
          {isPositive ? (
            <><TrendingUp className="w-3 h-3 mr-1" /> {change.toFixed(2)}%</>
          ) : (
            <><TrendingDown className="w-3 h-3 mr-1" /> {change.toFixed(2)}%</>
          )}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div>
          <div className="text-sm text-slate-400 mb-1">Current</div>
          <div className="text-2xl font-bold text-white">${current}</div>
        </div>
        <div>
          <div className="text-sm text-slate-400 mb-1">Predicted</div>
          <div className={`text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            ${predicted}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Confidence</span>
          <span className="text-slate-300 font-semibold">{confidence}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-slate-400 h-2 rounded-full transition-all duration-500" 
            style={{width: `${confidence}%`}}
          ></div>
        </div>
      </div>
      
      <Link to={`/prediction/${symbol.toLowerCase()}`}>
        <Button 
          variant="outline" 
          className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
        >
          View Detailed Analysis →
        </Button>
      </Link>
    </div>
  );
};

export default PredictionCard;
