
import { Badge } from "@/components/ui/badge";
import { useArticleWeights } from "@/hooks/useArticleWeights";
import { NewsCardHeader } from "./NewsCardHeader";
import { AIAnalysisSection } from "./AIAnalysisSection";
import { SentimentIndicator } from "./SentimentIndicator";
import { DetailedAnalysis } from "./DetailedAnalysis";
import { SourceArticles } from "./SourceArticles";

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

  const assetInfo = getAssetInfo(symbol);

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-emerald-500/30 transition-all">
      <NewsCardHeader 
        symbol={symbol}
        assetInfo={assetInfo}
        isHistorical={isHistorical}
        sourceLinksCount={parsedSourceLinks.length}
        stockPrice={stockPrice}
      />
      
      {/* Non-clickable main title */}
      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 leading-tight">{title}</h3>
      
      {description && (
        <p className="text-slate-300 mb-4 leading-relaxed text-sm sm:text-base">{description}</p>
      )}
      
      {confidence && sentiment && (
        <>
          <AIAnalysisSection 
            symbol={symbol}
            sentiment={sentiment}
            confidence={confidence}
            isHistorical={isHistorical}
            sourceLinksCount={parsedSourceLinks.length}
          />
          
          <SentimentIndicator sentiment={sentiment} category={category} />

          <DetailedAnalysis 
            symbol={symbol}
            sentiment={sentiment}
            confidence={confidence}
          />
        </>
      )}

      <SourceArticles 
        parsedSourceLinks={parsedSourceLinks}
        isHistorical={isHistorical}
        articleWeights={articleWeights}
        weightsLoading={weightsLoading}
      />
    </div>
  );
};

export default NewsCard;
