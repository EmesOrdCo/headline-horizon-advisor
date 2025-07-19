import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Bot, BarChart3, Bell, Info } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import RealTimePriceChart from "@/components/RealTimePriceChart";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useAlpacaStream } from "@/hooks/useAlpacaStream";
import { useSEO } from "@/hooks/useSEO";

interface PriceHistoryPoint {
  timestamp: string;
  price: number;
  symbol: string;
}

const StockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const stockSymbol = symbol?.toUpperCase() || '';
  
  useSEO({
    title: `${stockSymbol} Stock Analysis - AI-Powered Insights`,
    description: `Comprehensive AI-powered analysis of ${stockSymbol} stock with real-time data, news sentiment, and forecasts.`,
    canonical: `https://yourdomain.com/stock/${stockSymbol.toLowerCase()}`,
  });

  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [activeTab, setActiveTab] = useState("analysis");
  const [selectedAlertType, setSelectedAlertType] = useState<string>('');
  const [customAlertValue, setCustomAlertValue] = useState<string>('');

  // Fetch stock prices
  const { data: stockPrices } = useStockPrices([stockSymbol]);
  
  // Real-time streaming
  const { streamData, isConnected } = useAlpacaStream({
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

  // Store price history for charts
  useEffect(() => {
    const liveData = streamData[stockSymbol];
    if (liveData?.price && liveData?.timestamp) {
      setPriceHistory(prev => [
        ...prev.slice(-99), // Keep last 100 points
        {
          timestamp: liveData.timestamp,
          price: liveData.price,
          symbol: stockSymbol
        }
      ]);
    }
  }, [streamData, stockSymbol]);

  // Generate mock historical data for chart
  useEffect(() => {
    if (priceHistory.length === 0) {
      const basePrice = stockInfo.price;
      const mockHistory: PriceHistoryPoint[] = [];
      
      for (let i = 0; i < 50; i++) {
        const variance = (Math.random() - 0.5) * 0.04;
        const price = basePrice * (1 + variance);
        const timestamp = new Date();
        timestamp.setHours(9, 30 + (i * 7.8), 0, 0);
        
        mockHistory.push({
          timestamp: timestamp.toISOString(),
          price: Number(price.toFixed(2)),
          symbol: stockSymbol
        });
      }
      
      setPriceHistory(mockHistory);
    }
  }, [stockInfo.price, stockSymbol, priceHistory.length]);

  const handleAlertSelection = (alertType: string) => {
    setSelectedAlertType(alertType);
    setCustomAlertValue('');
  };

  const handleSetAlert = () => {
    if (selectedAlertType === 'Custom' && customAlertValue) {
      console.log(`Setting custom alert for ${stockSymbol} at $${customAlertValue}`);
    } else if (selectedAlertType && selectedAlertType !== 'Custom') {
      const percentage = parseFloat(selectedAlertType.replace('%', ''));
      const targetPrice = stockInfo.price * (1 + percentage / 100);
      console.log(`Setting ${selectedAlertType} alert for ${stockSymbol} at $${targetPrice.toFixed(2)}`);
    }
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link to="/dashboard">
                <Button variant="ghost" className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            {/* Stock Header with Tabs */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{stockSymbol.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{stockSymbol}</h1>
                    <Badge className="bg-emerald-600 text-white">{stockInfo.name}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-white">${stockInfo.price.toFixed(2)}</span>
                    <div className={`flex items-center gap-1 ${stockInfo.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stockInfo.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>{stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)} ({stockInfo.changePercent.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs moved to the right */}
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
                    <RealTimePriceChart
                      data={priceHistory}
                      symbol={stockSymbol}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Cards take up 1/3 of the width */}
            <div className="space-y-4">
              {/* Key Upcoming Events */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-emerald-400 font-semibold text-sm">Earnings Report</div>
                      <div className="text-slate-400 text-xs">Q2 2025</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-sm">27</div>
                      <div className="text-slate-400 text-xs">AUG</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-blue-400 font-semibold text-sm">Dividend Payment</div>
                      <div className="text-slate-400 text-xs">$0.28 per share</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-sm">15</div>
                      <div className="text-slate-400 text-xs">SEP</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-purple-400 font-semibold text-sm">Analyst Day</div>
                      <div className="text-slate-400 text-xs">Investor meeting</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-sm">03</div>
                      <div className="text-slate-400 text-xs">OCT</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Forecast */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <Bot className="w-4 h-4" />
                    AI Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center p-3 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
                    <div className="text-emerald-400 font-bold text-xl">BULLISH</div>
                    <div className="text-slate-300 text-xs mt-1">Next 30 days</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Confidence Level</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                          ))}
                          <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                        </div>
                        <span className="text-white font-semibold text-sm">82%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Price Target</span>
                      <span className="text-emerald-400 font-semibold text-sm">${(stockInfo.price * 1.12).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Upside Potential</span>
                      <span className="text-emerald-400 font-semibold text-sm">+12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Alert Section */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <Bell className="w-4 h-4" />
                    Set Price Alert
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
                    <Info className="w-3 h-3" />
                    <span>Get notified when price hits target</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 mb-3">
                    {['-10%', '-5%', '+5%', '+10%'].map((option) => (
                      <Button
                        key={option}
                        variant={selectedAlertType === option ? "default" : "outline"}
                        className={`px-2 py-1 text-xs rounded ${
                          selectedAlertType === option 
                            ? "bg-emerald-600 text-white border-emerald-600" 
                            : "bg-transparent border-slate-600 text-slate-300 hover:border-emerald-600 hover:text-emerald-400"
                        }`}
                        onClick={() => handleAlertSelection(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant={selectedAlertType === 'Custom' ? "default" : "outline"}
                    className={`w-full text-xs mb-2 ${
                      selectedAlertType === 'Custom'
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-transparent border-slate-600 text-slate-300 hover:border-emerald-600 hover:text-emerald-400"
                    }`}
                    onClick={() => handleAlertSelection('Custom')}
                  >
                    Custom Price
                  </Button>

                  {selectedAlertType === 'Custom' && (
                    <div className="space-y-1">
                      <Label htmlFor="custom-alert" className="text-slate-300 text-xs">
                        Target Price
                      </Label>
                      <Input
                        id="custom-alert"
                        type="number"
                        placeholder="Enter price"
                        value={customAlertValue}
                        onChange={(e) => setCustomAlertValue(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-sm h-8"
                      />
                    </div>
                  )}

                  {selectedAlertType && (
                    <Button 
                      onClick={handleSetAlert}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                    >
                      Set Alert
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
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

// AI Analysis Tab Component
const AIAnalysisTab = ({ symbol, stockInfo }: { symbol: string; stockInfo: any }) => {
  return (
    <div className="space-y-6">
      {/* TLDR Section - Only on AI Analysis Tab */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Info className="w-5 h-5" />
            TLDR - Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
              <h4 className="text-emerald-400 font-semibold mb-2">📈 Sentiment</h4>
              <p className="text-slate-300 text-sm">
                Strong bullish sentiment with 75% positive news coverage. Technical indicators support upward momentum.
              </p>
            </div>
            <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-2">🎯 Target</h4>
              <p className="text-slate-300 text-sm">
                AI forecast suggests 12% upside potential with 82% confidence. Price target set at ${(stockInfo.price * 1.12).toFixed(2)}.
              </p>
            </div>
            <div className="p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg">
              <h4 className="text-purple-400 font-semibold mb-2">⚠️ Risk</h4>
              <p className="text-slate-300 text-sm">
                Moderate risk with diversified revenue. Main concern is market volatility, but fundamentals remain solid.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Analysis */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">AI Qualitative Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h4 className="text-emerald-400 font-semibold mb-2">Market Sentiment</h4>
              <p className="text-slate-300 text-sm">
                Based on recent market movements and news analysis, {symbol} shows strong bullish sentiment. 
                Technical indicators suggest continued upward momentum with solid support levels.
              </p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-2">Growth Outlook</h4>
              <p className="text-slate-300 text-sm">
                The company demonstrates robust growth potential in key sectors. Recent product launches 
                and strategic partnerships position it well for sustained expansion.
              </p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h4 className="text-purple-400 font-semibold mb-2">Risk Assessment</h4>
              <p className="text-slate-300 text-sm">
                Moderate risk profile with well-diversified revenue streams. Market volatility remains 
                the primary concern, though fundamentals remain strong.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* News Source Analysis */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">News Source Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-slate-300">Reuters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white text-xs">Bullish</Badge>
                  <span className="text-slate-400 text-sm">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300">Bloomberg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-600 text-white text-xs">Neutral</Badge>
                  <span className="text-slate-400 text-sm">72%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-slate-300">MarketWatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white text-xs">Bullish</Badge>
                  <span className="text-slate-400 text-sm">78%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-slate-300">CNBC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-600 text-white text-xs">Bearish</Badge>
                  <span className="text-slate-400 text-sm">65%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
              <h4 className="text-emerald-400 font-semibold mb-2">Overall Sentiment</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-emerald-400 font-semibold">75% Bullish</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// All Data Tab Component - Simplified without price alert
const AllDataTab = ({ 
  symbol, 
  stockInfo
}: { 
  symbol: string; 
  stockInfo: any;
}) => {
  return (
    <div className="space-y-6">
      {/* Detailed Financial Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valuation Metrics */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Valuation Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Price-to-Earnings", value: (Math.random() * 30 + 10).toFixed(2) },
              { label: "Price-to-Book", value: (Math.random() * 5 + 1).toFixed(2) },
              { label: "Price-to-Sales", value: (Math.random() * 10 + 2).toFixed(2) },
              { label: "EV/EBITDA", value: (Math.random() * 20 + 8).toFixed(2) },
              { label: "PEG Ratio", value: (Math.random() * 3 + 0.5).toFixed(2) },
            ].map((metric, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
                <span className="text-slate-400">{metric.label}</span>
                <span className="text-white font-semibold">{metric.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Financial Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Revenue Growth (YoY)", value: `${(Math.random() * 20 + 5).toFixed(1)}%`, positive: Math.random() > 0.3 },
              { label: "Gross Margin", value: `${(Math.random() * 40 + 20).toFixed(1)}%`, positive: true },
              { label: "Operating Margin", value: `${(Math.random() * 25 + 10).toFixed(1)}%`, positive: Math.random() > 0.2 },
              { label: "Net Margin", value: `${(Math.random() * 20 + 5).toFixed(1)}%`, positive: Math.random() > 0.2 },
              { label: "ROE", value: `${(Math.random() * 25 + 8).toFixed(1)}%`, positive: true },
            ].map((metric, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
                <span className="text-slate-400">{metric.label}</span>
                <span className={`font-semibold ${metric.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metric.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Technical Analysis */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Technical Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="text-slate-400 font-medium">Support Levels</h4>
              <div className="space-y-1">
                <div className="text-emerald-400">${(stockInfo.price * 0.95).toFixed(2)}</div>
                <div className="text-emerald-400">${(stockInfo.price * 0.90).toFixed(2)}</div>
                <div className="text-emerald-400">${(stockInfo.price * 0.85).toFixed(2)}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-400 font-medium">Resistance Levels</h4>
              <div className="space-y-1">
                <div className="text-red-400">${(stockInfo.price * 1.05).toFixed(2)}</div>
                <div className="text-red-400">${(stockInfo.price * 1.10).toFixed(2)}</div>
                <div className="text-red-400">${(stockInfo.price * 1.15).toFixed(2)}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-400 font-medium">Indicators</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">RSI (14)</span>
                  <span className="text-white">{(Math.random() * 40 + 30).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MACD</span>
                  <span className="text-emerald-400">Bullish</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MA (50)</span>
                  <span className="text-white">${(stockInfo.price * 0.98).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics Grid */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Market Cap</div>
              <div className="text-white font-bold text-lg">{stockInfo.marketCap}</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">P/E Ratio</div>
              <div className="text-white font-bold text-lg">{(Math.random() * 30 + 10).toFixed(2)}</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Volume</div>
              <div className="text-white font-bold text-lg">{(stockInfo.volume / 1000000).toFixed(1)}M</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">52W High</div>
              <div className="text-white font-bold text-lg">${(stockInfo.price * 1.25).toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Utility functions
function getCompanyName(symbol: string): string {
  const companies: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'SPY': 'SPDR S&P 500 ETF',
    'QQQ': 'Invesco QQQ Trust',
    'DIA': 'SPDR Dow Jones Industrial Average ETF'
  };
  return companies[symbol] || `${symbol} Corp.`;
}

function getMockPrice(symbol: string): number {
  const prices: Record<string, number> = {
    'AAPL': 225.75,
    'MSFT': 441.85,
    'GOOGL': 178.92,
    'AMZN': 215.38,
    'NVDA': 144.75,
    'TSLA': 359.22,
    'META': 598.45,
    'SPY': 592.18,
    'QQQ': 512.33,
    'DIA': 445.67
  };
  return prices[symbol] || Math.random() * 200 + 50;
}

function getMockMarketCap(symbol: string): string {
  const caps: Record<string, string> = {
    'AAPL': '3.45T',
    'MSFT': '3.28T',
    'GOOGL': '2.15T',
    'AMZN': '1.85T',
    'NVDA': '3.58T',
    'TSLA': '1.12T',
    'META': '1.52T',
    'SPY': 'N/A',
    'QQQ': 'N/A',
    'DIA': 'N/A'
  };
  return caps[symbol] || `${(Math.random() * 500 + 50).toFixed(0)}B`;
}

export default StockDetail;
