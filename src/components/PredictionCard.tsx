
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

const ConfidenceDots = ({ confidence }: { confidence: number }) => {
  // Convert percentage to dots (0-100% -> 0-5 dots)
  const dots = Math.round((confidence / 100) * 5);
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`w-2 h-2 rounded-full ${
            dot <= dots ? 'bg-slate-400' : 'bg-slate-600'
          }`}
        />
      ))}
    </div>
  );
};

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
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Confidence</span>
            <ConfidenceDots confidence={confidence} />
          </div>
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
