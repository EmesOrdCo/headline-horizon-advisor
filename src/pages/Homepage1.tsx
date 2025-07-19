import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, Star, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";

// Layout 1: Hero-Driven with Featured Story
const Homepage1 = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36">
        {/* Hero Section with Featured Story */}
        <section className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <Badge className="bg-red-500 text-white mb-4">BREAKING</Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Federal Reserve Signals Rate Cut as Inflation Cools
                </h1>
                <p className="text-lg text-gray-600 dark:text-slate-300 mb-6 leading-relaxed">
                  AI analysis suggests a 78% probability of a 0.25% rate reduction in the next Fed meeting, 
                  based on recent inflation data and employment trends.
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <Badge variant="outline" className="text-emerald-600 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400">
                    High Confidence
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Updated 15 minutes ago
                  </span>
                </div>
                <Link to="/analysis/fed-rate-cut">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    Read Full Analysis <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-200 dark:border-slate-700 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">Market Impact Analysis</CardTitle>
                    <Badge className="bg-blue-500 text-white">LIVE</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-slate-400">S&P 500</span>
                      <div className="flex items-center gap-1 text-emerald-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-semibold">+2.1%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-slate-400">10-Year Treasury</span>
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="font-semibold">-0.8%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-slate-400">USD Index</span>
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="font-semibold">-1.2%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Top Stories Grid */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Top Stories</h2>
              <Link to="/news">
                <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">View All News</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs border-gray-200 text-gray-600 dark:border-slate-600 dark:text-slate-400">AAPL</Badge>
                      <span className="text-xs text-gray-500 dark:text-slate-400">2 hours ago</span>
                    </div>
                    <CardTitle className="text-lg leading-tight hover:text-emerald-600 transition-colors text-gray-900 dark:text-white">
                      Apple Reports Record Q4 Revenue Driven by iPhone 15 Sales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-3 line-clamp-2">
                      The tech giant exceeded analyst expectations with $89.5B in quarterly revenue...
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500 text-white text-xs">BULLISH</Badge>
                      <div className="text-emerald-600 text-sm font-semibold">92% confidence</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI Analysis Section */}
        <section className="bg-gray-50 dark:bg-slate-800 py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                AI-Powered Market Intelligence
              </h2>
              <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
                Real-time analysis powered by machine learning algorithms processing thousands of data points
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <CardTitle>Today's AI Predictions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">NVDA</span>
                      <Badge className="bg-emerald-500 text-white">BUY</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Strong momentum expected on AI chip demand surge
                    </p>
                  </div>
                  
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">TSLA</span>
                      <Badge variant="destructive">SELL</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Production concerns may impact Q4 delivery targets
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Market Sentiment Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Overall Market</span>
                        <span className="text-emerald-600 font-semibold">Bullish</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Tech Sector</span>
                        <span className="text-emerald-600 font-semibold">Strong Bullish</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Energy Sector</span>
                        <span className="text-red-600 font-semibold">Bearish</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Homepage1;
