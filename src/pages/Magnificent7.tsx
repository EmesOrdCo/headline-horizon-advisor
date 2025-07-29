import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ArrowLeft, BarChart3, TrendingUp, TrendingDown, Wifi, WifiOff, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import RealTimePriceChart from "@/components/RealTimePriceChart";
import HistoricalPriceChart from "@/components/HistoricalPriceChart";
import ChartModal from "@/components/ChartModal";
import { SourceArticles } from "@/components/NewsCard/SourceArticles";
import { AIAnalysisSection } from "@/components/NewsCard/AIAnalysisSection";
import { SentimentIndicator } from "@/components/NewsCard/SentimentIndicator";
import { DetailedAnalysis } from "@/components/NewsCard/DetailedAnalysis";
import { useMagnificent7Articles, useFetchMagnificent7 } from "@/hooks/useMagnificent7";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useAlpacaStreamSingleton } from "@/hooks/useAlpacaStreamSingleton";
import { useCompanyLogos } from "@/hooks/useCompanyLogos";
import CompanyLogo from "@/components/CompanyLogo";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { useArticleWeights } from "@/hooks/useArticleWeights";
import { ExternalLink } from "lucide-react";

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
  
  const { data: newsData, isLoading, refetch } = useMagnificent7Articles();
  const { data: stockPrices, isLoading: stockPricesLoading, error: stockPricesError } = useStockPrices();
  const fetchNews = useFetchMagnificent7();
  const [isFetching, setIsFetching] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [selectedChart, setSelectedChart] = useState<{ symbol: string; stockName: string } | null>(null);
  const [priceHistory, setPriceHistory] = useState<{[key: string]: PriceHistoryPoint[]}>({});
  const { toast } = useToast();

  // Focus on all Magnificent 7 stocks
  const MAGNIFICENT_7_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
  
  // Get company logos for the stocks
  const { logos, loading: logosLoading, getLogoUrl } = useCompanyLogos(MAGNIFICENT_7_SYMBOLS);
  
  // TEST: Only stream one stock to debug WebSocket issues - use useMemo to prevent recreation
  const TEST_SYMBOLS = useMemo(() => ['AAPL'], []);

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

  // Automatically determine data source based on market status
  const useWebSocket = marketStatus.isOpen && !marketStatus.webSocketLimited;

  // WebSocket connection for real-time data
  const {
    isConnected: wsConnected,
    isAuthenticated: wsAuthenticated,
    connectionStatus: wsStatus,
    streamData: wsData,
    errorMessage: wsError
  } = useAlpacaStreamSingleton({
    symbols: TEST_SYMBOLS, // TEST: Only stream AAPL
    enabled: useWebSocket && !window.location.pathname.includes('/alpaca-live-chart')
  });

  useEffect(() => {
    TEST_SYMBOLS.forEach(symbol => { // TEST: Only process the symbol we're streaming
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
  }, [wsData, TEST_SYMBOLS, useWebSocket]);

  // Auto-refresh news when page loads
  useEffect(() => {
    const autoRefresh = async () => {
      try {
        await fetchNews();
        await refetch();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    };
    
    autoRefresh();
  }, []); // Only run once on mount

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
                </p>
              </div>
            </div>
          </div>

          {/* WebSocket Status Alert - Only show if there are connection issues during market hours */}
          {useWebSocket && wsError && (
            <Card className="mb-6 bg-yellow-900/20 border-yellow-600/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 text-yellow-400">
                  <WifiOff className="w-4 h-4 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm mb-2">{wsError}</div>
                    <div className="text-sm">
                      <strong>WebSocket connection failed:</strong> Falling back to REST API for current market data.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Magnificent 7 Stock Analysis Sections */}
          <div className="space-y-8">
            {MAGNIFICENT_7_SYMBOLS.map((symbol) => {
              const stockData = getBestStockData(symbol);
              const article = newsData?.find(item => 
                item.symbol === symbol && 
                item.ai_confidence && 
                item.ai_sentiment
              );
              
              let sourceArticles = [];
              try {
                sourceArticles = article?.source_links ? JSON.parse(article.source_links) : [];
              } catch (error) {
                console.error('Error parsing source links:', error);
              }
              
              const compositeHeadline = article ? generateCompositeHeadline(article) : `${symbol}: Market Analysis`;
              
              // Show loading state while stock prices are loading
              if (stockPricesLoading) {
                return (
                  <Card key={symbol} className="mb-8 bg-slate-800/50 border-slate-700">
                    <div className="bg-slate-700/30 border-b border-slate-600 px-6 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded" />
                            <Skeleton className="w-16 h-6 rounded" />
                            <Skeleton className="w-24 h-4 rounded" />
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <div key={index} className="text-center">
                                <Skeleton className="w-12 h-3 mb-1" />
                                <Skeleton className="w-16 h-4" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <Skeleton className="w-20 h-8 rounded" />
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center h-32">
                        <div className="flex items-center gap-3 text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span className="text-sm">Loading stock data...</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              
              return (
                <div key={symbol} className="w-full">
                  {/* Integrated Stock Info and News Analysis */}
                  {article ? (
                    <Card className="mb-8 bg-slate-800/50 border-slate-700 animate-fade-in">
                      {/* Compact Stock Header */}
                      <div className="bg-slate-700/30 border-b border-slate-600 px-6 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                              <CompanyLogo symbol={symbol} className="w-8 h-8" />
                              <Badge className="bg-emerald-600 text-white font-semibold">{symbol}</Badge>
                              <span className="text-white font-medium">{symbol} Corporation</span>
                            </div>
                            
                            {/* Technical Data Spread Out */}
                            {!stockData?.error && (
                              <div className="flex items-center gap-6 text-sm">
                                <div className="text-center">
                                  <div className="text-slate-400 text-xs">Price</div>
                                  <div className="text-white font-medium">
                                    ${stockData?.price ? stockData.price.toFixed(2) : '0.00'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-slate-400 text-xs">Change</div>
                                  <div className={`font-medium ${
                                    stockData?.change && stockData.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                                  }`}>
                                    {stockData?.change && stockData.change >= 0 ? '+' : ''}
                                    {stockData?.change ? stockData.change.toFixed(2) : '0.00'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-slate-400 text-xs">Change %</div>
                                  <div className={`font-medium ${
                                    stockData?.changePercent && stockData.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                                  }`}>
                                    {stockData?.changePercent ? (stockData.changePercent >= 0 ? '+' : '') + stockData.changePercent.toFixed(2) : '0.00'}%
                                  </div>
                                </div>
                                {stockData?.bidPrice && stockData?.askPrice && (
                                  <>
                                    <div className="text-center">
                                      <div className="text-slate-400 text-xs">Bid</div>
                                      <div className="text-red-400 font-medium">${stockData.bidPrice.toFixed(2)}</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-slate-400 text-xs">Ask</div>
                                      <div className="text-emerald-400 font-medium">${stockData.askPrice.toFixed(2)}</div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedChart({ symbol, stockName: `${symbol} Corporation` })}
                            className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover-scale"
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Chart
                          </Button>
                        </div>
                        
                        {stockData?.error && (
                          <div className="mt-3 text-red-400 text-center">
                            <div className="font-bold">No Data Available</div>
                            <div className="text-xs text-red-300">
                              {stockData.errorMessage || 'Unable to fetch price'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* News Analysis Content */}
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                          {/* Left Side - AI Analysis */}
                          <div className="lg:col-span-2 space-y-4">
                            {/* Stock Badge */}
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-500 text-white">{article.symbol}</Badge>
                              <span className="text-slate-400">Stock</span>
                            </div>

                            {/* Main Title */}
                            <h3 className="text-xl font-bold text-white">
                              {compositeHeadline}
                            </h3>

                            {/* Description */}
                            <p className="text-slate-300 text-sm">
                              Market analysis for {article.symbol} based on {sourceArticles.length} recent news articles and market developments.
                            </p>

                            {/* AI Analysis Section */}
                            <AIAnalysisSection 
                              symbol={article.symbol}
                              sentiment={article.ai_sentiment || 'Neutral'}
                              confidence={article.ai_confidence || 50}
                              isHistorical={article.ai_reasoning?.includes('Historical')}
                              sourceLinksCount={sourceArticles.length}
                            />

                            {/* Market Sentiment */}
                            <SentimentIndicator 
                              sentiment={article.ai_sentiment || 'Neutral'}
                              category="Technology Stock"
                            />

                            {/* Detailed Analysis */}
                            <DetailedAnalysis 
                              symbol={article.symbol}
                              sentiment={article.ai_sentiment || 'Neutral'}
                              confidence={article.ai_confidence || 50}
                              aiReasoning={article.ai_reasoning}
                            />
                          </div>
                          
                          {/* Right Side - Source Articles */}
                          <div className="lg:col-span-3">
                            <div className="flex items-center gap-2 mb-4">
                              <ExternalLink className="w-4 h-4 text-slate-400" />
                              <h4 className="text-white font-semibold">Source Articles ({sourceArticles.length})</h4>
                              <span className="text-slate-500 text-sm">Weighted by significance</span>
                            </div>
                            
                            <SourceArticles 
                              parsedSourceLinks={sourceArticles}
                              isHistorical={article.ai_reasoning?.includes('Historical')}
                              weightsLoading={false}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    /* Standalone Stock Card when no news */
                    <Card className="mb-8 bg-slate-800/50 border-slate-700 animate-fade-in">
                      {/* Compact Stock Header */}
                      <div className="bg-slate-700/30 border-b border-slate-600 px-6 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                              <CompanyLogo symbol={symbol} className="w-8 h-8" />
                              <Badge className="bg-emerald-600 text-white font-semibold">{symbol}</Badge>
                              <span className="text-white font-medium">{symbol} Corporation</span>
                            </div>
                            
                            {/* Technical Data Spread Out */}
                            {!stockData?.error && (
                              <div className="flex items-center gap-6 text-sm">
                                <div className="text-center">
                                  <div className="text-slate-400 text-xs">Price</div>
                                  <div className="text-white font-medium">
                                    ${stockData?.price ? stockData.price.toFixed(2) : '0.00'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-slate-400 text-xs">Change</div>
                                  <div className={`font-medium ${
                                    stockData?.change && stockData.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                                  }`}>
                                    {stockData?.change && stockData.change >= 0 ? '+' : ''}
                                    {stockData?.change ? stockData.change.toFixed(2) : '0.00'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-slate-400 text-xs">Change %</div>
                                  <div className={`font-medium ${
                                    stockData?.changePercent && stockData.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                                  }`}>
                                    {stockData?.changePercent ? (stockData.changePercent >= 0 ? '+' : '') + stockData.changePercent.toFixed(2) : '0.00'}%
                                  </div>
                                </div>
                                {stockData?.bidPrice && stockData?.askPrice && (
                                  <>
                                    <div className="text-center">
                                      <div className="text-slate-400 text-xs">Bid</div>
                                      <div className="text-red-400 font-medium">${stockData.bidPrice.toFixed(2)}</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-slate-400 text-xs">Ask</div>
                                      <div className="text-emerald-400 font-medium">${stockData.askPrice.toFixed(2)}</div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedChart({ symbol, stockName: `${symbol} Corporation` })}
                            className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover-scale"
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Chart
                          </Button>
                        </div>
                        
                        {stockData?.error && (
                          <div className="mt-3 text-red-400 text-center">
                            <div className="font-bold">No Data Available</div>
                            <div className="text-xs text-red-300">
                              {stockData.errorMessage || 'Unable to fetch price'}
                            </div>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                          <div className="text-lg font-medium text-slate-300">Loading analysis for {symbol}</div>
                          <div className="text-sm mt-2 text-slate-400">Fetching the latest market data...</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Chart Modal */}
      {selectedChart && (
        <ChartModal
          isOpen={!!selectedChart}
          onClose={() => setSelectedChart(null)}
          symbol={selectedChart.symbol}
          stockName={selectedChart.stockName}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Magnificent7;
