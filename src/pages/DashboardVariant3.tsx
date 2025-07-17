
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight, BarChart3, Activity, Eye, Clock, Zap } from "lucide-react";
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

const DashboardVariant3 = () => {
  useSEO({
    title: "Live Market News Dashboard - Variant 3",
    description: "Widget-based dashboard with comprehensive market data and AI insights.",
    canonical: "https://yourdomain.com/dashboard-variant-3"
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

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Market Dashboard</h1>
              <p className="text-slate-400">Real-time insights and AI-powered analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <Badge className="bg-emerald-500 text-white">LIVE</Badge>
            </div>
          </div>
        </div>

        {/* Dashboard Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Market Status Widget */}
          <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border-emerald-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-400 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Market Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">OPEN</div>
              <div className="text-emerald-400 text-sm">NYSE • NASDAQ</div>
              <div className="text-xs text-slate-400 mt-2">
                Next close: 4:00 PM ET
              </div>
            </CardContent>
          </Card>

          {/* AI Confidence Widget */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {topMagnificent7Story?.ai_confidence || '--'}%
              </div>
              <div className="text-blue-400 text-sm">Market Analysis</div>
              <div className="text-xs text-slate-400 mt-2">
                Based on latest data
              </div>
            </CardContent>
          </Card>

          {/* Top Sentiment Widget */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Market Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {topMagnificent7Story?.ai_sentiment || 'NEUTRAL'}
              </div>
              <div className="text-purple-400 text-sm">Overall Trend</div>
              <div className="text-xs text-slate-400 mt-2">
                AI-powered analysis
              </div>
            </CardContent>
          </Card>

          {/* Active Stories Widget */}
          <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-400 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Active Stories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {newsData?.length || 0}
              </div>
              <div className="text-orange-400 text-sm">In Analysis</div>
              <div className="text-xs text-slate-400 mt-2">
                Updated continuously
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Featured Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Story */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Featured Analysis
                  </CardTitle>
                  <Badge className="bg-blue-500 text-white text-xs">TRENDING</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {topMagnificent7Story ? (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {generateCompositeHeadline(topMagnificent7Story)}
                    </h3>
                    <p className="text-slate-300 mb-4 leading-relaxed">
                      {topMagnificent7Story.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <Badge className={`${
                        topMagnificent7Story.ai_sentiment === 'Bullish' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {topMagnificent7Story.ai_sentiment}
                      </Badge>
                      <span className="text-slate-400 text-sm">
                        Confidence: {topMagnificent7Story.ai_confidence}%
                      </span>
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <Clock className="w-3 h-3" />
                        <span>Updated now</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400">Loading featured analysis...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Magnificent 7 Widget */}
              <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-400 text-sm">Magnificent 7</CardTitle>
                    {magnificent7HasRecentNews ? (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-400 text-xs">
                        Fresh Data
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-400 border-amber-400 text-xs">
                        Latest Available
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {topMagnificent7Story ? (
                    <div>
                      <h4 className="font-semibold text-white mb-2 line-clamp-2">
                        {topMagnificent7Story.symbol} Analysis
                      </h4>
                      <p className="text-slate-400 text-sm line-clamp-3 mb-3">
                        {topMagnificent7Story.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${
                          topMagnificent7Story.ai_sentiment === 'Bullish' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {topMagnificent7Story.ai_sentiment}
                        </Badge>
                        <Link to="/magnificent-7">
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 h-6 text-xs">
                            View All <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Loading analysis...</p>
                  )}
                </CardContent>
              </Card>

              {/* Index Funds Widget */}
              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-400 text-sm">Index Funds</CardTitle>
                    {indexFundsHasRecentNews ? (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-400 text-xs">
                        Fresh Data
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-400 border-amber-400 text-xs">
                        Latest Available
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {topIndexFundStory ? (
                    <div>
                      <h4 className="font-semibold text-white mb-2 line-clamp-2">
                        {topIndexFundStory.symbol} Analysis
                      </h4>
                      <p className="text-slate-400 text-sm line-clamp-3 mb-3">
                        {topIndexFundStory.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${
                          topIndexFundStory.ai_sentiment === 'Bullish' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {topIndexFundStory.ai_sentiment}
                        </Badge>
                        <Link to="/index-funds">
                          <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 h-6 text-xs">
                            View All <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Loading analysis...</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Detailed AI Analysis</h3>
              <div className="space-y-4">
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
              </div>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Market Snapshot */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Market Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MAJOR_INDEX_FUNDS.map((symbol) => {
                    const price = getStockPrice(symbol);
                    return (
                      <div key={symbol} className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                        <div>
                          <div className="font-medium text-white text-sm">{symbol}</div>
                          <div className="text-xs text-slate-400">${price?.price.toFixed(2) || '--'}</div>
                        </div>
                        <div className={`text-sm font-medium ${
                          (price?.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {(price?.changePercent || 0) >= 0 ? '+' : ''}{price?.changePercent?.toFixed(2) || '0.00'}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/my-stocks" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    My Portfolio
                  </Button>
                </Link>
                <Link to="/biggest-movers" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Biggest Movers
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

export default DashboardVariant3;
