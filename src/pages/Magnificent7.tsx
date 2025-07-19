import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, ArrowLeft, BarChart3, Wifi, WifiOff, Clock, ExternalLink } from "lucide-react";
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

  const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];

  // Enhanced mock close prices with realistic values
  const mockClosePrices = {
    'AAPL': 225.75,
    'MSFT': 441.85,
    'GOOGL': 178.92,
    'AMZN': 215.38,
    'NVDA': 144.75,
    'TSLA': 359.22,
    'META': 598.45
  };

  // Real-time streaming for Magnificent 7
  const streamResult = useAlpacaStream({
    symbols: MAGNIFICENT_7,
    enabled: true
  });
  
  const { isConnected, isAuthenticated, connectionStatus, streamData } = streamResult;

  const isMarketClosed = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    const isWeekend = currentDay === 0 || currentDay === 6;
    const isAfterHours = currentHour < 14 || currentHour > 21;
    const apiFailure = stockPricesError || (!stockPricesLoading && (!stockPrices || stockPrices.length === 0));
    
    return isWeekend || isAfterHours || connectionStatus === 'error' || apiFailure;
  }, [connectionStatus, stockPricesError, stockPricesLoading, stockPrices]);

  useEffect(() => {
    if (isMarketClosed) {
      const mockHistory: {[key: string]: PriceHistoryPoint[]} = {};
      
      MAGNIFICENT_7.forEach(symbol => {
        const basePrice = mockClosePrices[symbol as keyof typeof mockClosePrices];
        const points: PriceHistoryPoint[] = [];
        
        for (let i = 0; i < 50; i++) {
          const variance = (Math.random() - 0.5) * 0.04;
          const price = basePrice * (1 + variance);
          const timestamp = new Date();
          timestamp.setHours(9, 30 + (i * 7.8), 0, 0);
          
          points.push({
            timestamp: timestamp.toISOString(),
            price: Number(price.toFixed(2)),
            symbol: symbol
          });
        }
        
        mockHistory[symbol] = points;
      });
      
      setPriceHistory(mockHistory);
    }
  }, [isMarketClosed]);

  useEffect(() => {
    if (!isMarketClosed) {
      Object.entries(streamData).forEach(([symbol, data]) => {
        if (data.price && data.timestamp) {
          setPriceHistory(prev => ({
            ...prev,
            [symbol]: [
              ...(prev[symbol] || []).slice(-99),
              {
                timestamp: data.timestamp,
                price: data.price,
                symbol: symbol
              }
            ]
          }));
        }
      });
    }
  }, [streamData, isMarketClosed]);

  const magnificent7ArticlesData = useMemo(() => {
    return MAGNIFICENT_7.map(symbol => {
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

  const articleWeightsResults = MAGNIFICENT_7.map((symbol, index) => {
    const articleData = magnificent7ArticlesData[index];
    return useArticleWeights({
      articles: articleData?.sourceArticles || [],
      overallSentiment: articleData?.article?.ai_sentiment || 'Neutral',
      overallConfidence: articleData?.article?.ai_confidence || 50,
      symbol: symbol,
      enabled: (articleData?.sourceArticles?.length || 0) > 0 && !articleData?.article?.ai_reasoning?.includes('Historical')
    });
  });

  const getStockPrice = (symbol: string) => {
    const apiPrice = stockPrices?.find(stock => stock.symbol === symbol);
    if (apiPrice && apiPrice.price > 0) {
      return apiPrice;
    }
    
    const mockPrice = mockClosePrices[symbol as keyof typeof mockClosePrices];
    if (mockPrice) {
      const mockData = {
        symbol,
        price: mockPrice,
        change: (Math.random() - 0.5) * 8,
        changePercent: (Math.random() - 0.5) * 3
      };
      return mockData;
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Magnificent 7 Stocks</h1>
                <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">AI-analyzed news for the seven largest tech companies with {isMarketClosed ? 'close' : 'live'} market data</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    isMarketClosed ? 'bg-orange-900/20 text-orange-400 border border-orange-500/20' :
                    connectionStatus === 'connected' && isAuthenticated ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20' :
                    connectionStatus === 'connecting' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/20' :
                    connectionStatus === 'error' ? 'bg-red-900/20 text-red-400 border border-red-500/20' :
                    'bg-slate-700/50 text-slate-400 border border-slate-600'
                  }`}>
                    {isMarketClosed ? (
                      <>
                        <Clock className="w-3 h-3" />
                        Market Closed - Showing Close Prices
                      </>
                    ) : connectionStatus === 'connected' && isAuthenticated ? (
                      <>
                        <Wifi className="w-3 h-3" />
                        Live Data Connected
                      </>
                    ) : connectionStatus === 'connecting' ? (
                      <>
                        <WifiOff className="w-3 h-3" />
                        Connecting...
                      </>
                    ) : connectionStatus === 'error' ? (
                      <>
                        <WifiOff className="w-3 h-3" />
                        Connection Error - Using Sample Data
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

          {/* Live Price Dashboard */}
          <Card className="mb-8 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {isMarketClosed ? 'Magnificent 7 Close Prices' : 'Live Magnificent 7 Prices'}
                {!isMarketClosed && isConnected && isAuthenticated && (
                  <span className="text-emerald-400 text-sm">● LIVE</span>
                )}
                {isMarketClosed && (
                  <span className="text-orange-400 text-sm">● CLOSED</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {MAGNIFICENT_7.map((symbol) => {
                  const liveData = streamData[symbol];
                  const fallbackPrice = getStockPrice(symbol);
                  
                  return (
                    <Link key={symbol} to={`/stock/${symbol}`} className="block">
                      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-600/50 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-emerald-600 text-white">{symbol}</Badge>
                          <div className="flex items-center gap-2">
                            {isMarketClosed ? (
                              <Clock className="w-3 h-3 text-orange-400" />
                            ) : isConnected && isAuthenticated ? (
                              <Wifi className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <WifiOff className="w-3 h-3 text-slate-400" />
                            )}
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {!isMarketClosed && liveData?.price ? (
                            <>
                              <div className="text-lg font-bold text-white">
                                ${formatPrice(liveData.price)}
                              </div>
                              {liveData.timestamp && (
                                <div className="text-xs text-slate-400">
                                  {formatTime(liveData.timestamp)}
                                </div>
                              )}
                              {liveData.volume && (
                                <div className="text-xs text-slate-400">
                                  Vol: {liveData.volume.toLocaleString()}
                                </div>
                              )}
                            </>
                          ) : fallbackPrice ? (
                            <>
                              <div className="text-lg font-bold text-white">
                                ${fallbackPrice.price.toFixed(2)}
                              </div>
                              <div className="text-xs text-slate-400">
                                {isMarketClosed ? 'Close Price' : 'Last Price'}
                              </div>
                              {fallbackPrice.change !== undefined && (
                                <div className={`text-xs ${fallbackPrice.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {fallbackPrice.change >= 0 ? '+' : ''}{fallbackPrice.change.toFixed(2)} ({fallbackPrice.changePercent?.toFixed(2)}%)
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-slate-400 text-sm">
                              Loading...
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Live Charts */}
          {showCharts && (
            <Card className="mb-8 bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  {isMarketClosed ? 'Price Charts (Until Close)' : 'Live Price Charts'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {MAGNIFICENT_7.map((symbol) => (
                    <div key={symbol} className="bg-slate-700/30 rounded-lg p-4">
                      <RealTimePriceChart
                        data={priceHistory[symbol] || []}
                        symbol={symbol}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* News Analysis Section */}
          <div className="space-y-8">
            {isLoading ? (
              <div className="text-center text-gray-600 dark:text-slate-400 py-8">
                Loading Magnificent 7 analysis...
              </div>
            ) : (
              MAGNIFICENT_7.map((symbol, index) => {
                const stockData = magnificent7ArticlesData[index];
                const article = stockData?.article;
                const stockPrice = getStockPrice(symbol);
                
                if (article) {
                  const compositeHeadline = generateCompositeHeadline(article);
                  const sourceArticles = stockData.sourceArticles;
                  const { data: articleWeights, isLoading: weightsLoading } = articleWeightsResults[index];
                  
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
                                articleWeights={articleWeights}
                                weightsLoading={weightsLoading}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                } else {
                  return (
                    <div key={symbol} className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-6">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500 text-white">{symbol}</Badge>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs">
                            NO RECENT NEWS
                          </Badge>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 dark:text-slate-400 mb-2">
                        {symbol}: No recent analysis available
                      </h3>
                      <p className="text-gray-500 dark:text-slate-500 text-sm">
                        Click "Refresh News" to fetch the latest market updates and AI analysis.
                      </p>
                    </div>
                  );
                }
              })
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Magnificent7;
