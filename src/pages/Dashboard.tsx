
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNews, useFetchNews, useRecentHeadlines } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { data: newsData, isLoading, refetch } = useNews();
  const { data: recentHeadlines, isLoading: isLoadingHeadlines } = useRecentHeadlines();
  const { data: stockPrices, isLoading: isPricesLoading } = useStockPrices();
  const fetchNews = useFetchNews();
  const [isFetching, setIsFetching] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState<string>('');
  const { toast } = useToast();

  const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
  const MAJOR_INDEX_FUNDS = ['SPY', 'QQQ', 'DIA'];

  const STOCK_NAMES: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'SPY': 'SPDR S&P 500 ETF Trust',
    'QQQ': 'Invesco QQQ Trust',
    'DIA': 'SPDR Dow Jones Industrial Average ETF Trust'
  };

  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(stock => stock.symbol === symbol);
  };

  // Get the top story from Magnificent 7 (highest confidence or most bullish/bearish)
  const topMagnificent7Story = MAGNIFICENT_7.map(symbol => {
    return newsData?.find(item => 
      item.symbol === symbol && 
      item.ai_confidence && 
      item.ai_sentiment
    );
  }).filter(Boolean)
  .sort((a, b) => {
    // Sort by confidence first, then by sentiment strength
    const confidenceDiff = (b.ai_confidence || 0) - (a.ai_confidence || 0);
    if (confidenceDiff !== 0) return confidenceDiff;
    
    // Prefer non-neutral sentiments
    if (a.ai_sentiment === 'Neutral' && b.ai_sentiment !== 'Neutral') return 1;
    if (b.ai_sentiment === 'Neutral' && a.ai_sentiment !== 'Neutral') return -1;
    
    return 0;
  })[0];

  // Get the top story from Index Funds
  const topIndexFundStory = MAJOR_INDEX_FUNDS.map(symbol => {
    return newsData?.find(item => 
      item.symbol === symbol && 
      item.ai_confidence && 
      item.ai_sentiment
    );
  }).filter(Boolean)
  .sort((a, b) => {
    const confidenceDiff = (b.ai_confidence || 0) - (a.ai_confidence || 0);
    if (confidenceDiff !== 0) return confidenceDiff;
    
    if (a.ai_sentiment === 'Neutral' && b.ai_sentiment !== 'Neutral') return 1;
    if (b.ai_sentiment === 'Neutral' && a.ai_sentiment !== 'Neutral') return -1;
    
    return 0;
  })[0];

  // Generate composite headline based on source articles with uniqueness checking
  const generateCompositeHeadline = (item: any, existingHeadlines: string[] = []): string => {
    const symbol = item.symbol;
    const sentiment = item.ai_sentiment?.toLowerCase() || 'neutral';
    
    // Parse source links to get article titles
    let sourceArticles = [];
    try {
      sourceArticles = item.source_links ? JSON.parse(item.source_links) : [];
    } catch (error) {
      console.error('Error parsing source links:', error);
    }

    // Create short, easy-to-understand summary based on sentiment and context
    let summary = '';
    
    if (sourceArticles.length > 0) {
      const titles = sourceArticles.map((article: any) => article.title.toLowerCase());
      
      // Generate context-aware SHORT summaries
      if (titles.some(t => t.includes('earnings') || t.includes('revenue') || t.includes('profit'))) {
        summary = sentiment === 'bullish' ? 'Strong earnings boost confidence' : 'Earnings disappoint investors';
      } else if (titles.some(t => t.includes('upgrade') || t.includes('analyst') || t.includes('target'))) {
        summary = sentiment === 'bullish' ? 'Analysts raise price targets' : 'Analysts downgrade stock';
      } else if (titles.some(t => t.includes('ai') || t.includes('artificial intelligence'))) {
        summary = sentiment === 'bullish' ? 'AI developments drive growth' : 'AI concerns weigh on stock';
      } else if (titles.some(t => t.includes('chip') || t.includes('semiconductor'))) {
        summary = sentiment === 'bullish' ? 'Chip demand supports outlook' : 'Semiconductor headwinds emerge';
      } else if (titles.some(t => t.includes('cloud') || t.includes('enterprise'))) {
        summary = sentiment === 'bullish' ? 'Cloud growth accelerates' : 'Enterprise spending slows';
      } else {
        summary = sentiment === 'bullish' ? 'Positive developments support growth' : 'Market challenges create headwinds';
      }
    } else {
      // Fallback short summaries
      summary = sentiment === 'bullish' ? 'Positive momentum continues' : 'Market pressures weigh on stock';
    }

    return `${symbol}: ${summary}`;
  };

  const handleRefreshNews = async () => {
    setIsFetching(true);
    setFetchingStatus('Fetching news from all sources...');
    
    try {
      const result = await fetchNews();
      await refetch();
      
      if (result.success) {
        toast({
          title: "News Updated",
          description: result.message,
        });
      } else {
        toast({
          title: "Partial Success",
          description: "Some news sources may have failed. Check the results.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
      setFetchingStatus('');
    }
  };

  // Format publish time to show date and time to the minute
  const formatPublishTime = (publishedAt: string) => {
    const date = new Date(publishedAt);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Generate simple summary for headlines without stock analysis
  const generateSimpleSummary = (item: any) => {
    const description = item.description || '';
    const title = item.title || '';
    
    // Return first 120 characters of description if available
    if (description.length > 120) {
      return description.substring(0, 120) + '...';
    }
    
    if (description) {
      return description;
    }
    
    // Fallback to a generic summary if no description
    return 'Breaking news covering important market developments and business updates.';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-36 p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Market News</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">LIVE</span>
                <span className="text-gray-600 dark:text-slate-400 text-sm">AI Analyzed + RSS Feeds</span>
              </div>
            </div>
            <Button 
              onClick={handleRefreshNews}
              disabled={isFetching}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Fetching...' : 'Refresh News'}
            </Button>
          </div>
          <p className="text-gray-600 dark:text-slate-400">Top stories from each category with AI analysis + RSS feeds from Reuters, CNBC, MarketWatch, Bloomberg, and Financial Times</p>
          
          {isFetching && fetchingStatus && (
            <div className="text-amber-600 dark:text-yellow-400 text-sm mt-2 font-medium">
              {fetchingStatus}
            </div>
          )}
          
          {isPricesLoading && (
            <div className="text-amber-600 dark:text-yellow-400 text-sm mt-2 font-medium">
              Loading asset prices from Finnhub...
            </div>
          )}
          
          {!isPricesLoading && (!stockPrices || stockPrices.length === 0) && (
            <div className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">
              ⚠️ Asset prices unavailable - check Finnhub API connection
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-8">
            {/* Magnificent 7 Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Magnificent 7</h2>
                  <Badge className="bg-blue-500 text-white">Top Story</Badge>
                </div>
                <Link to="/magnificent-7">
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    View All 7 Stocks
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {isLoading ? (
                <div className="text-center text-gray-600 dark:text-slate-400 py-8">
                  Loading Magnificent 7 analysis...
                </div>
              ) : topMagnificent7Story ? (
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
              ) : (
                <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-6">
                  <p className="text-gray-600 dark:text-slate-400">No Magnificent 7 analysis available. Click "Refresh News" to fetch the latest updates.</p>
                </div>
              )}
            </div>

            {/* Index Funds Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Index Funds</h2>
                  <Badge className="bg-purple-500 text-white">Top Story</Badge>
                </div>
                <Link to="/index-funds">
                  <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                    View All Index Funds
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {isLoading ? (
                <div className="text-center text-gray-600 dark:text-slate-400 py-8">
                  Loading Index Funds analysis...
                </div>
              ) : topIndexFundStory ? (
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
              ) : (
                <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-6">
                  <p className="text-gray-600 dark:text-slate-400">No Index Fund analysis available. Click "Refresh News" to fetch the latest updates.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl p-6 h-[600px] flex flex-col sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Headlines</h3>
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-3 flex flex-wrap gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">Reuters</span>
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">CNBC</span>
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">MarketWatch</span>
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded">Bloomberg</span>
                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded">Financial Times</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {isLoadingHeadlines ? (
                    <div className="text-center text-gray-600 dark:text-slate-400 py-4">
                      Loading headlines...
                    </div>
                  ) : recentHeadlines && recentHeadlines.length > 0 ? (
                    recentHeadlines.map((item, index) => (
                      <div key={`headline-${item.id}-${index}`} className="bg-gray-50 border border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-900 dark:text-white text-sm font-medium line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer flex-1"
                          >
                            {item.title}
                          </a>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors flex-shrink-0 bg-slate-600/50 hover:bg-slate-600 px-2 py-1 rounded"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-slate-400 mb-3">
                          {formatPublishTime(item.published_at)}
                        </div>
                        <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3">
                          <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
                            <span className="text-cyan-400 font-medium">Summary:</span> {generateSimpleSummary(item)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-600 dark:text-slate-400 py-4">
                      <p>No headlines available.</p>
                      <p className="text-sm mt-2">Click "Refresh News" to load articles.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
