
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { useArticleWeights } from "@/hooks/useArticleWeights";
import { useIsMobile } from "@/hooks/use-mobile";

interface NewsCardProps {
  symbol: string;
  title: string;
  description?: string;
  confidence?: number;
  sentiment?: string;
  category?: string;
  isHistorical?: boolean;
  sourceLinks?: string;
  aiReasoning?: string;
  stockPrice?: {
    price: number;
    change: number;
    changePercent: number;
  };
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
            dot <= dots ? 'bg-cyan-500' : 'bg-slate-600'
          }`}
        />
      ))}
    </div>
  );
};

const WeightDots = ({ weight }: { weight: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`w-2 h-2 rounded-full ${
            dot <= weight ? 'bg-emerald-500' : 'bg-slate-600'
          }`}
        />
      ))}
    </div>
  );
};

const NewsCard = ({ symbol, title, description, confidence, sentiment, category, isHistorical, sourceLinks, aiReasoning, stockPrice }: NewsCardProps) => {
  const isMobile = useIsMobile();
  
  // Helper function to get asset type and styling
  const getAssetInfo = (symbol: string) => {
    const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
    const MAJOR_INDEX_FUNDS = ['SPY', 'QQQ', 'DIA'];
    
    if (MAGNIFICENT_7.includes(symbol)) {
      return { type: 'Stock', color: 'bg-blue-500' };
    } else if (MAJOR_INDEX_FUNDS.includes(symbol)) {
      return { type: 'Index', color: 'bg-purple-500' };
    }
    return { type: 'Other', color: 'bg-gray-500' };
  };

  // Parse source links
  let parsedSourceLinks: Array<{title: string, url: string, published_at: string}> = [];
  try {
    parsedSourceLinks = sourceLinks ? JSON.parse(sourceLinks) : [];
  } catch (error) {
    console.error('Error parsing source links:', error);
  }

  // Use the article weights hook
  const { data: articleWeights, isLoading: weightsLoading } = useArticleWeights({
    articles: parsedSourceLinks,
    overallSentiment: sentiment || 'Neutral',
    overallConfidence: confidence || 50,
    symbol,
    enabled: parsedSourceLinks.length > 0 && !isHistorical
  });

  // Helper function to get AI analysis text - use real reasoning if available
  const getAnalysisText = () => {
    // If we have real AI reasoning and it's not the generic fallback, use it
    if (aiReasoning && !aiReasoning.includes('Analysis based on') && aiReasoning.length > 50) {
      return aiReasoning;
    }
    
    // Otherwise use the original template logic as fallback
    const sentimentText = sentiment?.toLowerCase() || 'neutral';
    const confidenceValue = confidence || 50;
    
    if (sentimentText === 'bullish' && confidenceValue > 70) {
      return `Strong positive indicators suggest ${symbol} may benefit from this development. Market sentiment appears favorable with high confidence in upward momentum.`;
    } else if (sentimentText === 'bearish' && confidenceValue > 70) {
      return `This news presents concerning factors for ${symbol} performance. Analysis indicates potential downward pressure with significant market implications.`;
    } else if (sentimentText === 'bullish' && confidenceValue <= 70) {
      return `Moderate positive signals for ${symbol}, though market uncertainty remains. Cautious optimism warranted given mixed indicators and evolving conditions.`;
    } else if (sentimentText === 'bearish' && confidenceValue <= 70) {
      return `Some negative factors identified for ${symbol}, but impact unclear. Market conditions suggest careful monitoring of developments ahead.`;
    } else {
      return `Mixed signals for ${symbol} with neutral market impact expected. Analysis suggests balanced risk-reward profile in current environment.`;
    }
  };

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

  const assetInfo = getAssetInfo(symbol);

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-emerald-500/30 transition-all">
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
          {parsedSourceLinks.length > 0 && (
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 text-xs">
              {parsedSourceLinks.length} SOURCES
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
      
      {/* Non-clickable main title */}
      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 leading-tight">{title}</h3>
      
      {description && (
        <p className="text-slate-300 mb-4 leading-relaxed text-sm sm:text-base">{description}</p>
      )}
      
      {confidence && sentiment && (
        <>
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-semibold text-sm sm:text-base">AI Analysis</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mb-3">
              {isHistorical 
                ? `*Based on historical market analysis and trends for ${symbol}.`
                : parsedSourceLinks.length > 0
                ? `Based on AI analysis of ${parsedSourceLinks.length} news articles, ${symbol} shows ${sentiment.toLowerCase()} sentiment.`
                : `Based on AI analysis of this news and market patterns, ${symbol} shows ${sentiment.toLowerCase()} sentiment.`
              }
            </p>
            
            {/* Mobile: Stack weight and confidence vertically */}
            <div className={`${isMobile ? 'space-y-3' : 'mb-2'}`}>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Confidence Level</span>
                  <ConfidenceDots confidence={confidence} />
                </div>
              </div>
            </div>
          </div>
          
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

          {/* AI Analysis Paragraph */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 mb-4">
            <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
              <span className="text-cyan-400 font-medium">Detailed Analysis:</span> {getAnalysisText()}
            </p>
          </div>
        </>
      )}

      {/* Source Articles Section */}
      {parsedSourceLinks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2 flex-wrap">
            <ExternalLink className="w-4 h-4" />
            Source Articles ({parsedSourceLinks.length})
            {!isHistorical && (
              <span className="text-xs text-slate-500">
                {weightsLoading ? 'Calculating weights...' : 'Weighted by significance'}
              </span>
            )}
          </h4>
          <div className="space-y-3">
            {parsedSourceLinks.map((link, index) => {
              const weight = articleWeights?.find(w => w.article_index === index);
              
              return (
                <div
                  key={index}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4 hover:border-slate-600 hover:bg-slate-800/70 transition-all"
                >
                  <div className="flex flex-col gap-2">
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
                      {formatPublishTime(link.published_at)}
                    </p>
                    
                    {/* Weight - Show below date */}
                    {!isHistorical && weight && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Weight:</span>
                        <WeightDots weight={weight.weight} />
                        <span className="text-xs text-slate-500">({weight.reasoning})</span>
                      </div>
                    )}
                    
                    {/* External link button - positioned at the end */}
                    <div className="flex justify-end">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors flex-shrink-0 bg-slate-700/50 hover:bg-slate-600/50 px-2 py-1 rounded"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsCard;
