import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { useArticleWeights } from "@/hooks/useArticleWeights";

interface NewsCardProps {
  symbol: string;
  title: string;
  description?: string;
  confidence?: number;
  sentiment?: string;
  category?: string;
  isHistorical?: boolean;
  sourceLinks?: string;
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

const NewsCard = ({ symbol, title, description, confidence, sentiment, category, isHistorical, sourceLinks, stockPrice }: NewsCardProps) => {
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

  // Helper function to generate AI analysis paragraph
  const generateAnalysisParagraph = (item: any) => {
    const sentimentText = item.ai_sentiment?.toLowerCase() || 'neutral';
    const confidence = item.ai_confidence || 50;
    
    // Generate contextual analysis based on sentiment and confidence
    if (sentimentText === 'bullish' && confidence > 70) {
      return `Strong positive indicators suggest ${item.symbol} may benefit from this development. Market sentiment appears favorable with high confidence in upward momentum.`;
    } else if (sentimentText === 'bearish' && confidence > 70) {
      return `This news presents concerning factors for ${item.symbol} performance. Analysis indicates potential downward pressure with significant market implications.`;
    } else if (sentimentText === 'bullish' && confidence <= 70) {
      return `Moderate positive signals for ${item.symbol}, though market uncertainty remains. Cautious optimism warranted given mixed indicators and evolving conditions.`;
    } else if (sentimentText === 'bearish' && confidence <= 70) {
      return `Some negative factors identified for ${item.symbol}, but impact unclear. Market conditions suggest careful monitoring of developments ahead.`;
    } else {
      return `Mixed signals for ${item.symbol} with neutral market impact expected. Analysis suggests balanced risk-reward profile in current environment.`;
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
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
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
            </div>
          </div>
        )}
      </div>
      
      {/* Non-clickable main title */}
      <h3 className="text-xl font-bold text-white mb-3 leading-tight">{title}</h3>
      
      {description && (
        <p className="text-slate-300 mb-4 leading-relaxed">{description}</p>
      )}
      
      {confidence && sentiment && (
        <>
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-semibold">AI Analysis</span>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              {isHistorical 
                ? `*Based on historical market analysis and trends for ${symbol}.`
                : parsedSourceLinks.length > 0
                ? `Based on AI analysis of ${parsedSourceLinks.length} news articles, ${symbol} shows ${sentiment.toLowerCase()} sentiment.`
                : `Based on AI analysis of this news and market patterns, ${symbol} shows ${sentiment.toLowerCase()} sentiment.`
              }
            </p>
            
            <div className="mb-2">
              <div className="flex justify-between items-center text-sm mb-2">
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
            <div className="flex items-center gap-2 mb-4">
              <Badge className={`${
                sentiment === 'Bullish' ? 'bg-emerald-500' :
                sentiment === 'Bearish' ? 'bg-red-500' :
                'bg-gray-500'
              } text-white text-xs`}>{sentiment?.toUpperCase()}</Badge>
              <span className="text-slate-400 text-sm">{category}</span>
            </div>
          )}

          {/* AI Analysis Paragraph for Magnificent 7 stocks */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 mb-4">
            <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
              <span className="text-cyan-400 font-medium">Detailed Analysis:</span> {generateAnalysisParagraph({ symbol, ai_sentiment: sentiment, ai_confidence: confidence })}
            </p>
          </div>
        </>
      )}

      {/* Source Articles Section - Make individual article titles clickable */}
      {parsedSourceLinks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Source Articles ({parsedSourceLinks.length})
            {!isHistorical && (
              <span className="text-xs text-slate-500 ml-2">
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
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 hover:bg-slate-800/70 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group mb-2"
                      >
                        <h5 className="text-white font-medium leading-tight group-hover:text-emerald-400 transition-colors duration-200 cursor-pointer underline decoration-transparent group-hover:decoration-emerald-400 underline-offset-2">
                          {link.title}
                        </h5>
                      </a>
                      <p className="text-xs text-slate-400 mb-2">
                        {formatPublishTime(link.published_at)}
                      </p>
                      {!isHistorical && weight && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Weight:</span>
                          <WeightDots weight={weight.weight} />
                          <span className="text-xs text-slate-500">({weight.reasoning})</span>
                        </div>
                      )}
                    </div>
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsCard;
