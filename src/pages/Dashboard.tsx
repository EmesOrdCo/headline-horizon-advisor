
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNews, useFetchNews } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { data: newsData, isLoading, refetch } = useNews();
  const { data: stockPrices, isLoading: isPricesLoading } = useStockPrices();
  const fetchNews = useFetchNews();
  const [isFetching, setIsFetching] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState<string>('');
  const { toast } = useToast();

  // Primary assets for main analysis
  const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
  const MAJOR_INDEX_FUNDS = ['SPY', 'QQQ', 'DIA']; // Match the ticker exactly

  const PRIMARY_ASSETS = [...MAGNIFICENT_7, ...MAJOR_INDEX_FUNDS];

  // Get stock price for a symbol
  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(stock => stock.symbol === symbol);
  };

  // Get main analysis articles (one per primary asset with AI analysis)
  const mainAnalysisArticles = PRIMARY_ASSETS.map(symbol => {
    return newsData?.find(item => 
      item.symbol === symbol && 
      item.ai_confidence && 
      item.ai_sentiment
    );
  }).filter(Boolean);

  // Get ALL recent headlines in chronological order (front-page news only)
  const allRecentHeadlines = newsData?.filter(item => {
    // Front-page news typically has higher confidence and recent publish dates
    const isRecent = new Date(item.published_at).getTime() > Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
    const isHighConfidence = item.ai_confidence && item.ai_confidence > 60;
    const hasGoodSentiment = item.ai_sentiment && item.ai_sentiment !== 'Neutral';
    
    return isRecent && (isHighConfidence || hasGoodSentiment);
  }).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()) || [];

  // Generate composite headline based on source articles
  const generateCompositeHeadline = (item: any) => {
    const symbol = item.symbol;
    const sentiment = item.ai_sentiment?.toLowerCase() || 'neutral';
    const confidence = item.ai_confidence || 50;
    
    // Parse source links to get article titles
    let sourceArticles = [];
    try {
      sourceArticles = item.source_links ? JSON.parse(item.source_links) : [];
    } catch (error) {
      console.error('Error parsing source links:', error);
    }

    // Analyze source article titles to create composite headline
    if (sourceArticles.length > 0) {
      const titles = sourceArticles.map((article: any) => article.title.toLowerCase());
      
      // Check for common themes in the source articles
      const hasEarnings = titles.some((title: string) => title.includes('earnings') || title.includes('revenue') || title.includes('profit'));
      const hasAI = titles.some((title: string) => title.includes('ai') || title.includes('artificial intelligence'));
      const hasCollaboration = titles.some((title: string) => title.includes('partnership') || title.includes('collaboration') || title.includes('deal'));
      const hasMarketNews = titles.some((title: string) => title.includes('market') || title.includes('stock') || title.includes('rally'));
      const hasRecord = titles.some((title: string) => title.includes('record') || title.includes('high') || title.includes('surge'));
      const hasConcerns = titles.some((title: string) => title.includes('concern') || title.includes('warning') || title.includes('risk'));
      
      // Generate headline based on detected themes and sentiment
      if (sentiment === 'bullish' && confidence > 80) {
        if (hasRecord) {
          return `${symbol} Reaches New Heights Amid Strong Market Performance`;
        } else if (hasAI && MAGNIFICENT_7.includes(symbol)) {
          return `${symbol} Leads AI Innovation Wave with Strategic Developments`;
        } else if (hasEarnings) {
          return `${symbol} Shows Strong Financial Performance in Latest Results`;
        } else if (hasCollaboration) {
          return `${symbol} Expands Market Position Through Strategic Partnerships`;
        } else if (hasMarketNews) {
          return `${symbol} Benefits from Positive Market Momentum and Investor Confidence`;
        } else {
          return `${symbol} Demonstrates Strong Market Leadership and Growth Potential`;
        }
      } else if (sentiment === 'bearish' && confidence > 70) {
        if (hasConcerns) {
          return `${symbol} Faces Market Headwinds Amid Growing Investor Concerns`;
        } else if (hasMarketNews) {
          return `${symbol} Under Pressure as Market Conditions Present Challenges`;
        } else {
          return `${symbol} Navigates Uncertain Market Environment with Caution`;
        }
      } else if (sentiment === 'bullish' && confidence <= 80) {
        return `${symbol} Shows Moderate Gains Amid Mixed Market Signals`;
      } else if (sentiment === 'bearish' && confidence <= 70) {
        return `${symbol} Experiences Volatility as Markets Remain Cautious`;
      } else {
        return `${symbol} Maintains Steady Position in Current Market Conditions`;
      }
    } else {
      // Fallback headlines when no source articles available
      if (sentiment === 'bullish') {
        return `${symbol} Shows Positive Market Outlook Based on Historical Analysis`;
      } else if (sentiment === 'bearish') {
        return `${symbol} Faces Market Challenges According to Recent Trends`;
      } else {
        return `${symbol} Maintains Neutral Position in Current Market Environment`;
      }
    }
  };

  const handleRefreshNews = async () => {
    setIsFetching(true);
    setFetchingStatus('Fetching news from all sources...');
    
    try {
      const result = await fetchNews();
      await refetch();
      
      if (result.success) {
        toast({
          title: "News Updated",
          description: result.message,
        });
      } else {
        toast({
          title: "Partial Success",
          description: "Some news sources may have failed. Check the results.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
      setFetchingStatus('');
    }
  };

  // Helper function to get asset type and styling
  const getAssetInfo = (symbol: string) => {
    if (MAGNIFICENT_7.includes(symbol)) {
      return { type: 'Stock', color: 'bg-blue-500' };
    } else if (MAJOR_INDEX_FUNDS.includes(symbol)) {
      return { type: 'Index', color: 'bg-purple-500' };
    }
    return { type: 'Other', color: 'bg-gray-500' };
  };

  // Helper function to generate AI analysis paragraph for ANY article
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

  // Generate general article summary for recent headlines
  const generateArticleSummary = (item: any) => {
    const title = item.title || '';
    const description = item.description || '';
    
    if (title.toLowerCase().includes('earnings') || title.toLowerCase().includes('revenue')) {
      return `This earnings-related news discusses financial performance and may impact related companies and their stock valuations in the coming trading sessions.`;
    } else if (title.toLowerCase().includes('merger') || title.toLowerCase().includes('acquisition')) {
      return `This merger and acquisition news could significantly affect the companies involved and potentially influence sector-wide trading patterns.`;
    } else if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('artificial intelligence')) {
      return `This AI-focused development may have broad implications for technology companies and could influence investor sentiment in the tech sector.`;
    } else if (title.toLowerCase().includes('market') || title.toLowerCase().includes('stocks')) {
      return `This market-focused article provides insights into current trading conditions and may influence overall investor sentiment and market direction.`;
    } else if (title.toLowerCase().includes('federal reserve') || title.toLowerCase().includes('interest rates')) {
      return `This monetary policy news could have wide-reaching effects on market liquidity, borrowing costs, and overall economic conditions.`;
    } else {
      return `This article covers significant business and financial developments that may influence market sentiment and investment decisions across various sectors.`;
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

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-36 p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Market News</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">LIVE</span>
                <span className="text-gray-600 dark:text-slate-400 text-sm">AI Analyzed</span>
              </div>
            </div>
            <Button 
              onClick={handleRefreshNews}
              disabled={isFetching}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Fetching...' : 'Refresh News'}
            </Button>
          </div>
          <p className="text-gray-600 dark:text-slate-400">Latest AI-analyzed news for major stocks and index funds</p>
          
          {isFetching && fetchingStatus && (
            <div className="text-amber-600 dark:text-yellow-400 text-sm mt-2 font-medium">
              {fetchingStatus}
            </div>
          )}
          
          {isPricesLoading && (
            <div className="text-amber-600 dark:text-yellow-400 text-sm mt-2 font-medium">
              Loading asset prices from Finnhub...
            </div>
          )}
          
          {!isPricesLoading && (!stockPrices || stockPrices.length === 0) && (
            <div className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">
              ⚠️ Asset prices unavailable - check Finnhub API connection
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="text-center text-gray-600 dark:text-slate-400 py-8">
                  Loading primary assets news...
                </div>
              ) : (
                // Always show boxes, one for each primary asset
                PRIMARY_ASSETS.map((symbol) => {
                  const article = mainAnalysisArticles.find(item => item.symbol === symbol);
                  const stockPrice = getStockPrice(symbol);
                  const assetInfo = getAssetInfo(symbol);
                  
                  console.log(`Stock price for ${symbol}:`, stockPrice); // Debug log

                  if (article) {
                    // Generate composite headline for this stock/fund
                    const compositeHeadline = generateCompositeHeadline(article);
                    
                    return (
                      <NewsCard 
                        key={article.id} 
                        symbol={article.symbol}
                        title={compositeHeadline}
                        description={article.description}
                        confidence={article.ai_confidence}
                        sentiment={article.ai_sentiment}
                        category={article.category}
                        isHistorical={article.ai_reasoning?.includes('Historical')}
                        sourceLinks={article.source_links || '[]'}
                        stockPrice={stockPrice}
                      />
                    );
                  } else {
                    // Show placeholder for assets without current analysis
                    return (
                      <div key={symbol} className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-6">
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Badge className={`${assetInfo.color} text-white`}>{symbol}</Badge>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
                              {assetInfo.type}
                            </Badge>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs">
                              NO RECENT NEWS
                            </Badge>
                          </div>
                          {stockPrice && (
                            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 dark:bg-slate-800 dark:border-slate-600 rounded-lg px-3 py-2">
                              <div className="text-right">
                                <div className="text-gray-900 dark:text-white font-semibold">${stockPrice.price.toFixed(2)}</div>
                                <div className={`text-xs flex items-center gap-1 ${
                                  stockPrice.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
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
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-slate-400 mb-2">
                          No recent analysis available for {symbol}
                        </h3>
                        <p className="text-gray-500 dark:text-slate-500 text-sm">
                          Click "Refresh News" to fetch the latest market updates and AI analysis.
                        </p>
                        {!stockPrice && (
                          <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                            Asset price unavailable - check Finnhub connection
                          </p>
                        )}
                      </div>
                    );
                  }
                })
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl p-6 h-[600px] flex flex-col sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Headlines</h3>
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {allRecentHeadlines && allRecentHeadlines.length > 0 ? (
                    allRecentHeadlines.slice(0, 30).map((item, index) => (
                      <div key={`headline-${item.id}-${index}`} className="bg-gray-50 border border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 rounded-lg p-4">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-900 dark:text-white text-sm font-medium mb-2 line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer block"
                        >
                          {item.title}
                        </a>
                        <div className="text-xs text-gray-600 dark:text-slate-400 mb-3">
                          {formatPublishTime(item.published_at)}
                        </div>
                        <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3">
                          <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
                            <span className="text-cyan-400 font-medium">Summary:</span> {generateArticleSummary(item)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-600 dark:text-slate-400 py-4">
                      <p>No headlines available.</p>
                      <p className="text-sm mt-2">Click "Refresh News" to load articles.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
