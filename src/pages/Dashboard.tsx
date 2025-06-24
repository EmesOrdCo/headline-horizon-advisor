
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import PredictionCard from "@/components/PredictionCard";
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
  const { toast } = useToast();

  const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];

  // Get stock price for a symbol
  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(stock => stock.symbol === symbol);
  };

  // Get main analysis articles (one per stock with AI analysis)
  const mainAnalysisArticles = MAGNIFICENT_7.map(symbol => {
    return newsData?.find(item => 
      item.symbol === symbol && 
      item.ai_confidence && 
      item.ai_sentiment
    );
  }).filter(Boolean);

  // Get analyzed additional headlines (articles with ChatGPT analysis) - sorted by date
  const analyzedHeadlines = newsData?.filter(item => 
    MAGNIFICENT_7.includes(item.symbol) && 
    item.ai_confidence && 
    item.ai_sentiment &&
    !mainAnalysisArticles.find(main => main?.symbol === item.symbol && main?.title === item.title)
  ).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()) || [];

  // Get remaining headlines without analysis - sorted by date
  const remainingHeadlines = newsData?.filter(item => 
    MAGNIFICENT_7.includes(item.symbol) && 
    (!item.ai_confidence || !item.ai_sentiment) &&
    !mainAnalysisArticles.find(main => main?.symbol === item.symbol && main?.title === item.title)
  ).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()) || [];

  const handleRefreshNews = async () => {
    setIsFetching(true);
    try {
      await fetchNews();
      await refetch();
      toast({
        title: "News Updated",
        description: "Latest news has been fetched and analyzed for Magnificent 7 stocks.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const predictions = [
    {
      symbol: "AAPL",
      current: 178.5,
      predicted: 182.3,
      change: 2.13,
      confidence: 78,
      timeframe: "24h"
    },
    {
      symbol: "TSLA", 
      current: 245.8,
      predicted: 238.9,
      change: -2.81,
      confidence: 65,
      timeframe: "24h"
    },
    {
      symbol: "NVDA",
      current: 712.4,
      predicted: 728.6, 
      change: 2.27,
      confidence: 82,
      timeframe: "24h"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      <main className="p-6 max-w-7xl mx-auto">
        <MarketTicker />
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">Live Market News</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-sm font-medium">LIVE</span>
                <span className="text-slate-400 text-sm">AI Analyzed</span>
              </div>
            </div>
            <Button 
              onClick={handleRefreshNews}
              disabled={isFetching}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh News
            </Button>
          </div>
          <p className="text-slate-400">Latest AI-analyzed news for Apple, Microsoft, Google, Amazon, NVIDIA, Tesla, and Meta</p>
          
          {isPricesLoading && (
            <div className="text-yellow-400 text-sm mt-2">
              Loading stock prices from Finnhub...
            </div>
          )}
          
          {!isPricesLoading && (!stockPrices || stockPrices.length === 0) && (
            <div className="text-red-400 text-sm mt-2">
              ⚠️ Stock prices unavailable - check Finnhub API connection
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="text-center text-slate-400 py-8">
                  Loading Magnificent 7 news...
                </div>
              ) : (
                // Always show 7 boxes, one for each Magnificent 7 stock
                MAGNIFICENT_7.map((symbol) => {
                  const article = mainAnalysisArticles.find(item => item.symbol === symbol);
                  const stockPrice = getStockPrice(symbol);
                  
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
                        stockPrice={stockPrice}
                      />
                    );
                  } else {
                    // Show placeholder for stocks without current analysis
                    return (
                      <div key={symbol} className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500 text-white">{symbol}</Badge>
                            <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 text-xs">
                              NO RECENT NEWS
                            </Badge>
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
                        <h3 className="text-lg font-semibold text-slate-400 mb-2">
                          No recent analysis available for {symbol}
                        </h3>
                        <p className="text-slate-500 text-sm">
                          Click "Refresh News" to fetch the latest market updates and AI analysis.
                        </p>
                        {!stockPrice && (
                          <p className="text-red-400 text-xs mt-2">
                            Stock price unavailable - check Finnhub connection
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
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 h-[600px] flex flex-col sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Other Headlines</h3>
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {/* First show analyzed headlines with AI analysis */}
                  {analyzedHeadlines && analyzedHeadlines.length > 0 && (
                    <>
                      {analyzedHeadlines.slice(0, 15).map((item, index) => (
                        <div key={`analyzed-${item.id}-${index}`} className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                              {item.symbol}
                            </Badge>
                            <Badge className={`text-xs ${
                              item.ai_sentiment === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                              item.ai_sentiment === 'Bearish' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {item.ai_sentiment}
                            </Badge>
                          </div>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white text-sm font-medium mb-2 line-clamp-2 hover:text-emerald-400 transition-colors cursor-pointer block"
                          >
                            {item.title}
                          </a>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-400">
                              {new Date(item.published_at).toLocaleDateString()}
                            </span>
                            <span className="text-emerald-400 font-semibold">{item.ai_confidence}% confidence</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5">
                            <div 
                              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                              style={{width: `${item.ai_confidence}%`}}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {/* Then show remaining headlines without analysis */}
                  {remainingHeadlines && remainingHeadlines.length > 0 && (
                    <>
                      {remainingHeadlines.slice(0, 25).map((item, index) => (
                        <div key={`remaining-${item.id}-${index}`} className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                              {item.symbol}
                            </Badge>
                          </div>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white text-sm font-medium mb-2 line-clamp-2 hover:text-emerald-400 transition-colors cursor-pointer block"
                          >
                            {item.title}
                          </a>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-400">
                              {new Date(item.published_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {(!analyzedHeadlines || analyzedHeadlines.length === 0) && (!remainingHeadlines || remainingHeadlines.length === 0) && (
                    <div className="text-center text-slate-400 py-4">
                      <p>No additional headlines available.</p>
                      <p className="text-sm mt-2">Click "Refresh News" to load more articles.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">AI Predictions</h2>
            <Link to="/predictions">
              <Button variant="link" className="text-emerald-400 hover:text-emerald-300">
                View more →
              </Button>
            </Link>
          </div>
          <p className="text-slate-400 mb-8">Keep up with the latest AI-generated market forecasts</p>
          
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <PredictionCard key={index} {...prediction} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
