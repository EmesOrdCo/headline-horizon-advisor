
import { ExternalLink } from "lucide-react";
import { WeightDots } from "./WeightDots";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SourceArticlesProps {
  parsedSourceLinks: Array<{title: string, url: string, published_at: string}>;
  isHistorical?: boolean;
  articleWeights?: Array<{article_index: number, weight: number, reasoning: string}>;
  weightsLoading: boolean;
}

export const SourceArticles = ({ 
  parsedSourceLinks, 
  isHistorical, 
  articleWeights, 
  weightsLoading 
}: SourceArticlesProps) => {
  // Format publish time to show date and time to the minute
  const formatPublishTime = (publishedAt: string) => {
    const date = new Date(publishedAt);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (parsedSourceLinks.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-700 h-full">
      <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2 flex-wrap">
        <ExternalLink className="w-4 h-4" />
        Source Articles ({parsedSourceLinks.length})
        {!isHistorical && (
          <span className="text-xs text-slate-500">
            {weightsLoading ? 'Calculating weights...' : 'Weighted by significance'}
          </span>
        )}
      </h4>
      
      {/* Scrollable container that matches left side height */}
      <div className="h-[580px] w-full overflow-hidden">
        <div className="h-full overflow-y-auto pr-4 scrollbar-thin scrollbar-track-slate-700/30 scrollbar-thumb-white/30 hover:scrollbar-thumb-white/50">
          <div className="space-y-3">
            {parsedSourceLinks.map((link, index) => {
              const weight = articleWeights?.find(w => w.article_index === index);
              
              return (
                <div
                  key={index}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4 hover:border-slate-600 hover:bg-slate-800/70 transition-all"
                >
                  <div className="flex flex-col gap-3">
                    {/* Headlines */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <h5 className="text-white font-medium leading-tight group-hover:text-emerald-400 transition-colors duration-200 cursor-pointer underline decoration-transparent group-hover:decoration-emerald-400 underline-offset-2 text-sm sm:text-base">
                        {link.title}
                      </h5>
                    </a>
                    
                    {/* Date */}
                    <p className="text-xs text-slate-400">
                      Published: {formatPublishTime(link.published_at)}
                    </p>
                    
                    {/* Weight and Detailed Reasoning */}
                    {!isHistorical && weight && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Significance Weight:</span>
                          <WeightDots weight={weight.weight} />
                          <span className="text-xs text-emerald-400 font-medium">{weight.weight}/5</span>
                        </div>
                        <div className="bg-slate-700/30 border border-slate-600/30 rounded p-2">
                          <p className="text-xs text-slate-300 leading-relaxed">
                            <span className="text-emerald-400 font-medium">Analysis:</span> {weight.reasoning}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* External link button */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">
                        Click headline or button to read full article
                      </span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors flex-shrink-0 bg-slate-700/50 hover:bg-slate-600/50 px-3 py-1.5 rounded"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Read More</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
