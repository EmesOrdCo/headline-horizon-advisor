import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight, ExternalLink, RefreshCw, Clock, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import RSSHeadlines from "@/components/RSSHeadlines";
import { useNews, useFetchNews } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useSEO } from "@/hooks/useSEO";
import { useConsistentTopStories } from "@/hooks/useConsistentTopStories";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DashboardVariant1 = () => {
  useSEO({
    title: "Live Market News Dashboard - Variant 1",
    description: "Stay updated with real-time market news, AI-powered analysis of Magnificent 7 stocks, index funds, and comprehensive market insights.",
    canonical: "https://yourdomain.com/dashboard-variant-1",
    ogType: "website"
  });

  const { data: newsData, isLoading } = useNews();
  const { data: stockPrices, isLoading: isPricesLoading } = useStockPrices();
  const fetchNews = useFetchNews();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRefreshingMag7, setIsRefreshingMag7] = useState(false);
  const [isRefreshingIndex, setIsRefreshingIndex] = useState(false);

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

  // Manual refresh functions
  const refreshMagnificent7 = async () => {
    setIsRefreshingMag7(true);
    try {
      console.log('🔄 Manual refresh for Magnificent 7...');
      const { data, error } = await supabase.functions.invoke('fetch-magnificent-7');
      
      if (error) {
        console.error('❌ Magnificent 7 refresh failed:', error);
        toast({
          title: "Refresh Failed",
          description: "Failed to refresh Magnificent 7 data. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Invalidate and refetch news data
      await queryClient.invalidateQueries({ queryKey: ['news'] });
      console.log('✅ Magnificent 7 refreshed successfully');
      
      toast({
        title: "Refreshed Successfully",
        description: "Magnificent 7 data has been updated.",
      });
    } catch (error) {
      console.error('❌ Error refreshing Magnificent 7:', error);
      toast({
        title: "Refresh Failed",
        description: "An error occurred while refreshing Magnificent 7 data.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingMag7(false);
    }
  };

  const refreshIndexFunds = async () => {
    setIsRefreshingIndex(true);
    try {
      console.log('🔄 Manual refresh for Index Funds...');
      const { data, error } = await supabase.functions.invoke('fetch-index-funds');
      
      if (error) {
        console.error('❌ Index Funds refresh failed:', error);
        toast({
          title: "Refresh Failed",
          description: "Failed to refresh Index Funds data. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Invalidate and refetch news data
      await queryClient.invalidateQueries({ queryKey: ['news'] });
      console.log('✅ Index Funds refreshed successfully');
      
      toast({
        title: "Refreshed Successfully",
        description: "Index Funds data has been updated.",
      });
    } catch (error) {
      console.error('❌ Error refreshing Index Funds:', error);
      toast({
        title: "Refresh Failed",
        description: "An error occurred while refreshing Index Funds data.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingIndex(false);
    }
  };

  // Smart auto-fetch logic - only refresh when news is stale
  useEffect(() => {
    const checkAndRefreshIfNeeded = async () => {
      console.log('🔍 Checking if refresh is needed...');
      
      // Only refresh if we don't have recent news (older than 2 hours)
      const needsRefresh = !magnificent7HasRecentNews || !indexFundsHasRecentNews;
      
      if (needsRefresh) {
        console.log('🚀 Auto-refreshing due to stale news...');
        try {
          const result = await fetchNews();
          if (result.success) {
            await queryClient.invalidateQueries({ queryKey: ['news'] });
            console.log('✅ Auto-refresh completed successfully');
          } else {
            console.error('❌ Auto-refresh failed:', result.message);
          }
        } catch (error) {
          console.error('❌ Error during auto-refresh:', error);
        }
      } else {
        console.log('ℹ️ News is still fresh, skipping refresh');
      }
    };

    // Check immediately on mount
    checkAndRefreshIfNeeded();

    // Set up interval to check every 10 minutes (but only refresh if needed)
    const interval = setInterval(checkAndRefreshIfNeeded, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchNews, queryClient, magnificent7HasRecentNews, indexFundsHasRecentNews]);

  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(stock => stock.symbol === symbol);
  };

  const generateCompositeHeadline = (item: any): string => {
    const symbol = item.symbol;
    const sentiment = item.ai_sentiment?.toLowerCase() || 'neutral';
    
    let sourceArticles = [];
    try {
      sourceArticles = item.source_links ? JSON.parse(item.source_links) : [];
    } catch (error) {
      console.error('Error parsing source links:', error);
    }

    let summary = '';
    
    if (sourceArticles.length > 0) {
      const titles = sourceArticles.map((article: any) => article.title.toLowerCase());
      
      if (titles.some(t => t.includes('earnings') || t.includes('revenue') || t.includes('profit'))) {
        summary = sentiment === 'bullish' ? 'Strong earnings boost confidence' : 'Earnings disappoint investors';
      } else if (titles.some(t => t.includes('upgrade') || t.includes('analyst') || t.includes('target'))) {
        summary = sentiment === 'bullish' ? 'Analysts raise price targets' : 'Analysts downgrade stock';
      } else if (titles.some(t => t.includes('ai') || t.includes('artificial intelligence'))) {
        summary = sentiment === 'bullish' ? 'AI developments drive growth' : 'AI concerns weigh on stock';
      } else {
        summary = sentiment === 'bullish' ? 'Positive developments support growth' : 'Market challenges create headwinds';
      }
    } else {
      summary = sentiment === 'bullish' ? 'Positive momentum continues' : 'Market pressures weigh on stock';
    }

    return `${symbol}: ${summary}`;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Hero Section with Featured Story */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-white">Market Intelligence</h1>
            <Badge className="bg-emerald-500 text-white">LIVE</Badge>
          </div>
          
          {/* Featured Story Card */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500 text-white">FEATURED ANALYSIS</Badge>
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>Live Update</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {topMagnificent7Story ? (
                <div>
                  <h2 className="text-xl font-bold text-white mb-3">
                    {generateCompositeHeadline(topMagnificent7Story)}
                  </h2>
                  <p className="text-slate-300 mb-4 line-clamp-2">
                    {topMagnificent7Story.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={`${
                      topMagnificent7Story.ai_sentiment === 'Bullish' 
                        ? 'border-emerald-500 text-emerald-400' 
                        : 'border-red-500 text-red-400'
                    }`}>
                      {topMagnificent7Story.ai_sentiment}
                    </Badge>
                    <span className="text-slate-400 text-sm">
                      Confidence: {topMagnificent7Story.ai_confidence}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">Loading featured analysis...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Stories */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Stories Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Top Market Stories
                </h2>
                <Link to="/magnificent-7">
                  <Button variant="outline" size="sm" className="text-blue-400 border-blue-400 hover:bg-blue-400/10">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Magnificent 7 Card */}
                <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-blue-400">Magnificent 7</CardTitle>
                      {magnificent7HasRecentNews ? (
                        <Badge variant="outline" className="text-emerald-400 border-emerald-400 text-xs">Fresh</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-400 border-amber-400 text-xs">Latest</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {topMagnificent7Story ? (
                      <div>
                        <h3 className="font-semibold text-white mb-2 line-clamp-2">
                          {generateCompositeHeadline(topMagnificent7Story)}
                        </h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-3">
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
                          <span className="text-xs text-slate-500">
                            {topMagnificent7Story.ai_confidence}% confidence
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">Loading analysis...</p>
                    )}
                  </CardContent>
                </Card>

                {/* Index Funds Card */}
                <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-purple-400">Index Funds</CardTitle>
                      {indexFundsHasRecentNews ? (
                        <Badge variant="outline" className="text-emerald-400 border-emerald-400 text-xs">Fresh</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-400 border-amber-400 text-xs">Latest</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {topIndexFundStory ? (
                      <div>
                        <h3 className="font-semibold text-white mb-2 line-clamp-2">
                          {generateCompositeHeadline(topIndexFundStory)}
                        </h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-3">
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
                          <span className="text-xs text-slate-500">
                            {topIndexFundStory.ai_confidence}% confidence
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">Loading analysis...</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-400 rounded"></div>
                AI Market Analysis
              </h2>
              
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
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Market Movers Widget */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Market Movers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MAGNIFICENT_7.slice(0, 5).map((symbol) => {
                    const price = getStockPrice(symbol);
                    return (
                      <div key={symbol} className="flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{symbol}</span>
                          <div className="text-xs text-slate-400">
                            ${price?.price.toFixed(2) || '--'}
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs ${
                          (price?.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {(price?.changePercent || 0) >= 0 ? 
                            <TrendingUp className="w-3 h-3" /> : 
                            <TrendingDown className="w-3 h-3" />
                          }
                          {price?.changePercent?.toFixed(2) || '0.00'}%
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link to="/biggest-movers" className="block mt-4">
                  <Button variant="outline" size="sm" className="w-full text-emerald-400 border-emerald-400 hover:bg-emerald-400/10">
                    View All Movers
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Headlines */}
            <RSSHeadlines />

            {/* Quick Actions */}
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
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Magnificent 7
                  </Button>
                </Link>
                <Link to="/index-funds" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Index Funds
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

export default DashboardVariant1;
