
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
import { getCompanyName, getMockPrice, getMockMarketCap } from "@/utils/stockUtils";

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

  // Fetch stock prices
  const { data: stockPrices } = useStockPrices([stockSymbol]);
  
  // Real-time streaming
  const { streamData } = useAlpacaStream({
    symbols: [stockSymbol],
    enabled: true
  });

  // Mock stock info - replace with real data source
  const stockInfo = {
    name: getCompanyName(stockSymbol),
    price: stockPrices?.find(s => s.symbol === stockSymbol)?.price || getMockPrice(stockSymbol),
    change: stockPrices?.find(s => s.symbol === stockSymbol)?.change || (Math.random() - 0.5) * 10,
    changePercent: stockPrices?.find(s => s.symbol === stockSymbol)?.changePercent || (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: getMockMarketCap(stockSymbol),
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
          {/* Header */}
          <StockHeader 
            symbol={stockSymbol}
            stockInfo={stockInfo}
            cameFromWatchlist={cameFromWatchlist}
          />

          {/* Tabs */}
          <div className="flex justify-end mb-6">
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

          {/* Main Chart and Side Cards Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart takes up 2/3 of the width */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Live Price Movement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <HistoricalPriceChart
                      symbol={stockSymbol}
                      timeframe="1Day"
                      limit={30}
                      height={384}
                      showMiniChart={false}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Cards take up 1/3 of the width */}
            <div className="space-y-4">
              <UpcomingEvents />
              <AIForecast stockPrice={stockInfo.price} />
            </div>
          </div>

          {/* Price Alert Section - Directly below the chart */}
          <div className="mb-8">
            <PriceAlerts 
              symbol={stockSymbol}
              currentPrice={stockInfo.price}
            />
          </div>

          {/* Tab Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
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
