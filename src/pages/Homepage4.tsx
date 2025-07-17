
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, ArrowRight, Play, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";

// Layout 4: Category-Based with Clean Sections
const Homepage4 = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36">
        {/* Header Section */}
        <section className="py-12 px-4 sm:px-6 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Financial Intelligence Platform
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Get real-time market insights, AI-powered analysis, and breaking financial news 
              to make informed investment decisions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3">
                Start Free Trial
              </Button>
              <Button variant="outline" className="px-8 py-3">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Navigation */}
        <section className="py-8 px-4 sm:px-6 bg-slate-50 dark:bg-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              {[
                'Breaking News', 'AI Analysis', 'Market Movers', 'Earnings', 
                'Tech Stocks', 'Crypto', 'Commodities', 'Forex'
              ].map((category) => (
                <Button 
                  key={category} 
                  variant="outline" 
                  className="hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:hover:bg-emerald-900/20"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Breaking News Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Breaking News</h2>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <Link to="/news">
                <Button variant="outline">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Main Story */}
              <Card className="lg:row-span-2 border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-red-500 to-orange-500 relative">
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Badge className="bg-red-500 text-white text-lg px-4 py-2">BREAKING</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3">FOMC</Badge>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                    Federal Reserve Cuts Interest Rates by 0.25% in Surprise Decision
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 mb-4">
                    In an unexpected move, the Federal Reserve announced a quarter-point rate cut, 
                    citing concerns over global economic headwinds and cooling inflation data.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      <Clock className="w-4 h-4 inline mr-1" />
                      15 minutes ago
                    </span>
                    <Button size="sm">Read More</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Stories */}
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <Card key={item} className="border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">AAPL</Badge>
                            <span className="text-xs text-gray-500 dark:text-slate-400">2h ago</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 leading-tight">
                            Apple Announces $10B Share Buyback Program
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-slate-400">
                            Tech giant returns cash to shareholders amid strong iPhone sales...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* AI Analysis Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">AI Market Analysis</h2>
              <Button variant="outline">
                View All Predictions <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-500 text-white">AI PREDICTION</Badge>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">+8.5%</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">Expected Return</div>
                      </div>
                    </div>
                    <CardTitle className="text-lg">
                      Semiconductor Sector Rally Predicted
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                      AI models indicate strong momentum in semiconductor stocks based on supply chain recovery...
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Confidence Level</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map((dot) => (
                          <div key={dot} className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        ))}
                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600"></div>
                      </div>
                    </div>
                    <Button className="w-full" size="sm">View Analysis</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Market Movers Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Today's Market Movers</h2>
              <Button variant="outline">
                See All Movers <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { symbol: 'NVDA', name: 'NVIDIA Corp', price: '$432.15', change: '+12.4%', trend: 'up' },
                { symbol: 'TSLA', name: 'Tesla Inc', price: '$248.50', change: '+8.2%', trend: 'up' },
                { symbol: 'META', name: 'Meta Platforms', price: '$318.75', change: '-5.1%', trend: 'down' },
                { symbol: 'NFLX', name: 'Netflix Inc', price: '$422.88', change: '-3.8%', trend: 'down' },
              ].map((stock) => (
                <Card key={stock.symbol} className="border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{stock.symbol}</span>
                      {stock.trend === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-400 mb-2">{stock.name}</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">{stock.price}</div>
                    <div className={`text-sm font-semibold ${
                      stock.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stock.change}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Recent Headlines Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recent Headlines</h2>
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                View Archive
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">GENERAL</Badge>
                          <span className="text-xs text-gray-500 dark:text-slate-400">3h ago</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                          Global Supply Chain Disruptions Continue to Impact Tech Sector
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Manufacturing delays and shipping bottlenecks persist across major technology companies...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Homepage4;
