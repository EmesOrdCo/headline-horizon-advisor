
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, Eye, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";

// Layout 2: News-First with Sidebar Analytics
const Homepage2 = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="py-8 border-b border-gray-200 dark:border-slate-700">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Market Intelligence Hub
            </h1>
            <p className="text-lg text-gray-600 dark:text-slate-300">
              Real-time news, AI analysis, and market insights in one place
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-8">
            {/* Main Content - 3 columns */}
            <div className="lg:col-span-3 space-y-8">
              {/* Featured Story */}
              <Card className="border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-6">
                    <Badge className="bg-red-500 text-white mb-3">BREAKING</Badge>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                      Tesla Stock Surges 12% on Robotaxi Breakthrough
                    </h2>
                    <p className="text-gray-600 dark:text-slate-400 mb-4">
                      Elon Musk announces major advancement in autonomous driving technology, 
                      with commercial robotaxi service launching in select cities by Q2 2024.
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className="bg-emerald-500 text-white">BULLISH</Badge>
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        <Clock className="w-4 h-4 inline mr-1" />
                        45 minutes ago
                      </span>
                    </div>
                    <Button className="w-full sm:w-auto">
                      Read Full Analysis <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 p-6 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-2">+12.4%</div>
                      <div className="text-sm text-gray-600 dark:text-slate-400">TSLA Stock Price</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">$248.50</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Top Stories Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Stories</h2>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((item) => (
                    <Card key={item} className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-slate-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">MSFT</Badge>
                          <span className="text-xs text-gray-500 dark:text-slate-400">1h ago</span>
                        </div>
                        <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
                          Microsoft Azure Revenue Grows 29% Year-over-Year
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                          Cloud computing division continues strong performance...
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-blue-500 text-white text-xs">BULLISH</Badge>
                          <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                            <Eye className="w-3 h-3" />
                            <span className="text-xs">2.1k views</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Market Movers */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Today's Biggest Movers</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { symbol: 'TSLA', change: '+12.4%', price: '$248.50', trend: 'up' },
                    { symbol: 'NVDA', change: '+8.2%', price: '$432.15', trend: 'up' },
                    { symbol: 'AMD', change: '-5.1%', price: '$98.32', trend: 'down' },
                    { symbol: 'INTC', change: '-3.8%', price: '$42.87', trend: 'down' },
                  ].map((stock) => (
                    <Card key={stock.symbol} className="border border-gray-200 dark:border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900 dark:text-white">{stock.symbol}</span>
                          {stock.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">{stock.price}</div>
                        <div className={`text-sm font-medium ${
                          stock.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {stock.change}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Live Market Data */}
              <Card className="border border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    Live Markets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'S&P 500', value: '4,185.47', change: '+0.8%' },
                    { name: 'NASDAQ', value: '12,888.28', change: '+1.2%' },
                    { name: 'DOW', value: '33,745.69', change: '+0.3%' },
                  ].map((index) => (
                    <div key={index.name} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-slate-400">{index.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{index.value}</div>
                        <div className="text-xs text-emerald-600">{index.change}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="border border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Market Volatility Alert
                    </div>
                    <div className="text-xs text-gray-600 dark:text-slate-400">
                      Increased volatility expected in tech sector next week
                    </div>
                  </div>
                  
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Earnings Season Update
                    </div>
                    <div className="text-xs text-gray-600 dark:text-slate-400">
                      78% of companies beating estimates so far
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Headlines */}
              <Card className="border border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Recent Headlines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    'Fed officials signal dovish stance on rates',
                    'Apple unveils new AI features for iOS',
                    'Oil prices stabilize after OPEC meeting',
                    'Crypto market sees renewed institutional interest'
                  ].map((headline, index) => (
                    <div key={index} className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors border-b border-gray-100 dark:border-slate-700 pb-2 last:border-b-0">
                      {headline}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Homepage2;
