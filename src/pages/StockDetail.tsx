
import { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";
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
import { useStockPrices } from "@/hooks/useStockPrices";
import { useAlpacaStream } from "@/hooks/useAlpacaStream";
import { useSEO } from "@/hooks/useSEO";
import { getCompanyName } from "@/utils/stockUtils";

const StockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const location = useLocation();
  const stockSymbol = symbol?.toUpperCase() || '';
  
  // Check if user came from watchlist
  const cameFromWatchlist = location.state?.from === 'watchlist' || document.referrer.includes('/watchlist');
  
  useSEO({
    title: `${stockSymbol} Stock Analysis - AI-Powered Insights`,
    description: `Comprehensive AI-powered analysis of ${stockSymbol} stock with real-time data, news sentiment, and forecasts.`,
    canonical: `https://yourdomain.com/stock/${stockSymbol.toLowerCase()}`,
  });

  const [activeTab, setActiveTab] = useState("analysis");

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
        volume: Math.floor(Math.random() * 10000000) + 1000000, // Mock volume for now
        marketCap: "$2.8T", // Mock market cap for now
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
      volume: 0,
      marketCap: "N/A",
      isLoading: stockPricesLoading,
    };
  }, [stockSymbol, stockPrices, stockPricesLoading]);

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      {/* Market Ticker - reduced top padding */}
      <div className="pt-14">
        <MarketTicker />
      </div>
      
      {/* Main content - reduced top padding */}
      <div className="pt-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header - reduced bottom margin */}
          <StockHeader 
            symbol={stockSymbol}
            stockInfo={stockInfo}
            cameFromWatchlist={cameFromWatchlist}
          />

          {/* Tabs - reduced bottom margin */}
          <div className="flex justify-end mb-4">
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

          {/* Main Content Grid - reduced bottom margin */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
            {/* Chart Section - Takes up 3/4 width on xl screens */}
            <div className="xl:col-span-3 space-y-6">
              {/* Price Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-xl">
                    <BarChart3 className="w-5 h-5" />
                    Live Price Movement
                  </CardTitle>
                  <div className="text-sm text-slate-400">
                    {stockSymbol} Close Performance - 30 data points (until market close)
                  </div>
                </CardHeader>
                <CardContent>
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

            {/* Side Panel - Takes up 1/4 width on xl screens */}
            <div className="xl:col-span-1 space-y-6">
              <UpcomingEvents />
              <AIForecast stockPrice={stockInfo.price} />
            </div>
          </div>

          {/* Tab Content - reduced bottom margin */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsContent value="analysis" className="space-y-6">
              <AIAnalysisTab symbol={stockSymbol} stockInfo={stockInfo} />
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <AllDataTab 
                symbol={stockSymbol} 
                stockInfo={stockInfo}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StockDetail;
