
import { TrendingUp } from "lucide-react";
import { ConfidenceDots } from "./ConfidenceDots";
import { useIsMobile } from "@/hooks/use-mobile";

interface AIAnalysisSectionProps {
  symbol: string;
  sentiment: string;
  confidence: number;
  isHistorical?: boolean;
  sourceLinksCount: number;
}

export const AIAnalysisSection = ({ 
  symbol, 
  sentiment, 
  confidence, 
  isHistorical, 
  sourceLinksCount 
}: AIAnalysisSectionProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-3 sm:p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-cyan-400" />
        <span className="text-cyan-400 font-semibold text-sm sm:text-base">AI Analysis</span>
      </div>
      <p className="text-slate-300 text-xs sm:text-sm mb-3">
        {isHistorical 
          ? `*Based on historical market analysis and trends for ${symbol}.`
          : sourceLinksCount > 0
          ? `Based on AI analysis of ${sourceLinksCount} news articles, ${symbol} shows ${sentiment.toLowerCase()} sentiment.`
          : `Based on AI analysis of this news and market patterns, ${symbol} shows ${sentiment.toLowerCase()} sentiment.`
        }
      </p>
      
      <div className={`${isMobile ? 'space-y-3' : 'mb-2'}`}>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Confidence Level</span>
            <ConfidenceDots confidence={confidence} />
          </div>
        </div>
      </div>
    </div>
  );
};
