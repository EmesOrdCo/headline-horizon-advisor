
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight, Clock, Activity, ExternalLink, Coins, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import RSSHeadlines from "@/components/RSSHeadlines";
import { SourceArticles } from "@/components/NewsCard/SourceArticles";
import { AIAnalysisSection } from "@/components/NewsCard/AIAnalysisSection";
import { SentimentIndicator } from "@/components/NewsCard/SentimentIndicator";
import { DetailedAnalysis } from "@/components/NewsCard/DetailedAnalysis";
import { useNews } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useSEO } from "@/hooks/useSEO";
import { useConsistentTopStories } from "@/hooks/useConsistentTopStories";
import { useArticleWeights } from "@/hooks/useArticleWeights";

const Dashboard = () => {
  useSEO({
    title: "Live Market News Dashboard",
    description: "News-first layout with comprehensive sidebar navigation and real-time market updates.",
    canonical: "https://yourdomain.com/dashboard"
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

  // Dummy data for biggest movers
  const dummyGainers = [
    { symbol: "NVDA", name: "NVIDIA Corp", price: 124.36, changePercent: 8.42 },
    { symbol: "TSLA", name: "Tesla Inc", price: 215.89, changePercent: 6.73 },
    { symbol: "AMD", name: "Advanced Micro Devices", price: 98.76, changePercent: 5.21 }
  ];

  const dummyLosers = [
    { symbol: "INTC", name: "Intel Corp", price: 34.29, changePercent: -7.82 },
    { symbol: "MU", name: "Micron Technology", price: 76.34, changePercent: -5.42 },
    { symbol: "PYPL", name: "PayPal Holdings", price: 62.18, changePercent: -4.68 }
  ];

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

  // Get article weights for Magnificent 7 story
  const magnificent7SourceArticles = getSourceArticles(topMagnificent7Story);
  const { data: magnificent7ArticleWeights, isLoading: magnificent7WeightsLoading } = useArticleWeights({
    articles: magnificent7SourceArticles,
    overallSentiment: topMagnificent7Story?.ai_sentiment || 'Neutral',
    overallConfidence: topMagnificent7Story?.ai_confidence || 50,
    symbol: topMagnificent7Story?.symbol || '',
    enabled: magnificent7SourceArticles.length > 0 && !topMagnificent7Story?.ai_reasoning?.includes('Historical')
  });

  // Get article weights for Index Fund story
  const indexFundSourceArticles = getSourceArticles(topIndexFundStory);
  const { data: indexFundArticleWeights, isLoading: indexFundWeightsLoading } = useArticleWeights({
    articles: indexFundSourceArticles,
    overallSentiment: topIndexFundStory?.ai_sentiment || 'Neutral',
    overallConfidence: topIndexFundStory?.ai_confidence || 50,
    symbol: topIndexFundStory?.symbol || '',
    enabled: indexFundSourceArticles.length > 0 && !topIndexFundStory?.ai_reasoning?.includes('Historical')
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-24 sm:pt-28 p-3 sm:p-4 w-[95%] mx-auto">


        {/* TOP SECTION - Modified to include breaking news */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-12">
          {/* Main Content - Breaking News Section */}
          <div className="lg:col-span-4 space-y-8">
            {/* 
              BREAKING NEWS SECTION
              Purpose: Display the biggest global headline affecting stocks
              This could include major geopolitical events, significant tech announcements, 
              economic developments, or other world events that impact financial markets.
              Updated daily with the most market-moving news.
            */}
            <Card className="bg-gradient-to-br from-red-950/30 to-slate-800/50 border-red-500/30">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                    <Badge className="bg-red-600 text-white text-sm font-bold">BREAKING</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Updated 12 minutes ago</span>
                  </div>
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                  S&P 500 Hits Record on Signs Economy in Good Shape
                </h1>

                <p className="text-xl text-slate-300 mb-6 leading-relaxed">
                  Economically sensitive shares outperformed after solid retail sales and a drop in jobless claims, 
                  signaling continued economic resilience despite recent market volatility and geopolitical tensions.
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Market Positive
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Economic Data
                  </Badge>
                  <span className="text-slate-400 text-sm">
                    Impact: High • Confidence: 94%
                  </span>
                </div>

                {/* AI Analysis Section */}
                <AIAnalysisSection 
                  symbol="SPY"
                  sentiment="Bullish"
                  confidence={94}
                  isHistorical={false}
                  sourceLinksCount={5}
                />

                <SentimentIndicator 
                  sentiment="Bullish"
                  category="Market Positive"
                />

                <DetailedAnalysis 
                  symbol="SPY"
                  sentiment="Bullish"
                  confidence={94}
                />
              </CardContent>
            </Card>
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

            {/* Biggest Movers */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <CardTitle className="text-white text-lg">Big Movers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Gainers Column */}
                  <div>
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                      <span className="text-slate-300 font-medium text-lg">Top Gainers</span>
                    </div>
                    <div className="space-y-2">
                      {dummyGainers.map((stock) => (
                        <div key={stock.symbol} className="p-2 bg-slate-800/70 rounded border border-emerald-500/10">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-white text-sm">{stock.symbol}</span>
                            <span className="text-sm text-emerald-400">+{stock.changePercent.toFixed(2)}%</span>
                          </div>
                          <div className="text-slate-400 text-xs truncate">${stock.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Losers Column */}
                  <div>
                    <div className="flex items-center mb-2">
                      <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                      <span className="text-slate-300 font-medium text-lg">Top Losers</span>
                    </div>
                    <div className="space-y-2">
                      {dummyLosers.map((stock) => (
                        <div key={stock.symbol} className="p-2 bg-slate-800/70 rounded border border-red-500/10">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-white text-sm">{stock.symbol}</span>
                            <span className="text-sm text-red-400">{stock.changePercent.toFixed(2)}%</span>
                          </div>
                          <div className="text-slate-400 text-xs truncate">${stock.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Link to="/biggest-movers" className="block mt-4">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View All Market Movers
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
            <div className="w-full">
              <Card className="bg-slate-800/50 border-slate-700 h-full">
                <CardContent className="p-6 h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
                    {/* Main Analysis - Left Side (narrower now) */}
                    <div className="lg:col-span-2">
                      <NewsCard 
                        symbol={topMagnificent7Story.symbol}
                        title={generateCompositeHeadline(topMagnificent7Story)}
                        description={topMagnificent7Story.description}
                        confidence={topMagnificent7Story.ai_confidence}
                        sentiment={topMagnificent7Story.ai_sentiment}
                        category={topMagnificent7Story.category}
                        isHistorical={topMagnificent7Story.ai_reasoning?.includes('Historical')}
                        sourceLinks="[]"
                        stockPrice={getStockPrice(topMagnificent7Story.symbol)}
                      />
                    </div>
                    {/* Source Articles - Right Side (wider now) */}
                    <div className="lg:col-span-3">
                      <SourceArticles 
                        parsedSourceLinks={magnificent7SourceArticles}
                        isHistorical={topMagnificent7Story.ai_reasoning?.includes('Historical')}
                        articleWeights={magnificent7ArticleWeights}
                        weightsLoading={magnificent7WeightsLoading}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
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
            <div className="w-full">
              <Card className="bg-slate-800/50 border-slate-700 h-full">
                <CardContent className="p-6 h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
                    {/* Main Analysis - Left Side (narrower now) */}
                    <div className="lg:col-span-2">
                      <NewsCard 
                        symbol={topIndexFundStory.symbol}
                        title={generateCompositeHeadline(topIndexFundStory)}
                        description={topIndexFundStory.description}
                        confidence={topIndexFundStory.ai_confidence}
                        sentiment={topIndexFundStory.ai_sentiment}
                        category={topIndexFundStory.category}
                        isHistorical={topIndexFundStory.ai_reasoning?.includes('Historical')}
                        sourceLinks="[]"
                        stockPrice={getStockPrice(topIndexFundStory.symbol)}
                      />
                    </div>
                    
                    {/* Source Articles - Right Side (wider now) */}
                    <div className="lg:col-span-3">
                      <SourceArticles 
                        parsedSourceLinks={indexFundSourceArticles}
                        isHistorical={topIndexFundStory.ai_reasoning?.includes('Historical')}
                        articleWeights={indexFundArticleWeights}
                        weightsLoading={indexFundWeightsLoading}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* CRYPTO COMING SOON SECTION */}
        <section className="border-t border-slate-700 pt-8 mt-12">
          <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Coins className="w-8 h-8 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Cryptocurrency Analysis</h2>
            </div>
            <p className="text-slate-300 text-lg mb-4">
              AI-powered crypto market insights coming soon
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Coming Soon
              </Badge>
              <span className="text-slate-400 text-sm">
                Bitcoin, Ethereum, and major altcoins analysis
              </span>
            </div>
          </div>
        </section>

        {/* RECENT HEADLINES SECTION */}
        <section className="border-t border-slate-700 pt-8 mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Recent Headlines</h2>
              <p className="text-slate-400 text-sm">Latest market news and updates</p>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <RSSHeadlines />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
