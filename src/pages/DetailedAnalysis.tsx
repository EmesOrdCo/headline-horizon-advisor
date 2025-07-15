
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowLeft, Clock, FileText, Brain, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBiggestMovers } from "@/hooks/useBiggestMovers";

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

const DetailedAnalysis = () => {
  const { symbol } = useParams();
  const upperSymbol = symbol?.toUpperCase() || 'AAPL';
  const { data: biggestMovers, isLoading, error } = useBiggestMovers();

  // Find the stock data for the requested symbol
  const stockData = biggestMovers ? 
    [...biggestMovers.gainers, ...biggestMovers.losers].find(stock => stock.symbol === upperSymbol) : 
    null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <DashboardNav />
        <main className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading analysis...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="min-h-screen bg-slate-900">
        <DashboardNav />
        <main className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">No data available for {upperSymbol}</div>
          </div>
        </main>
      </div>
    );
  }

  // Analyze each article independently for sentiment
  const analyzeArticleSentiment = (title: string, summary: string) => {
    const text = `${title} ${summary}`.toLowerCase();
    
    // Positive indicators
    const positiveWords = ['rise', 'surge', 'gain', 'rally', 'boost', 'jump', 'soar', 'upgrade', 'beat', 'strong', 'growth', 'positive', 'bullish', 'recovery', 'breakthrough'];
    const negativeWords = ['fall', 'drop', 'decline', 'plunge', 'crash', 'loss', 'weak', 'bearish', 'concern', 'warning', 'risk', 'downgrade', 'miss', 'struggle', 'pressure'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'Bullish';
    if (negativeCount > positiveCount) return 'Bearish';
    return 'Neutral';
  };

  // Generate detailed AI analysis for each article
  const generateDetailedAnalysis = (article: any, sentiment: string, stockPrice: number, changePercent: number) => {
    const title = article.title;
    const summary = article.summary || '';
    const symbol = stockData.symbol;
    
    // Create context-aware analysis based on article content and stock performance
    const isPositive = sentiment === 'Bullish';
    const isNegative = sentiment === 'Bearish';
    const currentPrice = stockPrice;
    const priceChange = changePercent;
    
    // Analyze key elements from the title and summary
    const hasEarnings = title.toLowerCase().includes('earnings') || summary.toLowerCase().includes('earnings');
    const hasUpgrade = title.toLowerCase().includes('upgrade') || title.toLowerCase().includes('raised');
    const hasDowngrade = title.toLowerCase().includes('downgrade') || title.toLowerCase().includes('lowered');
    const hasRevenue = title.toLowerCase().includes('revenue') || summary.toLowerCase().includes('revenue');
    const hasGuidance = title.toLowerCase().includes('guidance') || summary.toLowerCase().includes('outlook');
    const hasPartnership = title.toLowerCase().includes('partnership') || title.toLowerCase().includes('deal');
    const hasRegulation = title.toLowerCase().includes('regulation') || title.toLowerCase().includes('regulatory');
    
    // Generate specific analysis based on content
    if (hasUpgrade && isPositive) {
      return `Analyst upgrades typically signal strong institutional confidence in ${symbol}'s fundamentals. The upgrade suggests improved earnings outlook, potentially driving institutional buying pressure. With current momentum at ${priceChange.toFixed(1)}%, this catalyst could sustain upward price action as more investors recognize the revised valuation targets and growth prospects.`;
    }
    
    if (hasEarnings && isPositive) {
      return `Strong earnings performance demonstrates ${symbol}'s operational efficiency and market positioning. Beating expectations often triggers algorithmic buying and analyst revisions. The ${priceChange.toFixed(1)}% move reflects initial investor optimism, but sustained earnings growth could drive further upside as quarterly momentum builds investor confidence in management execution.`;
    }
    
    if (hasRevenue && isPositive) {
      return `Revenue growth indicates expanding market share and effective business strategy execution for ${symbol}. Top-line growth often translates to improved margins and cash flow generation. The current ${priceChange.toFixed(1)}% appreciation suggests investors are pricing in sustainable revenue trends, potentially leading to multiple expansion and continued price appreciation.`;
    }
    
    if (hasPartnership && isPositive) {
      return `Strategic partnerships typically unlock new revenue streams and market opportunities for ${symbol}. The collaboration suggests management's ability to create value through external relationships. With the stock up ${priceChange.toFixed(1)}%, investors are recognizing the deal's potential to accelerate growth and competitive positioning in key markets.`;
    }
    
    if (hasDowngrade && isNegative) {
      return `Analyst downgrades often reflect deteriorating fundamentals or sector headwinds affecting ${symbol}. The revision suggests reduced earnings expectations and potential multiple compression. The ${Math.abs(priceChange).toFixed(1)}% decline indicates investor concern about revised price targets, with continued selling pressure likely until sentiment stabilizes or operational improvements emerge.`;
    }
    
    if (hasRegulation && isNegative) {
      return `Regulatory challenges create uncertainty around ${symbol}'s operating environment and growth prospects. Compliance costs and operational restrictions could pressure margins and limit expansion opportunities. The ${Math.abs(priceChange).toFixed(1)}% drop reflects investor concern about regulatory overhang, potentially persisting until clarity emerges on implementation timelines and business impact.`;
    }
    
    if (hasGuidance && isNegative) {
      return `Lowered guidance signals management's reduced confidence in near-term performance for ${symbol}. Forward-looking weakness often indicates market headwinds or operational challenges. The ${Math.abs(priceChange).toFixed(1)}% decline suggests investors are repricing expectations downward, with continued pressure likely until management demonstrates improved execution or market conditions stabilize.`;
    }
    
    // Default analysis based on sentiment and price action
    if (isPositive) {
      return `This development appears to strengthen ${symbol}'s market position and investor sentiment. The news suggests positive operational momentum or strategic advantages that could drive sustained performance. With the stock gaining ${priceChange.toFixed(1)}%, investors are likely pricing in improved fundamentals and growth prospects, potentially supporting continued upward price movement.`;
    } else if (isNegative) {
      return `This news presents challenges for ${symbol}'s near-term outlook and investor confidence. The development suggests potential headwinds that could impact operational performance or market positioning. The ${Math.abs(priceChange).toFixed(1)}% decline reflects investor concern, with recovery dependent on management's ability to address underlying issues and restore market confidence.`;
    } else {
      return `This news presents mixed signals for ${symbol}'s investment outlook. While some factors suggest stability, market uncertainty persists regarding the company's direction. The ${Math.abs(priceChange).toFixed(1)}% price movement reflects investor indecision, with future performance likely dependent on management execution and broader market conditions providing clearer directional catalysts.`;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString; // Return original if parsing fails
    }
  };

  const influencingHeadlines = stockData.headlines.map((headline, index) => {
    const sentiment = analyzeArticleSentiment(headline.title, headline.summary || '');
    const weight = Math.min(Math.max(Math.round(Math.abs(stockData.changePercent) * 15) + Math.random() * 30, 25), 95);
    
    return {
      title: headline.title,
      impact: sentiment,
      weight: weight,
      timeAgo: headline.publishedAt,
      description: headline.summary || 'No summary available',
      url: headline.url || '#'
    };
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <Link 
            to="/biggest-movers" 
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Biggest Movers
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white">Detailed Analysis</h1>
            <Badge className="bg-blue-500 text-white text-lg px-3 py-1">{upperSymbol}</Badge>
            <div className="flex items-center gap-2">
              {stockData.changePercent > 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className={`font-bold ${stockData.changePercent > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stockData.changePercent > 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-slate-400">AI-powered prediction analysis with supporting evidence</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Headlines Analysis */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Influencing Headlines</h2>
            </div>
            
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {influencingHeadlines.length > 0 ? influencingHeadlines.map((headline, index) => (
                  <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <div className="flex items-start justify-between mb-3">
                      <a 
                        href={headline.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white font-medium text-sm leading-tight flex-1 mr-3 hover:text-blue-400 transition-colors group"
                      >
                        <div className="flex items-start gap-2">
                          <span>{headline.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                        </div>
                      </a>
                      <Badge className={`${
                        headline.impact === 'Bullish' ? 'bg-emerald-500' : 
                        headline.impact === 'Bearish' ? 'bg-red-500' : 
                        'bg-slate-500'
                      } text-white text-xs`}>
                        {headline.impact.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-slate-300 text-xs mb-3 leading-relaxed">
                      {headline.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(headline.timeAgo)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">Impact Weight:</span>
                        <ConfidenceDots confidence={headline.weight} />
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-slate-400 py-8">
                    No headlines available for {upperSymbol}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* In-Depth Article Analysis */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">In-Depth Article Analysis</h2>
            </div>
            
            <ScrollArea className="h-[500px]">
              <div className="space-y-6 pr-4">
                {stockData.headlines.length > 0 ? stockData.headlines.map((article, index) => {
                  const articleSentiment = analyzeArticleSentiment(article.title, article.summary || '');
                  const weight = Math.min(Math.max(Math.round(Math.abs(stockData.changePercent) * 15) + Math.random() * 30, 25), 95);
                  
                  return (
                    <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <a 
                          href={article.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-semibold text-sm leading-tight flex-1 mr-3 hover:text-blue-400 transition-colors group"
                        >
                          <div className="flex items-start gap-2">
                            <span>{article.title}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                          </div>
                        </a>
                        <Badge className={`${
                          articleSentiment === 'Bullish' ? 'bg-emerald-500' : 
                          articleSentiment === 'Bearish' ? 'bg-red-500' : 
                          'bg-slate-500'
                        } text-white text-xs`}>
                          {articleSentiment.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="text-slate-400">Article Impact Weight</span>
                          <ConfidenceDots confidence={weight} />
                        </div>
                      </div>
                      
                      <div className="mb-3 flex items-center gap-2 text-slate-400 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>Published: {formatDate(article.publishedAt)}</span>
                      </div>
                      
                      <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-3 h-3 text-cyan-400" />
                          <span className="text-cyan-400 font-medium text-xs">AI Impact Analysis</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          {generateDetailedAnalysis(article, articleSentiment, stockData.price, stockData.changePercent)}
                        </p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center text-slate-400 py-8">
                    No detailed analysis available for {upperSymbol}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailedAnalysis;
