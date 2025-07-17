
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight, BarChart3, Activity, Eye, Zap, Globe, Users, Target } from "lucide-react";
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

const DashboardVariant5 = () => {
  useSEO({
    title: "Live Market News Dashboard - Variant 5",
    description: "Mixed visual emphasis with hero content, data visualizations, and comprehensive market insights.",
    canonical: "https://yourdomain.com/dashboard-variant-5"
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

  // Calculate market stats
  const totalStocks = MAGNIFICENT_7.length + MAJOR_INDEX_FUNDS.length;
  const bullishCount = [topMagnificent7Story, topIndexFundStory]
    .filter(story => story?.ai_sentiment === 'Bullish').length;
  const avgConfidence = [topMagnificent7Story, topIndexFundStory]
    .filter(story => story?.ai_confidence)
    .reduce((acc, story) => acc + (story?.ai_confidence || 0), 0) / 2;

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Hero Section with Visual Emphasis */}
        <div className="relative mb-12">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-emerald-900/20 rounded-3xl"></div>
          
          <div className="relative p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left: Hero Content */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-emerald-500 text-white">LIVE ANALYSIS</Badge>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  AI-Powered
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    Market Intelligence
                  </span>
                </h1>
                
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                  Real-time analysis of market trends, stock movements, and AI-driven insights 
                  to help you make informed investment decisions.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link to="/magnificent-7">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Activity className="w-4 h-4 mr-2" />
                      Explore Magnificent 7
                    </Button>
                  </Link>
                  <Link to="/my-stocks">
                    <Button variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10">
                      <Eye className="w-4 h-4 mr-2" />
                      My Portfolio
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Right: Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400 mb-1">
                      {bullishCount}/{totalStocks}
                    </div>
                    <div className="text-slate-400 text-sm">Bullish Signals</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {avgConfidence.toFixed(0)}%
                    </div>
                    <div className="text-slate-400 text-sm">AI Confidence</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {newsData?.length || 0}
                    </div>
                    <div className="text-slate-400 text-sm">Active Stories</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400 mb-1">LIVE</div>
                    <div className="text-slate-400 text-sm">Market Status</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Analysis Strip */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Featured AI Analysis</h2>
            <Badge className="bg-yellow-500/20 text-yellow-400">TRENDING</Badge>
          </div>
          
          {topMagnificent7Story && (
            <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-yellow-500 text-black">{topMagnificent7Story.symbol}</Badge>
                      <Badge className={`${
                        topMagnificent7Story.ai_sentiment === 'Bullish' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {topMagnificent7Story.ai_sentiment}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {generateCompositeHeadline(topMagnificent7Story)}
                    </h3>
                    <p className="text-slate-300 line-clamp-2">
                      {topMagnificent7Story.description}
                    </p>
                  </div>
                  <div className="text-center lg:text-right">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">
                      {topMagnificent7Story.ai_confidence}%
                    </div>
                    <div className="text-slate-400 text-sm mb-3">AI Confidence</div>
                    <Button variant="outline" size="sm" className="text-yellow-400 border-yellow-400">
                      View Analysis <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {/* Analysis Cards */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Magnificent 7 Deep Dive */}
              <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-400 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Magnificent 7
                    </CardTitle>
                    {magnificent7HasRecentNews ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Fresh</Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-400 text-xs">Latest</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Market Leaders</span>
                      <span className="text-white font-medium">{MAGNIFICENT_7.length} stocks</span>
                    </div>
                    
                    <div className="space-y-2">
                      {MAGNIFICENT_7.slice(0, 3).map((symbol) => {
                        const price = getStockPrice(symbol);
                        return (
                          <div key={symbol} className="flex justify-between items-center text-sm">
                            <span className="text-white">{symbol}</span>
                            <span className={`font-medium ${
                              (price?.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {(price?.changePercent || 0) >= 0 ? '+' : ''}{price?.changePercent?.toFixed(1) || '0.0'}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Link to="/magnificent-7" className="block">
                      <Button variant="outline" className="w-full text-blue-400 border-blue-400 group-hover:bg-blue-400/10">
                        Analyze All 7 <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Index Funds Overview */}
              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Index Funds
                    </CardTitle>
                    {indexFundsHasRecentNews ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Fresh</Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-400 text-xs">Latest</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Market Indices</span>
                      <span className="text-white font-medium">{MAJOR_INDEX_FUNDS.length} funds</span>
                    </div>
                    
                    <div className="space-y-2">
                      {MAJOR_INDEX_FUNDS.map((symbol) => {
                        const price = getStockPrice(symbol);
                        return (
                          <div key={symbol} className="flex justify-between items-center text-sm">
                            <span className="text-white">{symbol}</span>
                            <span className={`font-medium ${
                              (price?.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {(price?.changePercent || 0) >= 0 ? '+' : ''}{price?.changePercent?.toFixed(1) || '0.0'}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Link to="/index-funds" className="block">
                      <Button variant="outline" className="w-full text-purple-400 border-purple-400 group-hover:bg-purple-400/10">
                        View Index Analysis <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis Section */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                Detailed AI Analysis
              </h3>
              
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
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Performers */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-400 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MAGNIFICENT_7.slice(0, 5).map((symbol) => {
                    const price = getStockPrice(symbol);
                    return (
                      <div key={symbol} className="flex justify-between items-center">
                        <span className="text-white text-sm font-medium">{symbol}</span>
                        <div className="text-right">
                          <div className="text-white text-sm">${price?.price.toFixed(2) || '--'}</div>
                          <div className={`text-xs ${
                            (price?.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {(price?.changePercent || 0) >= 0 ? '+' : ''}{price?.changePercent?.toFixed(2) || '0.00'}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link to="/biggest-movers" className="block mt-4">
                  <Button variant="outline" size="sm" className="w-full text-emerald-400 border-emerald-400">
                    View All Movers
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Portfolio Quick Access */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Portfolio Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/my-stocks" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    My Stocks
                  </Button>
                </Link>
                <Link to="/predictions" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Target className="w-4 h-4 mr-2" />
                    AI Predictions
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* RSS Headlines */}
            <RSSHeadlines />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardVariant5;
