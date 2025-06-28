
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

  // Filter for front-page news only (major news sources and important stories)
  const frontPageHeadlines = newsData?.filter(item => {
    const title = item.title?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    
    // Filter for major financial news indicators
    const isFrontPageNews = 
      // Market-wide news
      title.includes('s&p 500') || title.includes('nasdaq') || title.includes('dow') ||
      title.includes('market') && (title.includes('record') || title.includes('high') || title.includes('rally') || title.includes('surge')) ||
      // Major economic indicators
      title.includes('federal reserve') || title.includes('fed') || title.includes('interest rate') ||
      title.includes('inflation') || title.includes('gdp') || title.includes('unemployment') ||
      // Major corporate news
      title.includes('earnings') && (title.includes('beat') || title.includes('miss') || title.includes('guidance')) ||
      title.includes('merger') || title.includes('acquisition') || title.includes('ipo') ||
      // Geopolitical and regulatory
      title.includes('trump') || title.includes('biden') || title.includes('congress') ||
      title.includes('sec') || title.includes('regulation') || title.includes('tariff') ||
      // Major tech developments
      title.includes('ai') && (title.includes('breakthrough') || title.includes('partnership') || title.includes('deal')) ||
      // Crisis or major events
      title.includes('crisis') || title.includes('crash') || title.includes('surge') ||
      title.includes('billion') || title.includes('trillion') ||
      // Major company-specific news that affects markets
      description.includes('stock price') || description.includes('shares jump') || description.includes('shares fall');
    
    return isFrontPageNews;
  })?.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()) || [];

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

  // Generate composite headline based on AI analysis
  const generateCompositeHeadline = (symbol: string, sentiment: string, confidence: number) => {
    const assetInfo = getAssetInfo(symbol);
    const confidenceLevel = confidence > 80 ? 'Strong' : confidence > 60 ? 'Moderate' : 'Cautious';
    
    if (sentiment === 'Bullish') {
      return `${symbol} Shows ${confidenceLevel} Bullish Momentum Amid Market Analysis`;
    } else if (sentiment === 'Bearish') {
      return `${symbol} Faces ${confidenceLevel} Bearish Pressure According to Latest Analysis`;
    } else {
      return `${symbol} Maintains Neutral Outlook with ${confidenceLevel} Market Position`;
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
                    // Generate composite headline for articles with analysis
                    const compositeHeadline = generateCompositeHeadline(
                      article.symbol, 
                      article.ai_sentiment, 
                      article.ai_confidence
                    );

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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Front Page Headlines</h3>
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {frontPageHeadlines && frontPageHeadlines.length > 0 ? (
                    frontPageHeadlines.slice(0, 20).map((item, index) => (
                      <div key={`headline-${item.id}-${index}`} className="bg-gray-50 border border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 rounded-lg p-4">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-900 dark:text-white text-sm font-medium mb-2 line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer block"
                        >
                          {item.title}
                        </a>
                        <div className="text-xs text-gray-600 dark:text-slate-400 mb-1">
                          {formatPublishTime(item.published_at)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-600 dark:text-slate-400 py-4">
                      <p>No front page headlines available.</p>
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
