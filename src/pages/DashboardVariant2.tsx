
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight, Clock, Activity, ExternalLink } from "lucide-react";
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

  // Get the most pressing stock-related headline that doesn't appear elsewhere
  const getMostPressingHeadline = () => {
    if (!newsData) return null;
    
    // Filter out stories that are already featured
    const excludedSymbols = new Set([
      topMagnificent7Story?.symbol,
      topIndexFundStory?.symbol
    ].filter(Boolean));
    
    return newsData
      .filter(item => 
        item.symbol && 
        item.symbol !== 'GENERAL' &&
        !excludedSymbols.has(item.symbol) &&
        item.title && 
        item.title.length > 0 &&
        item.ai_confidence &&
        item.ai_confidence > 60
      )
      .sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return bTime - aTime;
      })[0];
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

  // Get source articles for a story
  const getSourceArticles = (story: any) => {
    if (!story?.source_links) return [];
    
    try {
      return JSON.parse(story.source_links);
    } catch {
      return [];
    }
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

  const mostPressingHeadline = getMostPressingHeadline();

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-12">
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
          </div>
          
          {/* Sidebar */}
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

            {/* Most Pressing Headlines */}
            {mostPressingHeadline && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    Breaking Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-700/50 rounded-lg border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-orange-500 text-white text-xs">{mostPressingHeadline.symbol}</Badge>
                        <Badge className={`text-xs ${
                          mostPressingHeadline.ai_sentiment === 'Bullish' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {mostPressingHeadline.ai_sentiment}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-medium text-white mb-2 line-clamp-2">
                        {mostPressingHeadline.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {formatTimeAgo(mostPressingHeadline.created_at)}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">Conf:</span>
                          <span className="text-xs text-orange-400 font-medium">
                            {mostPressingHeadline.ai_confidence}%
                          </span>
                        </div>
                      </div>
                      {mostPressingHeadline.url && (
                        <a 
                          href={mostPressingHeadline.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 mt-2"
                        >
                          Read More <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <Link to="/biggest-movers" className="block mt-4">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View All Breaking News
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* MAGNIFICENT 7 SECTION */}
        <section className="border-t border-slate-700 pt-8 mb-12">
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
          
          {topMagnificent7Story && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Analysis */}
              <div className="lg:col-span-2">
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
              </div>
              
              {/* Source Articles */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Source Articles</h3>
                <div className="space-y-3">
                  {getSourceArticles(topMagnificent7Story).slice(0, 4).map((article: any, index: number) => (
                    <div key={index} className="group cursor-pointer">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700/50"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-slate-500">{formatTimeAgo(article.published_at)}</span>
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
          )}
        </section>

        {/* INDEX FUNDS SECTION */}
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
          
          {topIndexFundStory && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Analysis */}
              <div className="lg:col-span-2">
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
              </div>
              
              {/* Source Articles */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Source Articles</h3>
                <div className="space-y-3">
                  {getSourceArticles(topIndexFundStory).slice(0, 4).map((article: any, index: number) => (
                    <div key={index} className="group cursor-pointer">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700/50"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-slate-500">{formatTimeAgo(article.published_at)}</span>
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
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardVariant2;
