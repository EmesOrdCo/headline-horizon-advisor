import { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, ArrowLeft, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardNav from "@/components/DashboardNav";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import HistoricalPriceChart from "@/components/HistoricalPriceChart";
import StockHeader from "@/components/StockDetail/StockHeader";
import UpcomingEvents from "@/components/StockDetail/UpcomingEvents";
import AIForecast from "@/components/StockDetail/AIForecast";
import PriceAlerts from "@/components/StockDetail/PriceAlerts";
import AIAnalysisTab from "@/components/StockDetail/AIAnalysisTab";
import AllDataTab from "@/components/StockDetail/AllDataTab";
import { useFinnhubMetrics } from "@/hooks/useFinnhubMetrics";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useAlpacaStream } from "@/hooks/useAlpacaStream";
import { useSEO } from "@/hooks/useSEO";
import { getCompanyName } from "@/utils/stockUtils";
import TradingViewModal from "@/components/TradingViewModal";

const StockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const stockSymbol = symbol?.toUpperCase() || '';
  
  // Check if user came from watchlist
  const cameFromWatchlist = location.state?.from === 'watchlist' || document.referrer.includes('/watchlist');
  
  const handleBackClick = () => {
    if (cameFromWatchlist) {
      navigate('/watchlist');
    } else {
      navigate(-1); // Go back to previous page
    }
  };
  
  useSEO({
    title: `${stockSymbol} Stock Analysis - AI-Powered Insights`,
    description: `Comprehensive AI-powered analysis of ${stockSymbol} stock with real-time data, news sentiment, and forecasts.`,
    canonical: `https://yourdomain.com/stock/${stockSymbol.toLowerCase()}`,
  });

  const [activeTab, setActiveTab] = useState("analysis");
  const [isTradingViewOpen, setIsTradingViewOpen] = useState(false);

  // Debug: Load Finnhub data immediately to see what's happening
  const { metrics: debugFinnhubMetrics, loading: debugFinnhubLoading, error: debugFinnhubError } = useFinnhubMetrics(stockSymbol);
  console.log('StockDetail: Debug Finnhub metrics:', { debugFinnhubMetrics, debugFinnhubLoading, debugFinnhubError });

  // Fetch stock prices with real-time data
  const { data: stockPrices, isLoading: stockPricesLoading, refetch: refetchStockPrices } = useStockPrices([stockSymbol]);
  
  // Real-time streaming for live updates
  const { streamData } = useAlpacaStream({
    symbols: [stockSymbol],
    enabled: true
  });

  // Refetch stock prices every 30 seconds to ensure fresh data
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStockPrices();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetchStockPrices]);

  // Get real stock info from API data with proper fallbacks
  const stockInfo = useMemo(() => {
    // First try to get data from the API
    const stockData = stockPrices?.find(s => s.symbol === stockSymbol);
    
    // Use real API data if available, otherwise use loading state or fallback
    if (stockData && !stockData.error && stockData.price > 0) {
      return {
        name: getCompanyName(stockSymbol),
        price: stockData.price,
        change: stockData.change,
        changePercent: stockData.changePercent,
        askPrice: stockData.askPrice,
        bidPrice: stockData.bidPrice,
        previousClose: stockData.previousClose,
        volume: "TBC", // Volume not available from current Alpaca endpoint
        marketCap: "TBC", // Market cap not available from Alpaca
        isLoading: false,
      };
    }

    // Return loading state or fallback data
    return {
      name: getCompanyName(stockSymbol),
      price: 0,
      change: 0,
      changePercent: 0,
      askPrice: 0,
      bidPrice: 0,
      previousClose: 0,
      volume: "TBC",
      marketCap: "TBC",
      isLoading: stockPricesLoading,
    };
  }, [stockSymbol, stockPrices, stockPricesLoading]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Fixed Navigation */}
      <DashboardNav />
      
      {/* Market Ticker - Positioned directly below nav with no gap */}
      <div className="pt-16">
        <MarketTicker />
      </div>
      
      {/* Main Content - Clean header layout like second image */}
      <div className="bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Clean Stock Header Section - No cards or borders */}
          <div className="py-6 border-b border-slate-700/50">
            {/* Back Button - Above everything */}
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              {/* Left side - Stock info */}
              <div className="flex items-center space-x-4">
                {/* Stock Icon */}
                <div className="w-16 h-16 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{stockSymbol.slice(0, 2)}</span>
                </div>
                
                {/* Stock Details */}
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h1 className="text-2xl font-bold text-white">{stockSymbol}</h1>
                    <span className="bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                      {stockInfo.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-white">
                      ${stockInfo.price.toFixed(2)}
                    </span>
                    <span className={`flex items-center text-lg font-medium ${
                      stockInfo.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)}
                      ({stockInfo.changePercent >= 0 ? '+' : ''}{stockInfo.changePercent.toFixed(2)}%)
                    </span>
                    <span className="text-slate-400 text-sm">At Close</span>
                  </div>
                </div>
              </div>

              {/* Right side - Trading View Button and Tabs */}
              <div className="flex items-center space-x-4">
                {/* Trading View Button */}
                <Button 
                  variant="outline"
                  className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-200"
                  onClick={() => setIsTradingViewOpen(true)}
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Trading View
                </Button>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-slate-800/50 border-slate-700">
                    <TabsTrigger value="analysis" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                      AI Qualitative Analysis
                    </TabsTrigger>
                    <TabsTrigger value="data" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                      All Data
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Main Content Grid - Better spacing */}
          <div className="py-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              
              {/* Left Column - Chart and Price Alerts */}
              <div className="xl:col-span-3 space-y-6">
                
                {/* Price Chart Card */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <BarChart3 className="w-5 h-5" />
                      Live Price Movement
                    </CardTitle>
                    <div className="text-sm text-slate-400">
                      {stockSymbol} Close Performance - 30 data points (until market close)
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-80">
                      <HistoricalPriceChart
                        symbol={stockSymbol}
                        timeframe="1Day"
                        limit={30}
                        height={320}
                        showMiniChart={false}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Price Alert Section */}
                <PriceAlerts 
                  symbol={stockSymbol}
                  currentPrice={stockInfo.price}
                />
              </div>

              {/* Right Column - Side Panel */}
              <div className="xl:col-span-1 space-y-6">
                <UpcomingEvents />
                <AIForecast stockPrice={stockInfo.price} />
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="analysis" className="mt-0">
                <AIAnalysisTab symbol={stockSymbol} stockInfo={stockInfo} />
              </TabsContent>

              <TabsContent value="data" className="mt-0">
                <AllDataTab 
                  symbol={stockSymbol} 
                  stockInfo={stockInfo}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />

      {/* Trading View Modal */}
      <TradingViewModal 
        isOpen={isTradingViewOpen}
        onClose={() => setIsTradingViewOpen(false)}
        symbol={stockSymbol}
      />
    </div>
  );
};

export default StockDetail;
