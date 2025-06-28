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

  // Get analyzed additional headlines (articles with ChatGPT analysis) from ALL assets - sorted by date
  const analyzedHeadlines = newsData?.filter(item => 
    item.ai_confidence && 
    item.ai_sentiment &&
    !mainAnalysisArticles.find(main => main?.symbol === item.symbol && main?.title === item.title)
  ).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()) || [];

  // Get remaining headlines without analysis from ALL assets - sorted by date
  const remainingHeadlines = newsData?.filter(item => 
    (!item.ai_confidence || !item.ai_sentiment) &&
    !mainAnalysisArticles.find(main => main?.symbol === item.symbol && main?.title === item.title)
  ).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()) || [];

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

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-32 p-6 max-w-7xl mx-auto">
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
                    return (
                      <NewsCard 
                        key={article.id} 
                        symbol={article.symbol}
                        title={article.title}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Other Headlines</h3>
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {/* First show analyzed headlines with AI analysis from ALL assets */}
                  {analyzedHeadlines && analyzedHeadlines.length > 0 && (
                    <>
                      {analyzedHeadlines.slice(0, 15).map((item, index) => {
                        const assetInfo = getAssetInfo(item.symbol);
                        return (
                          <div key={`analyzed-${item.id}-${index}`} className="bg-gray-50 border border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className={`${assetInfo.color}/20 text-${assetInfo.color.split('-')[1]}-700 dark:text-${assetInfo.color.split('-')[1]}-300 text-xs`}>
                                {item.symbol}
                              </Badge>
                              <Badge className={`text-xs ${
                                item.ai_sentiment === 'Bullish' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                                item.ai_sentiment === 'Bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {item.ai_sentiment}
                              </Badge>
                            </div>
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-900 dark:text-white text-sm font-medium mb-2 line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer block"
                            >
                              {item.title}
                            </a>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-gray-600 dark:text-slate-400">
                                {new Date(item.published_at).toLocaleDateString()}
                              </span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((dot) => (
                                  <div
                                    key={dot}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      dot <= Math.round((item.ai_confidence / 100) * 5) ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-slate-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  
                  {/* Then show remaining headlines without analysis from ALL assets */}
                  {remainingHeadlines && remainingHeadlines.length > 0 && (
                    <>
                      {remainingHeadlines.slice(0, 25).map((item, index) => {
                        const assetInfo = getAssetInfo(item.symbol);
                        return (
                          <div key={`remaining-${item.id}-${index}`} className="bg-gray-50 border border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className={`${assetInfo.color}/20 text-${assetInfo.color.split('-')[1]}-700 dark:text-${assetInfo.color.split('-')[1]}-300 text-xs`}>
                                {item.symbol}
                              </Badge>
                            </div>
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-900 dark:text-white text-sm font-medium mb-2 line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer block"
                            >
                              {item.title}
                            </a>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-gray-600 dark:text-slate-400">
                                {new Date(item.published_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  
                  {(!analyzedHeadlines || analyzedHeadlines.length === 0) && (!remainingHeadlines || remainingHeadlines.length === 0) && (
                    <div className="text-center text-gray-600 dark:text-slate-400 py-4">
                      <p>No additional headlines available.</p>
                      <p className="text-sm mt-2">Click "Refresh News" to load more articles.</p>
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
