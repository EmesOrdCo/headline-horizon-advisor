import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, ArrowLeft, BarChart3, TrendingUp, TrendingDown, Wifi, WifiOff, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import RealTimePriceChart from "@/components/RealTimePriceChart";
import HistoricalPriceChart from "@/components/HistoricalPriceChart";
import { SourceArticles } from "@/components/NewsCard/SourceArticles";
import { useNews, useFetchNews } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useAlpacaStreamSingleton } from "@/hooks/useAlpacaStreamSingleton";
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
  const [useWebSocket, setUseWebSocket] = useState(true);
  const { toast } = useToast();

  // Focus on all Magnificent 7 stocks
  const MAGNIFICENT_7_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];

  // Enhanced market hours detection
  const marketStatus = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour + currentMinutes / 60;
    const currentDay = now.getDay();
    
    const isWeekend = currentDay === 0 || currentDay === 6;
    
    // Market hours: 9:30 AM - 4:00 PM ET (14:30 - 21:00 UTC)
    // Pre-market: 4:00 AM - 9:30 AM ET (9:00 - 14:30 UTC)
    // After-hours: 4:00 PM - 8:00 PM ET (21:00 - 1:00 UTC next day)
    
    if (isWeekend) {
      return {
        isOpen: false,
        status: 'closed',
        message: 'Markets are closed (Weekend)',
        webSocketLimited: true
      };
    }
    
    // Convert to ET for market hours (approximate)
    const etHour = (currentHour - 5 + 24) % 24; // Rough EST conversion
    const etTime = etHour + currentMinutes / 60;
    
    if (etTime >= 9.5 && etTime < 16) {
      return {
        isOpen: true,
        status: 'open',
        message: 'Markets are open',
        webSocketLimited: false
      };
    } else if (etTime >= 4 && etTime < 9.5) {
      return {
        isOpen: false,
        status: 'premarket',
        message: 'Pre-market hours',
        webSocketLimited: true
      };
    } else if (etTime >= 16 && etTime < 20) {
      return {
        isOpen: false,
        status: 'afterhours',
        message: 'After-hours trading',
        webSocketLimited: true
      };
    } else {
      return {
        isOpen: false,
        status: 'closed',
        message: 'Markets are closed',
        webSocketLimited: true
      };
    }
  }, []);

  // WebSocket connection for real-time data
  const {
    isConnected: wsConnected,
    isAuthenticated: wsAuthenticated,
    connectionStatus: wsStatus,
    streamData: wsData,
    errorMessage: wsError
  } = useAlpacaStreamSingleton({
    symbols: MAGNIFICENT_7_SYMBOLS,
    enabled: useWebSocket
  });

  useEffect(() => {
    MAGNIFICENT_7_SYMBOLS.forEach(symbol => {
      if (wsData[symbol] && useWebSocket) {
        const newDataPoint: PriceHistoryPoint = {
          timestamp: wsData[symbol].timestamp || new Date().toISOString(),
          price: wsData[symbol].price || 0,
          symbol: symbol
        };
        
        setPriceHistory(prev => ({
          ...prev,
          [symbol]: [...(prev[symbol] || []), newDataPoint].slice(-50) // Keep last 50 points
        }));
      }
    });
  }, [wsData, MAGNIFICENT_7_SYMBOLS, useWebSocket]);

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
    
    return null;
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

  // Get the best available stock data (WebSocket first, then REST API)
  const getBestStockData = (symbol: string) => {
    if (useWebSocket && wsData[symbol]) {
      const wsPrice = wsData[symbol];
      return {
        symbol,
        price: wsPrice.price || 0,
        askPrice: wsPrice.ask || wsPrice.price || 0,
        bidPrice: wsPrice.bid || wsPrice.price || 0,
        previousClose: wsPrice.close || wsPrice.price || 0,
        change: 0, // WebSocket data doesn't include change calculation
        changePercent: 0,
        isRealTime: true,
        error: false
      };
    }
    
    const apiPrice = stockPrices?.find(stock => stock.symbol === symbol);
    if (apiPrice) {
      return {
        ...apiPrice,
        isRealTime: false
      };
    }
    
    return {
      symbol,
      price: 0,
      askPrice: 0,
      bidPrice: 0,
      previousClose: 0,
      change: 0,
      changePercent: 0,
      isRealTime: false,
      error: true,
      errorMessage: 'No data available'
    };
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
                    onClick={() => setUseWebSocket(!useWebSocket)}
                    variant="outline" 
                    className={`border-slate-600 ${
                      useWebSocket 
                        ? 'bg-emerald-600/20 border-emerald-600 text-emerald-400' 
                        : 'bg-slate-700/50 text-slate-300'
                    } hover:bg-slate-600/50`}
                  >
                    {useWebSocket ? (
                      <>
                        <Wifi className="w-4 h-4 mr-2" />
                        Live Data {wsConnected ? '(Connected)' : '(Connecting...)'}
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 mr-2" />
                        REST API
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => setShowCharts(!showCharts)}
                    variant="outline" 
                    className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {showCharts ? 'Hide Charts' : 'Show Charts'}
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Magnificent 7 Stocks Analysis</h1>
                <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">
                  Real-time stock data and analysis for the Magnificent 7 tech stocks
                  {useWebSocket && (
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      wsConnected ? 'bg-emerald-600/20 text-emerald-400' : 'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {wsStatus === 'connected' ? 'Live Stream Active' : 
                       wsStatus === 'connecting' ? 'Connecting...' : 
                       wsStatus === 'error' ? 'Stream Error' : 'Disconnected'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Market Hours Status */}
          <Card className={`mb-6 ${
            marketStatus.isOpen 
              ? 'bg-emerald-900/20 border-emerald-600/50' 
              : 'bg-amber-900/20 border-amber-600/50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${
                  marketStatus.isOpen ? 'text-emerald-400' : 'text-amber-400'
                }`} />
                <div className="flex-1">
                  <div className={`font-medium ${
                    marketStatus.isOpen ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {marketStatus.message}
                  </div>
                  {marketStatus.webSocketLimited && (
                    <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      WebSocket connectivity may be limited during off-market hours
                    </div>
                  )}
                </div>
                <Badge 
                  variant={marketStatus.isOpen ? "default" : "secondary"}
                  className={marketStatus.isOpen 
                    ? "bg-emerald-600 text-white" 
                    : "bg-amber-600 text-white"
                  }
                >
                  {marketStatus.status.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* WebSocket Status Alert */}
          {useWebSocket && (wsError || marketStatus.webSocketLimited) && (
            <Card className="mb-6 bg-yellow-900/20 border-yellow-600/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 text-yellow-400">
                  <WifiOff className="w-4 h-4 mt-0.5" />
                  <div className="flex-1">
                    {wsError && (
                      <div className="text-sm mb-2">{wsError}</div>
                    )}
                    {marketStatus.webSocketLimited && (
                      <div className="text-sm">
                        <strong>Live data may be limited:</strong> Alpaca restricts WebSocket connections during {marketStatus.status} hours. 
                        Switch to REST API for current market data, or try again during regular trading hours (9:30 AM - 4:00 PM ET).
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Magnificent 7 Stock Price Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {MAGNIFICENT_7_SYMBOLS.map((symbol) => {
              const stockData = getBestStockData(symbol);
              
              return (
                <Card key={symbol} className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>{symbol}</span>
                      {useWebSocket ? (
                        <span className={`text-xs px-2 py-1 rounded ${
                          stockData?.isRealTime ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-600/20 text-slate-400'
                        }`}>
                          {stockData?.isRealTime ? 'Live' : 'Delayed'}
                        </span>
                      ) : (
                        <>
                          {stockPricesLoading && <span className="text-yellow-400 text-xs">Loading...</span>}
                          {stockPricesError && <span className="text-red-400 text-xs">Error</span>}
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stockData?.error ? (
                      <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
                        <div className="text-center text-red-400">
                          <div className="text-lg font-bold">No Data</div>
                          <div className="text-sm text-red-300 mt-1">
                            {stockData.errorMessage || 'Unable to fetch stock price'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                        {/* Main Trading Price */}
                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold text-white mb-1">
                            ${stockData.price.toFixed(2)}
                          </div>
                          
                          {!stockData.isRealTime && (
                            <div className={`flex items-center justify-center gap-2 text-sm ${
                              stockData.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {stockData.change >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span>
                                {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} 
                                ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bid/Ask Spread */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-600">
                          <div className="text-center">
                            <div className="text-sm font-bold text-red-400">
                              ${stockData.bidPrice.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-400">Bid</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-emerald-400">
                              ${stockData.askPrice.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-400">Ask</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Historical Price Chart - Always Visible */}
          <Card className="mb-8 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Historical Price Chart (AAPL)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <HistoricalPriceChart symbol="AAPL" limit={30} />
              </div>
            </CardContent>
          </Card>

          {/* Live Chart */}
          {showCharts && (
            <div className="grid grid-cols-1 gap-4 mb-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    AAPL {useWebSocket ? 'Live' : 'Real-Time'} Price Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <RealTimePriceChart
                      data={priceHistory['AAPL'] || []}
                      symbol="AAPL"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Placeholder box */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-center text-slate-400">
                    <div className="text-lg font-medium">Additional analysis coming soon</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* News Analysis Section - only show if we have news data */}
          {newsData && newsData.length > 0 && (
            <div className="space-y-8">
              {newsData
                .filter(item => item.symbol === 'AAPL')
                .map((article) => {
                  const stockData = getBestStockData('AAPL');
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
                                stockPrice={stockData}
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
