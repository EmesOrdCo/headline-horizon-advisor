import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, ArrowLeft, BarChart3, Wifi, WifiOff, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import RealTimePriceChart from "@/components/RealTimePriceChart";
import { SourceArticles } from "@/components/NewsCard/SourceArticles";
import { useNews, useFetchNews } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useArticleWeights } from "@/hooks/useArticleWeights";
import { useAlpacaStream } from "@/hooks/useAlpacaStream";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";

interface PriceHistoryPoint {
  timestamp: string;
  price: number;
  symbol: string;
}

const Magnificent7 = () => {
  useSEO({
    title: "Magnificent 7 Stocks Analysis",
    description: "Comprehensive AI-powered analysis of the Magnificent 7 tech stocks: Apple, Microsoft, Google, Amazon, NVIDIA, Tesla, and Meta. Get real-time insights and market sentiment.",
    canonical: "https://yourdomain.com/magnificent-7",
    ogType: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Magnificent 7 Stocks Analysis",
      "description": "AI-powered analysis of top 7 tech stocks",
      "author": {
        "@type": "Organization",
        "name": "MarketSensorAI"
      },
      "publisher": {
        "@type": "Organization",
        "name": "MarketSensorAI",
        "url": "https://yourdomain.com"
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://yourdomain.com/magnificent-7"
      },
      "about": [
        { "@type": "Corporation", "name": "Apple Inc.", "tickerSymbol": "AAPL" },
        { "@type": "Corporation", "name": "Microsoft Corporation", "tickerSymbol": "MSFT" },
        { "@type": "Corporation", "name": "Alphabet Inc.", "tickerSymbol": "GOOGL" },
        { "@type": "Corporation", "name": "Amazon.com Inc.", "tickerSymbol": "AMZN" },
        { "@type": "Corporation", "name": "NVIDIA Corporation", "tickerSymbol": "NVDA" },
        { "@type": "Corporation", "name": "Tesla Inc.", "tickerSymbol": "TSLA" },
        { "@type": "Corporation", "name": "Meta Platforms Inc.", "tickerSymbol": "META" }
      ]
    }
  });
  
  const { data: newsData, isLoading, refetch } = useNews();
  const { data: stockPrices, isLoading: stockPricesLoading, error: stockPricesError } = useStockPrices();
  const fetchNews = useFetchNews();
  const [isFetching, setIsFetching] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [priceHistory, setPriceHistory] = useState<{[key: string]: PriceHistoryPoint[]}>({});
  const { toast } = useToast();

  // Focus on just AAPL for now
  const FOCUS_SYMBOL = 'AAPL';

  // Real-time streaming for just AAPL
  const streamResult = useAlpacaStream({
    symbols: [FOCUS_SYMBOL],
    enabled: true
  });
  
  const { isConnected, isAuthenticated, connectionStatus, streamData } = streamResult;

  const isMarketClosed = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    const isWeekend = currentDay === 0 || currentDay === 6;
    const isAfterHours = currentHour < 14 || currentHour > 21;
    
    return isWeekend || isAfterHours;
  }, []);

  // Store price history for charts
  useEffect(() => {
    const liveData = streamData[FOCUS_SYMBOL];
    if (liveData?.price && liveData?.timestamp) {
      setPriceHistory(prev => ({
        ...prev,
        [FOCUS_SYMBOL]: [
          ...(prev[FOCUS_SYMBOL] || []).slice(-99),
          {
            timestamp: liveData.timestamp,
            price: liveData.price,
            symbol: FOCUS_SYMBOL
          }
        ]
      }));
    }
  }, [streamData]);

  const magnificent7ArticlesData = useMemo(() => {
    return ['AAPL'].map(symbol => {
      const article = newsData?.find(item => 
        item.symbol === symbol && 
        item.ai_confidence && 
        item.ai_sentiment
      );
      
      if (!article) {
        return {
          symbol,
          sourceArticles: [],
          article: null
        };
      }

      let sourceArticles = [];
      try {
        sourceArticles = article.source_links ? JSON.parse(article.source_links) : [];
      } catch (error) {
        console.error('Error parsing source links:', error);
      }
      
      return {
        symbol,
        sourceArticles,
        article
      };
    });
  }, [newsData]);

  const getStockPrice = (symbol: string) => {
    const apiPrice = stockPrices?.find(stock => stock.symbol === symbol);
    if (apiPrice && apiPrice.price > 0) {
      return apiPrice;
    }
    
    return {
      symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      error: true
    };
  };

  const generateCompositeHeadline = (item: any): string => {
    const symbol = item.symbol;
    const sentiment = item.ai_sentiment?.toLowerCase() || 'neutral';
    
    let sourceArticles = [];
    try {
      sourceArticles = item.source_links ? JSON.parse(item.source_links) : [];
    } catch (error) {
      console.error('Error parsing source links:', error);
    }

    let summary = '';
    
    if (sourceArticles.length > 0) {
      const titles = sourceArticles.map((article: any) => article.title.toLowerCase());
      
      if (titles.some(t => t.includes('earnings') || t.includes('revenue') || t.includes('profit'))) {
        summary = sentiment === 'bullish' ? 'Strong earnings boost confidence' : 'Earnings disappoint investors';
      } else if (titles.some(t => t.includes('upgrade') || t.includes('analyst') || t.includes('target'))) {
        summary = sentiment === 'bullish' ? 'Analysts raise price targets' : 'Analysts downgrade stock';
      } else if (titles.some(t => t.includes('ai') || t.includes('artificial intelligence'))) {
        summary = sentiment === 'bullish' ? 'AI developments drive growth' : 'AI concerns weigh on stock';
      } else {
        summary = sentiment === 'bullish' ? 'Positive developments support growth' : 'Market challenges create headwinds';
      }
    } else {
      summary = sentiment === 'bullish' ? 'Positive momentum continues' : 'Market pressures weigh on stock';
    }

    return `${symbol}: ${summary}`;
  };

  const handleRefreshNews = async () => {
    setIsFetching(true);
    
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
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      {/* Market Ticker */}
      <div className="pt-16">
        <MarketTicker />
      </div>
      
      <div className="pt-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between">
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => setShowCharts(!showCharts)}
                    variant="outline" 
                    className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {showCharts ? 'Hide Chart' : 'Show Chart'}
                  </Button>
                  <Button 
                    onClick={handleRefreshNews}
                    disabled={isFetching}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                    {isFetching ? 'Fetching...' : 'Refresh News'}
                  </Button>
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">AAPL Live Data Test</h1>
                <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">Testing real-time data connection for Apple Inc.</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    connectionStatus === 'connected' && isAuthenticated ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20' :
                    connectionStatus === 'connecting' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/20' :
                    connectionStatus === 'error' ? 'bg-red-900/20 text-red-400 border border-red-500/20' :
                    'bg-slate-700/50 text-slate-400 border border-slate-600'
                  }`}>
                    {connectionStatus === 'connected' && isAuthenticated ? (
                      <>
                        <Wifi className="w-3 h-3" />
                        WebSocket Connected
                      </>
                    ) : connectionStatus === 'connecting' ? (
                      <>
                        <WifiOff className="w-3 h-3" />
                        Connecting...
                      </>
                    ) : connectionStatus === 'error' ? (
                      <>
                        <WifiOff className="w-3 h-3" />
                        Connection Failed
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3" />
                        Disconnected
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Price Dashboard for AAPL only */}
          <Card className="mb-8 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {FOCUS_SYMBOL} Live Price Data
                {isConnected && isAuthenticated && (
                  <span className="text-emerald-400 text-sm">● CONNECTED</span>
                )}
                {connectionStatus === 'error' && (
                  <span className="text-red-400 text-sm">● ERROR</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-emerald-600 text-white">{FOCUS_SYMBOL}</Badge>
                  <div className="flex items-center gap-2">
                    {isConnected && isAuthenticated ? (
                      <Wifi className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  {streamData[FOCUS_SYMBOL]?.price ? (
                    <>
                      <div className="text-3xl font-bold text-white mb-2">
                        ${formatPrice(streamData[FOCUS_SYMBOL].price)}
                      </div>
                      {streamData[FOCUS_SYMBOL].timestamp && (
                        <div className="text-sm text-slate-400 mb-2">
                          Last updated: {formatTime(streamData[FOCUS_SYMBOL].timestamp)}
                        </div>
                      )}
                      {streamData[FOCUS_SYMBOL].volume && (
                        <div className="text-sm text-slate-400">
                          Volume: {streamData[FOCUS_SYMBOL].volume.toLocaleString()}
                        </div>
                      )}
                    </>
                  ) : connectionStatus === 'error' ? (
                    <div className="text-red-400 text-center">
                      <div className="text-xl font-bold">Connection Error</div>
                      <div className="text-sm text-slate-500 mt-2">Unable to connect to real-time data stream</div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-center">
                      <div className="text-xl font-bold">Connecting...</div>
                      <div className="text-sm text-slate-500 mt-2">Establishing connection to data stream</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Chart */}
          {showCharts && (
            <Card className="mb-8 bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  {FOCUS_SYMBOL} Price Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <RealTimePriceChart
                    data={priceHistory[FOCUS_SYMBOL] || []}
                    symbol={FOCUS_SYMBOL}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* News Analysis Section - only show if we have news data */}
          {newsData && newsData.length > 0 && (
            <div className="space-y-8">
              {newsData
                .filter(item => item.symbol === FOCUS_SYMBOL)
                .map((article) => {
                  const stockPrice = getStockPrice(FOCUS_SYMBOL);
                  const compositeHeadline = generateCompositeHeadline(article);
                  
                  let sourceArticles = [];
                  try {
                    sourceArticles = article.source_links ? JSON.parse(article.source_links) : [];
                  } catch (error) {
                    console.error('Error parsing source links:', error);
                  }
                  
                  return (
                    <div key={article.id} className="w-full">
                      <Card className="bg-slate-800/50 border-slate-700 h-full">
                        <CardContent className="p-6 h-full">
                          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
                            <div className="lg:col-span-2">
                              <NewsCard 
                                symbol={article.symbol}
                                title={compositeHeadline}
                                description={article.description}
                                confidence={article.ai_confidence}
                                sentiment={article.ai_sentiment}
                                category={article.category}
                                isHistorical={article.ai_reasoning?.includes('Historical')}
                                sourceLinks="[]"
                                stockPrice={stockPrice}
                              />
                            </div>
                            <div className="lg:col-span-3">
                              <SourceArticles 
                                parsedSourceLinks={sourceArticles}
                                isHistorical={article.ai_reasoning?.includes('Historical')}
                                weightsLoading={false}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Magnificent7;
