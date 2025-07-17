
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight, Clock, Eye, Activity, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import { useNews } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useSEO } from "@/hooks/useSEO";
import { useConsistentTopStories } from "@/hooks/useConsistentTopStories";

const DashboardVariant2 = () => {
  useSEO({
    title: "Live Market News Dashboard - Variant 2",
    description: "News-first layout with comprehensive sidebar navigation and real-time market updates.",
    canonical: "https://yourdomain.com/dashboard-variant-2"
  });

  const { data: newsData, isLoading } = useNews();
  const { data: stockPrices } = useStockPrices();

  const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
  const MAJOR_INDEX_FUNDS = ['SPY', 'QQQ', 'DIA'];

  const {
    topMagnificent7Story,
    topIndexFundStory
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

  // Get related headlines for a specific symbol
  const getRelatedHeadlines = (targetSymbol: string) => {
    if (!newsData) return [];
    
    return newsData
      .filter(item => item.symbol === targetSymbol && item.title && item.title.length > 0)
      .slice(0, 4)
      .map(item => ({
        title: item.title,
        published_at: item.published_at || item.created_at,
        category: item.category || 'Market News',
        url: item.url || '#'
      }));
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const published = new Date(dateString);
      const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36 p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-4 space-y-8">
            {/* Breaking News Header */}
            <div className="border-l-4 border-red-500 pl-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <Badge className="bg-red-500 text-white text-xs">BREAKING</Badge>
                <span className="text-slate-400 text-sm">Market Alert</span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                Live Market Intelligence Dashboard
              </h1>
            </div>

            {/* Featured Analysis Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Featured AI Analysis
              </h2>
              
              {topIndexFundStory && (
                <Card className="bg-gradient-to-r from-purple-900/20 to-slate-800/50 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-purple-500 text-white">{topIndexFundStory.symbol}</Badge>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Updated moments ago</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {generateCompositeHeadline(topIndexFundStory)}
                    </h3>
                    <p className="text-slate-300 mb-4 leading-relaxed">
                      {topIndexFundStory.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <Badge className={`${
                        topIndexFundStory.ai_sentiment === 'Bullish' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {topIndexFundStory.ai_sentiment}
                      </Badge>
                      <span className="text-slate-400 text-sm">
                        AI Confidence: {topIndexFundStory.ai_confidence}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Magnificent 7 Section */}
            <section className="border-t border-slate-700 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Magnificent 7</h2>
                  <p className="text-slate-400 text-sm">AI-powered analysis of tech giants</p>
                </div>
                <Link to="/magnificent-7">
                  <Button variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400/10">
                    View All 7 Stocks <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Analysis */}
                <div className="lg:col-span-2">
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
                
                {/* Related Headlines */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Related Headlines</h3>
                  <div className="space-y-3">
                    {topMagnificent7Story && getRelatedHeadlines(topMagnificent7Story.symbol).map((headline, index) => (
                      <div key={index} className="group cursor-pointer">
                        <a 
                          href={headline.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                                {headline.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-slate-500">{formatTimeAgo(headline.published_at)}</span>
                                <span className="text-xs text-slate-500">• {headline.category}</span>
                              </div>
                            </div>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Index Funds Section */}
            <section className="border-t border-slate-700 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Index Funds</h2>
                  <p className="text-slate-400 text-sm">Market index performance and insights</p>
                </div>
                <Link to="/index-funds">
                  <Button variant="outline" className="text-purple-400 border-purple-400 hover:bg-purple-400/10">
                    View All Funds <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Analysis */}
                <div className="lg:col-span-2">
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
                
                {/* Related Headlines */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Related Headlines</h3>
                  <div className="space-y-3">
                    {topIndexFundStory && getRelatedHeadlines(topIndexFundStory.symbol).map((headline, index) => (
                      <div key={index} className="group cursor-pointer">
                        <a 
                          href={headline.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                                {headline.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-slate-500">{formatTimeAgo(headline.published_at)}</span>
                                <span className="text-xs text-slate-500">• {headline.category}</span>
                              </div>
                            </div>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          {/* Sidebar - Market Data & Navigation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Overview */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Market Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {['SPY', 'QQQ', 'DIA'].map((symbol) => {
                    const price = getStockPrice(symbol);
                    return (
                      <div key={symbol} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                        <div>
                          <div className="font-medium text-white">{symbol}</div>
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

            {/* Top Movers */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Top Movers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MAGNIFICENT_7.slice(0, 4).map((symbol) => {
                    const price = getStockPrice(symbol);
                    return (
                      <div key={symbol} className="flex justify-between items-center">
                        <span className="text-white text-sm">{symbol}</span>
                        <div className={`text-sm font-medium ${
                          (price?.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {(price?.changePercent || 0) >= 0 ? '+' : ''}{price?.changePercent?.toFixed(1) || '0.0'}%
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link to="/biggest-movers" className="block mt-4">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View All Movers
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Navigation */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/my-stocks" className="block">
                  <Button variant="ghost" className="w-full justify-start text-sm h-8">
                    <Eye className="w-4 h-4 mr-2" />
                    My Portfolio
                  </Button>
                </Link>
                <Link to="/magnificent-7" className="block">
                  <Button variant="ghost" className="w-full justify-start text-sm h-8">
                    <Activity className="w-4 h-4 mr-2" />
                    Magnificent 7
                  </Button>
                </Link>
                <Link to="/index-funds" className="block">
                  <Button variant="ghost" className="w-full justify-start text-sm h-8">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Index Funds
                  </Button>
                </Link>
                <Link to="/biggest-movers" className="block">
                  <Button variant="ghost" className="w-full justify-start text-sm h-8">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Biggest Movers
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardVariant2;
