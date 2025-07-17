
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight, BarChart3, Activity, Zap, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import RSSHeadlines from "@/components/RSSHeadlines";
import { useNews } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useSEO } from "@/hooks/useSEO";
import { useConsistentTopStories } from "@/hooks/useConsistentTopStories";

const DashboardVariant4 = () => {
  useSEO({
    title: "Live Market News Dashboard - Variant 4",
    description: "Category-based sections with organized market intelligence and AI insights.",
    canonical: "https://yourdomain.com/dashboard-variant-4"
  });

  const { data: newsData, isLoading } = useNews();
  const { data: stockPrices } = useStockPrices();

  const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
  const MAJOR_INDEX_FUNDS = ['SPY', 'QQQ', 'DIA'];

  const {
    topMagnificent7Story,
    topIndexFundStory,
    magnificent7HasRecentNews,
    indexFundsHasRecentNews
  } = useConsistentTopStories({
    newsData,
    magnificent7Symbols: MAGNIFICENT_7,
    indexFundSymbols: MAJOR_INDEX_FUNDS
  });

  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(stock => stock.symbol === symbol);
  };

  const generateCompositeHeadline = (item: any): string => {
    const symbol = item.symbol;
    const sentiment = item.ai_sentiment?.toLowerCase() || 'neutral';
    
    let summary = '';
    if (sentiment === 'bullish') {
      summary = 'Positive developments support growth';
    } else if (sentiment === 'bearish') {
      summary = 'Market challenges create headwinds';
    } else {
      summary = 'Mixed signals in current market';
    }

    return `${symbol}: ${summary}`;
  };

  const categories = [
    {
      title: "AI Market Analysis",
      icon: Zap,
      color: "blue",
      description: "Machine learning insights and predictions"
    },
    {
      title: "Top Stories",
      icon: Star,
      color: "emerald",
      description: "Breaking news and featured analysis"
    },
    {
      title: "Market Movers", 
      icon: TrendingUp,
      color: "purple",
      description: "Stocks with significant price changes"
    },
    {
      title: "Recent Headlines",
      icon: Clock,
      color: "orange",
      description: "Latest market news and updates"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header with Live Status */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-white">Market Intelligence Center</h1>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <Badge className="bg-emerald-500 text-white">LIVE</Badge>
            </div>
          </div>
          <p className="text-slate-400 text-lg">
            Real-time market analysis powered by artificial intelligence
          </p>
        </div>

        {/* Category Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            const colorClasses = {
              blue: "from-blue-900/20 to-blue-800/20 border-blue-500/30 text-blue-400",
              emerald: "from-emerald-900/20 to-emerald-800/20 border-emerald-500/30 text-emerald-400",
              purple: "from-purple-900/20 to-purple-800/20 border-purple-500/30 text-purple-400",
              orange: "from-orange-900/20 to-orange-800/20 border-orange-500/30 text-orange-400"
            }[category.color];

            return (
              <Card key={index} className={`bg-gradient-to-br ${colorClasses} hover:scale-105 transition-transform cursor-pointer`}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-2">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-400 text-sm">{category.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Sections */}
        <div className="space-y-16">
          {/* AI Market Analysis Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">AI Market Analysis</h2>
              <Badge className="bg-blue-500/20 text-blue-400">Powered by Machine Learning</Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Magnificent 7 Analysis */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Magnificent 7 Analysis</CardTitle>
                    {magnificent7HasRecentNews ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400">Fresh Analysis</Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-400">Latest Available</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {topMagnificent7Story ? (
                    <div>
                      <h3 className="font-bold text-white mb-3">
                        {generateCompositeHeadline(topMagnificent7Story)}
                      </h3>
                      <p className="text-slate-300 mb-4 line-clamp-3">
                        {topMagnificent7Story.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`${
                            topMagnificent7Story.ai_sentiment === 'Bullish' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {topMagnificent7Story.ai_sentiment}
                          </Badge>
                          <span className="text-slate-400 text-sm">
                            {topMagnificent7Story.ai_confidence}% confidence
                          </span>
                        </div>
                        <Link to="/magnificent-7">
                          <Button variant="outline" size="sm" className="text-blue-400 border-blue-400">
                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">Loading AI analysis...</p>
                  )}
                </CardContent>
              </Card>

              {/* Index Funds Analysis */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Index Fund Insights</CardTitle>
                    {indexFundsHasRecentNews ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400">Fresh Analysis</Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-400">Latest Available</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {topIndexFundStory ? (
                    <div>
                      <h3 className="font-bold text-white mb-3">
                        {generateCompositeHeadline(topIndexFundStory)}
                      </h3>
                      <p className="text-slate-300 mb-4 line-clamp-3">
                        {topIndexFundStory.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`${
                            topIndexFundStory.ai_sentiment === 'Bullish' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {topIndexFundStory.ai_sentiment}
                          </Badge>
                          <span className="text-slate-400 text-sm">
                            {topIndexFundStory.ai_confidence}% confidence
                          </span>
                        </div>
                        <Link to="/index-funds">
                          <Button variant="outline" size="sm" className="text-purple-400 border-purple-400">
                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">Loading AI analysis...</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Top Stories Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Top Stories</h2>
              <Badge className="bg-emerald-500/20 text-emerald-400">Featured</Badge>
            </div>
            
            <div className="space-y-6">
              {topMagnificent7Story && (
                <NewsCard 
                  symbol={topMagnificent7Story.symbol}
                  title={generateCompositeHeadline(topMagnificent7Story)}
                  description={topMagnificent7Story.description}
                  confidence={topMagnificent7Story.ai_confidence}
                  sentiment={topMagnificent7Story.ai_sentiment}
                  category={topMagnificent7Story.category}
                  isHistorical={topMagnificent7Story.ai_reasoning?.includes('Historical')}
                  sourceLinks={topMagnificent7Story.source_links || '[]'}
                  stockPrice={getStockPrice(topMagnificent7Story.symbol)}
                />
              )}
              
              {topIndexFundStory && (
                <NewsCard 
                  symbol={topIndexFundStory.symbol}
                  title={generateCompositeHeadline(topIndexFundStory)}
                  description={topIndexFundStory.description}
                  confidence={topIndexFundStory.ai_confidence}
                  sentiment={topIndexFundStory.ai_sentiment}
                  category={topIndexFundStory.category}
                  isHistorical={topIndexFundStory.ai_reasoning?.includes('Historical')}
                  sourceLinks={topIndexFundStory.source_links || '[]'}
                  stockPrice={getStockPrice(topIndexFundStory.symbol)}
                />
              )}
            </div>
          </section>

          {/* Market Movers Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">Market Movers</h2>
                <Badge className="bg-purple-500/20 text-purple-400">Live Data</Badge>
              </div>
              <Link to="/biggest-movers">
                <Button variant="outline" className="text-purple-400 border-purple-400">
                  View All Movers <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MAGNIFICENT_7.slice(0, 6).map((symbol) => {
                const price = getStockPrice(symbol);
                const isPositive = (price?.changePercent || 0) >= 0;
                
                return (
                  <Card key={symbol} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-white">{symbol}</h3>
                        <div className={`flex items-center gap-1 ${
                          isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {isPositive ? 
                            <TrendingUp className="w-4 h-4" /> : 
                            <TrendingDown className="w-4 h-4" />
                          }
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        ${price?.price.toFixed(2) || '--'}
                      </div>
                      <div className={`text-sm font-medium ${
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {isPositive ? '+' : ''}{price?.changePercent?.toFixed(2) || '0.00'}%
                        <span className="text-slate-400 ml-2">
                          ({isPositive ? '+' : ''}${price?.change?.toFixed(2) || '0.00'})
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Recent Headlines Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Recent Headlines</h2>
              <Badge className="bg-orange-500/20 text-orange-400">Real-time</Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <RSSHeadlines />
              </div>
              <div>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link to="/my-stocks" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        My Portfolio
                      </Button>
                    </Link>
                    <Link to="/magnificent-7" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Activity className="w-4 h-4 mr-2" />
                        Magnificent 7 Deep Dive
                      </Button>
                    </Link>
                    <Link to="/index-funds" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Index Fund Analysis
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardVariant4;
