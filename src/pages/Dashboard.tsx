
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight, Clock, Activity, ExternalLink, Coins, AlertTriangle, Loader2, BarChart3, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import RSSHeadlines from "@/components/RSSHeadlines";
import AutoRefreshAnalytics from "@/components/AutoRefreshAnalytics";
import { SourceArticles } from "@/components/NewsCard/SourceArticles";
import { AIAnalysisSection } from "@/components/NewsCard/AIAnalysisSection";
import { SentimentIndicator } from "@/components/NewsCard/SentimentIndicator";
import { DetailedAnalysis } from "@/components/NewsCard/DetailedAnalysis";
import AINewsInsights from "@/components/StockDetail/AINewsInsights";
import { useNews } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useSEO } from "@/hooks/useSEO";
import { useFetchRSSNews } from "@/hooks/useRSSHeadlines";
import { useQueryClient } from "@tanstack/react-query";
import { useConsistentTopStories } from "@/hooks/useConsistentTopStories";
import { useArticleWeights } from "@/hooks/useArticleWeights";
import { useBiggestMovers } from "@/hooks/useBiggestMovers";
import { useCompanyLogos } from "@/hooks/useCompanyLogos";
import { supabase } from "@/integrations/supabase/client";
import CompanyLogo from "@/components/CompanyLogo";

const Dashboard = () => {
  const fetchRSSNews = useFetchRSSNews();
  const queryClient = useQueryClient();
  const [isRefreshingHeadlines, setIsRefreshingHeadlines] = React.useState(false);

  useSEO({
    title: "Live Market News Dashboard",
    description: "News-first layout with comprehensive sidebar navigation and real-time market updates.",
    canonical: "https://yourdomain.com/dashboard"
  });

  const { data: newsData, isLoading } = useNews();
  const { data: stockPrices } = useStockPrices();
  const { data: biggestMovers } = useBiggestMovers();

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

  // Get real movers data (limit to 3 each for the dashboard)
  const topGainers = biggestMovers?.gainers?.slice(0, 3) || [];
  const topLosers = biggestMovers?.losers?.slice(0, 3) || [];
  
  // Get company logos for the movers
  const { data: biggestMoversData, isLoading: biggestMoversLoading } = useBiggestMovers();
  const moversSymbols = [
    ...(topGainers.map(stock => stock.symbol) || []),
    ...(topLosers.map(stock => stock.symbol) || [])
  ];
  const { getLogoUrl } = useCompanyLogos(moversSymbols);

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
      <AutoRefreshAnalytics />
      <DashboardNav />
      
      {/* Market Ticker - positioned below fixed nav */}
      <div className="pt-16 relative z-40">
        <MarketTicker />
      </div>
      
      <main className="pt-8 sm:pt-12 p-3 sm:p-4 w-[95%] mx-auto">


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
            {/* Recent Headlines */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">Recent Headlines</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      setIsRefreshingHeadlines(true);
                      try {
                        const result = await fetchRSSNews();
                        if (result.success) {
                          await queryClient.invalidateQueries({ queryKey: ['rss-headlines'] });
                        }
                      } catch (error) {
                        console.error('Error refreshing headlines:', error);
                      } finally {
                        setIsRefreshingHeadlines(false);
                      }
                    }}
                    disabled={isRefreshingHeadlines}
                    className="h-6 w-6 p-0 hover:bg-slate-700/50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshingHeadlines ? 'animate-spin' : ''} text-slate-400 hover:text-white`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <RSSHeadlines maxItems={15} compact={true} />
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
                {biggestMoversLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading market movers...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Gainers Column */}
                      <div>
                        <div className="flex items-center mb-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                          <span className="text-slate-300 font-medium text-lg">Top Gainers</span>
                        </div>
                        <div className="space-y-2">
                          {topGainers.map((stock) => (
                            <div key={stock.symbol} className="p-2 bg-slate-800/70 rounded border border-emerald-500/10">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CompanyLogo 
                                    symbol={stock.symbol} 
                                    logoUrl={getLogoUrl(stock.symbol)} 
                                    size="sm" 
                                  />
                                  <span className="font-medium text-white text-sm">{stock.symbol}</span>
                                </div>
                                <span className="text-sm text-emerald-400">+{stock.changePercent.toFixed(2)}%</span>
                              </div>
                              <div className="text-slate-400 text-xs truncate ml-6">${stock.price.toFixed(2)}</div>
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
                          {topLosers.map((stock) => (
                            <div key={stock.symbol} className="p-2 bg-slate-800/70 rounded border border-red-500/10">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CompanyLogo 
                                    symbol={stock.symbol} 
                                    logoUrl={getLogoUrl(stock.symbol)} 
                                    size="sm" 
                                  />
                                  <span className="font-medium text-white text-sm">{stock.symbol}</span>
                                </div>
                                <span className="text-sm text-red-400">{stock.changePercent.toFixed(2)}%</span>
                              </div>
                              <div className="text-slate-400 text-xs truncate ml-6">${stock.price.toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Link to="/watchlist#daily-movers" className="block mt-4">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        View All Market Movers
                      </Button>
                    </Link>
                  </>
                )}
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
          
          {/* Live Stock Analysis Interface */}
          {isLoading || !topMagnificent7Story ? (
            <div className="w-full">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4 animate-fade-in">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                      <div className="text-slate-400 text-sm animate-pulse">Loading Magnificent 7 analysis...</div>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="w-full">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-0">
                  {/* Stock Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <CompanyLogo 
                        symbol={topMagnificent7Story.symbol}
                        logoUrl={getLogoUrl(topMagnificent7Story.symbol)}
                        size="md"
                      />
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500 text-white">{topMagnificent7Story.symbol}</Badge>
                        <span className="text-white font-medium">{topMagnificent7Story.symbol} Corporation</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Price</div>
                        <div className="text-white font-semibold">
                          ${getStockPrice(topMagnificent7Story.symbol)?.price?.toFixed(2) || '214.00'}
                        </div>
                      </div>
                      <Link to={`/stock-chart/${topMagnificent7Story.symbol}`}>
                        <Button variant="outline" size="sm" className="border-slate-600">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Chart
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
                    {/* Left Side - Stock Analysis */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Stock Badge */}
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500 text-white">{topMagnificent7Story.symbol}</Badge>
                        <span className="text-slate-400">Stock</span>
                      </div>

                      {/* Price Display */}
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              ${getStockPrice(topMagnificent7Story.symbol)?.price?.toFixed(2) || '214.00'}
                            </div>
                            <div className="text-red-400 text-sm">
                              📉 {getStockPrice(topMagnificent7Story.symbol)?.change?.toFixed(2) || '-0.05'} ({getStockPrice(topMagnificent7Story.symbol)?.changePercent?.toFixed(2) || '-0.02'}%)
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Main Title */}
                      <h3 className="text-xl font-bold text-white">
                        {topMagnificent7Story.symbol}: Earnings disappoint investors
                      </h3>

                      {/* Description */}
                      <p className="text-slate-300 text-sm">
                        Market analysis for {topMagnificent7Story.symbol} based on {magnificent7SourceArticles.length} recent news articles and market developments.
                      </p>

                      {/* AI Analysis Section */}
                      <AIAnalysisSection 
                        symbol={topMagnificent7Story.symbol}
                        sentiment={topMagnificent7Story.ai_sentiment || 'Neutral'}
                        confidence={topMagnificent7Story.ai_confidence || 50}
                        isHistorical={topMagnificent7Story.ai_reasoning?.includes('Historical')}
                        sourceLinksCount={magnificent7SourceArticles.length}
                      />

                      {/* Market Sentiment */}
                      <SentimentIndicator 
                        sentiment={topMagnificent7Story.ai_sentiment || 'Neutral'}
                        category="Technology Stock"
                      />

                      {/* Detailed Analysis */}
                      <DetailedAnalysis 
                        symbol={topMagnificent7Story.symbol}
                        sentiment={topMagnificent7Story.ai_sentiment || 'Neutral'}
                        confidence={topMagnificent7Story.ai_confidence || 50}
                      />
                    </div>

                    {/* Right Side - Source Articles */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-2 mb-4">
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                        <h4 className="text-white font-semibold">Source Articles ({magnificent7SourceArticles.length})</h4>
                        <span className="text-slate-500 text-sm">Weighted by significance</span>
                      </div>
                      
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
            <div className="flex items-center gap-4">
              <Link to="/index-funds">
                <Button variant="outline" className="text-purple-400 border-purple-400 hover:bg-purple-400/10">
                  View All Funds <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Live Index Fund Analysis Interface */}
          {isLoading || !topIndexFundStory ? (
            <div className="w-full">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4 animate-fade-in">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                      <div className="text-slate-400 text-sm animate-pulse">Loading Index Funds analysis...</div>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : topIndexFundStory ? (
            <div className="w-full">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-0">
                  {/* Index Fund Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <CompanyLogo 
                        symbol={topIndexFundStory.symbol}
                        logoUrl={getLogoUrl(topIndexFundStory.symbol)}
                        size="md"
                      />
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500 text-white">{topIndexFundStory.symbol}</Badge>
                        <span className="text-white font-medium">{topIndexFundStory.symbol} Index Fund</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Price</div>
                        <div className="text-white font-semibold">
                          ${getStockPrice(topIndexFundStory.symbol)?.price?.toFixed(2) || '458.50'}
                        </div>
                      </div>
                      <Link to={`/stock-chart/${topIndexFundStory.symbol}`}>
                        <Button variant="outline" size="sm" className="border-slate-600">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Chart
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
                    {/* Left Side - Index Fund Analysis */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Index Badge */}
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500 text-white">{topIndexFundStory.symbol}</Badge>
                        <span className="text-slate-400">Index</span>
                      </div>

                      {/* Price Display */}
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              ${getStockPrice(topIndexFundStory.symbol)?.price?.toFixed(2) || '458.50'}
                            </div>
                            <div className="text-emerald-400 text-sm">
                              📈 +{getStockPrice(topIndexFundStory.symbol)?.change?.toFixed(2) || '2.15'} (+{getStockPrice(topIndexFundStory.symbol)?.changePercent?.toFixed(2) || '0.47'}%)
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Main Title */}
                      <h3 className="text-xl font-bold text-white">
                        {topIndexFundStory.symbol}: Market index shows strong performance
                      </h3>

                      {/* Description */}
                      <p className="text-slate-300 text-sm">
                        Market analysis for {topIndexFundStory.symbol} based on {indexFundSourceArticles.length} recent news articles and market developments.
                      </p>

                      {/* AI Analysis Section */}
                      <AIAnalysisSection 
                        symbol={topIndexFundStory.symbol}
                        sentiment={topIndexFundStory.ai_sentiment || 'Neutral'}
                        confidence={topIndexFundStory.ai_confidence || 50}
                        isHistorical={topIndexFundStory.ai_reasoning?.includes('Historical')}
                        sourceLinksCount={indexFundSourceArticles.length}
                      />

                      {/* Market Sentiment */}
                      <SentimentIndicator 
                        sentiment={topIndexFundStory.ai_sentiment || 'Neutral'}
                        category="Index Fund"
                      />

                      {/* Detailed Analysis */}
                      <DetailedAnalysis 
                        symbol={topIndexFundStory.symbol}
                        sentiment={topIndexFundStory.ai_sentiment || 'Neutral'}
                        confidence={topIndexFundStory.ai_confidence || 50}
                      />
                    </div>

                    {/* Right Side - Source Articles */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-2 mb-4">
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                        <h4 className="text-white font-semibold">Source Articles ({indexFundSourceArticles.length})</h4>
                        <span className="text-slate-500 text-sm">Weighted by significance</span>
                      </div>
                      
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
          ) : null}
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

      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
