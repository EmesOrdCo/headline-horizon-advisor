
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, ArrowRight, Newspaper, BarChart3, Brain, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";

// Layout 5: Mixed Layout with Visual Emphasis
const Homepage5 = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36">
        {/* Hero Banner */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-blue-600/10 dark:from-emerald-400/5 dark:to-blue-400/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Smart Market Intelligence
              </h1>
              <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto">
                AI-powered insights, real-time analysis, and breaking news for intelligent investment decisions
              </p>
            </div>
            
            {/* Live Stats Banner */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">15.2K+</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">Articles Analyzed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">Prediction Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">2.4M+</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">Data Points</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">Real-time</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">Market Updates</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Featured Sections Grid */}
          <section className="py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Featured Story - Large Card */}
              <div className="lg:col-span-8">
                <Card className="h-full border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 relative">
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Badge className="bg-red-500 text-white mb-4 text-lg px-6 py-2">MARKET ALERT</Badge>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-2">Fed Rate Decision Imminent</h2>
                        <p className="text-lg opacity-90">AI models predict 75% chance of rate cut</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline">FEDERAL RESERVE</Badge>
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Breaking 20 minutes ago
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Federal Reserve Meeting: Market Anticipates Historic Rate Decision
                    </h3>
                    <p className="text-gray-600 dark:text-slate-400 mb-4">
                      With inflation showing signs of cooling and employment data mixed, our AI analysis 
                      suggests a 75% probability of a 0.25% rate reduction, which could trigger significant 
                      market movements across all sectors.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button className="bg-emerald-500 hover:bg-emerald-600">
                        Full Analysis <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button variant="outline">Market Impact</Button>
                      <Button variant="outline">Set Alert</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Panel - Market Data & Quick News */}
              <div className="lg:col-span-4 space-y-6">
                {/* Live Market Panel */}
                <Card className="border border-gray-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      Live Market Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { symbol: 'SPY', name: 'S&P 500', price: '418.47', change: '+1.2%', trend: 'up' },
                      { symbol: 'QQQ', name: 'NASDAQ', price: '288.28', change: '+2.1%', trend: 'up' },
                      { symbol: 'DIA', name: 'Dow Jones', price: '337.69', change: '+0.8%', trend: 'up' },
                    ].map((index) => (
                      <div key={index.symbol} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{index.symbol}</div>
                          <div className="text-sm text-gray-600 dark:text-slate-400">{index.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 dark:text-white">${index.price}</div>
                          <div className="text-emerald-600 font-medium">{index.change}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick News */}
                <Card className="border border-gray-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Newspaper className="w-5 h-5" />
                      Quick Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      'Tesla announces new Gigafactory location',
                      'Apple reports record Q4 iPhone sales',
                      'Microsoft Azure revenue up 31% YoY',
                      'Amazon Prime membership hits 200M'
                    ].map((headline, index) => (
                      <div key={index} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
                          {headline}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <section className="pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* AI Analysis Column */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Analysis</h2>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <Card key={item} className="border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-500 text-white text-xs">AI PREDICTION</Badge>
                          <Badge variant="outline" className="text-xs">NVDA</Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Semiconductor Rally Expected
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                          95% confidence in 15%+ sector growth over next month...
                        </p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-emerald-600 font-medium">95% Confidence</span>
                          <span className="text-gray-500 dark:text-slate-400">2h ago</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Market Movers Column */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Movers</h2>
                </div>
                
                <div className="space-y-4">
                  {[
                    { symbol: 'TSLA', change: '+8.4%', reason: 'Robotaxi announcement' },
                    { symbol: 'NVDA', change: '+6.2%', reason: 'AI chip demand surge' },
                    { symbol: 'AMD', change: '-4.1%', reason: 'Competition concerns' },
                  ].map((stock) => (
                    <Card key={stock.symbol} className="border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-lg text-gray-900 dark:text-white">{stock.symbol}</span>
                          <div className={`flex items-center gap-1 ${
                            stock.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {stock.change.startsWith('+') ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span className="font-bold">{stock.change}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{stock.reason}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Latest Headlines Column */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Headlines</h2>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <Card key={item} className="border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">GENERAL</Badge>
                          <span className="text-xs text-gray-500 dark:text-slate-400">1h ago</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                          Global Supply Chain Recovery Shows Strong Progress
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Manufacturing output reaches pre-pandemic levels...
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Homepage5;
