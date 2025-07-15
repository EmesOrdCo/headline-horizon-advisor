import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import RSSHeadlines from "@/components/RSSHeadlines";
import { useNews, useFetchNews } from "@/hooks/useNews";
import { useFetchRSSNews } from "@/hooks/useRSSHeadlines";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { data: newsData, isLoading, refetch } = useNews();
  const { data: stockPrices, isLoading: isPricesLoading } = useStockPrices();
  const fetchNews = useFetchNews();
  const fetchRSSNews = useFetchRSSNews();
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

  const topMagnificent7Story = MAGNIFICENT_7.map(symbol => {
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

  const generateCompositeHeadline = (item: any, existingHeadlines: string[] = []): string => {
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
      } else if (titles.some(t => t.includes('chip') || t.includes('semiconductor'))) {
        summary = sentiment === 'bullish' ? 'Chip demand supports outlook' : 'Semiconductor headwinds emerge';
      } else if (titles.some(t => t.includes('cloud') || t.includes('enterprise'))) {
        summary = sentiment === 'bullish' ? 'Cloud growth accelerates' : 'Enterprise spending slows';
      } else {
        summary = sentiment === 'bullish' ? 'Positive developments support growth' : 'Market challenges create headwinds';
      }
    } else {
      summary = sentiment === 'bullish' ? 'Positive momentum continues' : 'Market pressures weigh on stock';
    }

    return `${symbol}: ${summary}`;
  };

  const handleRefreshNews = async () => {
    setIsFetching(true);
    setFetchingStatus('');
    
    try {
      console.log('🔄 Starting news refresh...');
      
      const [stockResult, rssResult] = await Promise.allSettled([
        fetchNews(),
        fetchRSSNews()
      ]);
      
      setTimeout(async () => {
        await refetch();
        console.log('🔄 Refetched news data');
      }, 2000);
      
      const successCount = 
        (stockResult.status === 'fulfilled' && stockResult.value.success ? 1 : 0) +
        (rssResult.status === 'fulfilled' && rssResult.value.success ? 1 : 0);
      
      if (successCount > 0) {
        toast({
          title: "News Updated",
          description: `Successfully fetched from ${successCount} source${successCount > 1 ? 's' : ''}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch news from any source. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error refreshing news:', error);
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

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36 p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Live Market News</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">LIVE</span>
              </div>
            </div>
            <Button 
              onClick={handleRefreshNews}
              disabled={isFetching}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Fetching...' : 'Refresh News'}
            </Button>
          </div>
          
          {isFetching && fetchingStatus && (
            <div className="text-amber-600 dark:text-yellow-400 text-sm mt-2 font-medium">
              {fetchingStatus}
            </div>
          )}
          
          
          {!isPricesLoading && (!stockPrices || stockPrices.length === 0) && (
            <div className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">
              ⚠️ Asset prices unavailable - check Finnhub API connection
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Magnificent 7 Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Magnificent 7</h2>
                  <Badge className="bg-blue-500 text-white w-fit">Top Story</Badge>
                </div>
                <Link to="/magnificent-7" className="w-full sm:w-auto">
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-full sm:w-auto">
                    <span className="hidden sm:inline">View All 7 Stocks</span>
                    <span className="sm:hidden">View All</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {isLoading ? (
                <div className="text-center text-gray-600 dark:text-slate-400 py-6 sm:py-8">
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
                <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-4 sm:p-6">
                  <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">No Magnificent 7 analysis available. Click "Refresh News" to fetch the latest updates.</p>
                </div>
              )}
            </div>

            {/* Index Funds Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Index Funds</h2>
                  <Badge className="bg-purple-500 text-white w-fit">Top Story</Badge>
                </div>
                <Link to="/index-funds" className="w-full sm:w-auto">
                  <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 w-full sm:w-auto">
                    <span className="hidden sm:inline">View All Index Funds</span>
                    <span className="sm:hidden">View All</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {isLoading ? (
                <div className="text-center text-gray-600 dark:text-slate-400 py-6 sm:py-8">
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
                <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-4 sm:p-6">
                  <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">No Index Fund analysis available. Click "Refresh News" to fetch the latest updates.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <RSSHeadlines />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
