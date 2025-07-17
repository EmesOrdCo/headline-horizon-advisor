
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, Zap, Target, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";

// Layout 3: Dashboard-Style with Widgets
const Homepage3 = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Market Intelligence Dashboard
            </h1>
            <p className="text-gray-600 dark:text-slate-300">
              Live market data, AI analysis, and breaking news at your fingertips
            </p>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Market Sentiment', value: 'Bullish', change: '+12%', icon: TrendingUp, color: 'emerald' },
              { label: 'AI Predictions', value: '23 Active', change: '87% Accuracy', icon: Brain, color: 'blue' },
              { label: 'Breaking News', value: '14 Stories', change: 'Last 1hr', icon: Zap, color: 'yellow' },
              { label: 'Watchlist Alerts', value: '3 Triggered', change: 'View All', icon: Target, color: 'purple' },
            ].map((stat) => (
              <Card key={stat.label} className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className={`text-sm text-${stat.color}-600`}>{stat.change}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Featured & Top Stories */}
            <div className="xl:col-span-2 space-y-6">
              {/* Featured Analysis */}
              <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500 text-white">FEATURED</Badge>
                      <Badge variant="outline">AI ANALYSIS</Badge>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      <Clock className="w-4 h-4 inline mr-1" />
                      30 min ago
                    </span>
                  </div>
                  <CardTitle className="text-xl sm:text-2xl leading-tight">
                    AI Predicts 15% Rally in Semiconductor Stocks Following Strong Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-slate-400 mb-4">
                    Our machine learning models analyzed over 50,000 data points from recent semiconductor 
                    earnings reports, supply chain indicators, and market sentiment to predict a significant 
                    rally in the sector.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700">
                      <div className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Confidence</div>
                      <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300">91%</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="text-sm text-blue-700 dark:text-blue-400 font-medium">Time Frame</div>
                      <div className="text-lg font-bold text-blue-800 dark:text-blue-300">2-4 weeks</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="text-sm text-purple-700 dark:text-purple-400 font-medium">Target Return</div>
                      <div className="text-lg font-bold text-purple-800 dark:text-purple-300">+15%</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-emerald-500 hover:bg-emerald-600">View Full Analysis</Button>
                    <Button variant="outline">Add to Watchlist</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Breaking News Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Breaking News</h2>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <Card key={item} className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">AMZN</Badge>
                              <span className="text-xs text-gray-500 dark:text-slate-400">15 min ago</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                              Amazon Web Services Announces Major AI Infrastructure Expansion
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                              $12B investment in AI data centers across North America...
                            </p>
                            <Badge className="bg-blue-500 text-white text-xs">BULLISH</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Widgets */}
            <div className="space-y-6">
              {/* Market Performance */}
              <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Market Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'S&P 500', value: '4,185.47', change: '+0.8%', trend: 'up' },
                    { name: 'NASDAQ', value: '12,888.28', change: '+1.2%', trend: 'up' },
                    { name: 'Russell 2000', value: '1,956.54', change: '-0.3%', trend: 'down' },
                    { name: 'VIX', value: '18.42', change: '-2.1%', trend: 'down' },
                  ].map((index) => (
                    <div key={index.name} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{index.name}</div>
                        <div className="text-sm text-gray-600 dark:text-slate-400">{index.value}</div>
                      </div>
                      <div className={`flex items-center gap-1 ${
                        index.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {index.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-medium">{index.change}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Stock Picks */}
              <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    AI Stock Picks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { symbol: 'NVDA', rating: 'Strong Buy', confidence: '94%' },
                    { symbol: 'MSFT', rating: 'Buy', confidence: '87%' },
                    { symbol: 'GOOGL', rating: 'Hold', confidence: '72%' },
                  ].map((pick) => (
                    <div key={pick.symbol} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900 dark:text-white">{pick.symbol}</span>
                        <Badge className={
                          pick.rating === 'Strong Buy' ? 'bg-emerald-500 text-white' :
                          pick.rating === 'Buy' ? 'bg-blue-500 text-white' :
                          'bg-gray-500 text-white'
                        }>
                          {pick.rating}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-slate-400">
                        Confidence: {pick.confidence}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="w-4 h-4 mr-2" />
                    Manage Watchlist
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Brain className="w-4 h-4 mr-2" />
                    View AI Predictions
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Zap className="w-4 h-4 mr-2" />
                    Set Price Alerts
                  </Button>
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

export default Homepage3;
