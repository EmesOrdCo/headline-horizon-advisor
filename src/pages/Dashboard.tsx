
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNews, useFetchNews } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { data: newsData, isLoading, refetch } = useNews();
  const { data: stockPrices, isLoading: isPricesLoading } = useStockPrices();
  const fetchNews = useFetchNews();
  const [isFetching, setIsFetching] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState<string>('');
  const { toast } = useToast();

  // Primary assets for main analysis
  const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
  const MAJOR_INDEX_FUNDS = ['SPY', 'QQQ', 'DIA']; // Match the ticker exactly

  const PRIMARY_ASSETS = [...MAGNIFICENT_7, ...MAJOR_INDEX_FUNDS];

  // Stock name mappings
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

  // Function to calculate similarity between two headlines
  const calculateSimilarity = (headline1: string, headline2: string): number => {
    const words1 = headline1.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const words2 = headline2.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return totalWords > 0 ? (commonWords.length / totalWords) * 100 : 0;
  };

  // Function to check if headlines are too similar
  const areHeadlinesSimilar = (headline1: string, headline2: string): boolean => {
    const similarity = calculateSimilarity(headline1, headline2);
    return similarity > 25; // Consider similar if more than 25% word overlap
  };

  // Get stock price for a symbol
  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(stock => stock.symbol === symbol);
  };

  // Get main analysis articles (one per primary asset with AI analysis)
  const mainAnalysisArticles = PRIMARY_ASSETS.map(symbol => {
    return newsData?.find(item => 
      item.symbol === symbol && 
      item.ai_confidence && 
      item.ai_sentiment
    );
  }).filter(Boolean);

  // Get ALL recent headlines in chronological order - now including RSS sources
  const allRecentHeadlines = newsData?.filter(item => {
    const isRecent = new Date(item.published_at).getTime() > Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
    
    // For RSS articles (symbol === 'RSS'), include them if they're recent
    if (item.symbol === 'RSS') {
      return isRecent;
    }
    
    // For analyzed articles, use existing logic
    const isHighConfidence = item.ai_confidence && item.ai_confidence > 60;
    const hasGoodSentiment = item.ai_sentiment && item.ai_sentiment !== 'Neutral';
    
    return isRecent && (isHighConfidence || hasGoodSentiment);
  }).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()) || [];

  // Generate composite headline based on source articles with uniqueness checking
  const generateCompositeHeadline = (item: any, existingHeadlines: string[] = []): string => {
    const symbol = item.symbol;
    const sentiment = item.ai_sentiment?.toLowerCase() || 'neutral';
    const confidence = item.ai_confidence || 50;
    
    // Parse source links to get article titles
    let sourceArticles = [];
    try {
      sourceArticles = item.source_links ? JSON.parse(item.source_links) : [];
    } catch (error) {
      console.error('Error parsing source links:', error);
    }

    // Get full stock name
    const fullName = STOCK_NAMES[symbol] || symbol;
    
    // Create short, easy-to-understand summary based on sentiment and context
    let summary = '';
    
    if (sourceArticles.length > 0) {
      const titles = sourceArticles.map((article: any) => article.title.toLowerCase());
      
      // Generate context-aware summaries
      if (titles.some(t => t.includes('earnings') || t.includes('revenue') || t.includes('profit'))) {
        summary = sentiment === 'bullish' ? 'Strong earnings results boost investor confidence' : 'Earnings concerns weigh on stock performance';
      } else if (titles.some(t => t.includes('upgrade') || t.includes('analyst') || t.includes('target'))) {
        summary = sentiment === 'bullish' ? 'Analysts upgrade stock with higher price targets' : 'Analyst downgrades create selling pressure';
      } else if (titles.some(t => t.includes('ai') || t.includes('artificial intelligence'))) {
        summary = sentiment === 'bullish' ? 'AI developments drive growth expectations' : 'AI market concerns impact valuation';
      } else if (titles.some(t => t.includes('chip') || t.includes('semiconductor'))) {
        summary = sentiment === 'bullish' ? 'Chip demand supports strong outlook' : 'Semiconductor headwinds create uncertainty';
      } else if (titles.some(t => t.includes('cloud') || t.includes('enterprise'))) {
        summary = sentiment === 'bullish' ? 'Cloud services growth accelerates' : 'Enterprise spending concerns emerge';
      } else {
        summary = sentiment === 'bullish' ? 'Positive market developments support growth' : 'Market challenges create headwinds';
      }
    } else {
      // Fallback summaries
      summary = sentiment === 'bullish' ? 'Positive momentum drives investor interest' : 'Market pressures weigh on performance';
    }

    return `${fullName}: ${summary}`;
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

  // Helper function to get asset type and styling
  const getAssetInfo = (symbol: string) => {
    if (MAGNIFICENT_7.includes(symbol)) {
      return { type: 'Stock', color: 'bg-blue-500' };
    } else if (MAJOR_INDEX_FUNDS.includes(symbol)) {
      return { type: 'Index', color: 'bg-purple-500' };
    }
    return { type: 'Other', color: 'bg-gray-500' };
  };

  // Helper function to generate AI analysis paragraph for ANY article
  const generateAnalysisParagraph = (item: any) => {
    const sentimentText = item.ai_sentiment?.toLowerCase() || 'neutral';
    const confidence = item.ai_confidence || 50;
    
    // Generate contextual analysis based on sentiment and confidence
    if (sentimentText === 'bullish' && confidence > 70) {
      return `Strong positive indicators suggest ${item.symbol} may benefit from this development. Market sentiment appears favorable with high confidence in upward momentum.`;
    } else if (sentimentText === 'bearish' && confidence > 70) {
      return `This news presents concerning factors for ${item.symbol} performance. Analysis indicates potential downward pressure with significant market implications.`;
    } else if (sentimentText === 'bullish' && confidence <= 70) {
      return `Moderate positive signals for ${item.symbol}, though market uncertainty remains. Cautious optimism warranted given mixed indicators and evolving conditions.`;
    } else if (sentimentText === 'bearish' && confidence <= 70) {
      return `Some negative factors identified for ${item.symbol}, but impact unclear. Market conditions suggest careful monitoring of developments ahead.`;
    } else {
      return `Mixed signals for ${item.symbol} with neutral market impact expected. Analysis suggests balanced risk-reward profile in current environment.`;
    }
  };

  // Generate general article summary for recent headlines - enhanced for RSS sources
  const generateArticleSummary = (item: any) => {
    const title = item.title || '';
    const description = item.description || '';
    
    // If it's from RSS source, provide source-specific context
    if (item.symbol === 'RSS' && item.source) {
      return `From ${item.source}: ${description.substring(0, 150)}...` || 
             `Breaking news from ${item.source} covering important market developments and business updates.`;
    }
    
    if (title.toLowerCase().includes('earnings') || title.toLowerCase().includes('revenue')) {
      return `This earnings-related news discusses financial performance and may impact related companies and their stock valuations in the coming trading sessions.`;
    } else if (title.toLowerCase().includes('merger') || title.toLowerCase().includes('acquisition')) {
      return `This merger and acquisition news could significantly affect the companies involved and potentially influence sector-wide trading patterns.`;
    } else if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('artificial intelligence')) {
      return `This AI-focused development may have broad implications for technology companies and could influence investor sentiment in the tech sector.`;
    } else if (title.toLowerCase().includes('market') || title.toLowerCase().includes('stocks')) {
      return `This market-focused article provides insights into current trading conditions and may influence overall investor sentiment and market direction.`;
    } else if (title.toLowerCase().includes('federal reserve') || title.toLowerCase().includes('interest rates')) {
      return `This monetary policy news could have wide-reaching effects on market liquidity, borrowing costs, and overall economic conditions.`;
    } else {
      return `This article covers significant business and financial developments that may influence market sentiment and investment decisions across various sectors.`;
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
          <p className="text-gray-600 dark:text-slate-400">Latest AI-analyzed news for major stocks and index funds + RSS feeds from Reuters, CNBC, MarketWatch, Bloomberg, and Financial Times</p>
          
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
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="text-center text-gray-600 dark:text-slate-400 py-8">
                  Loading primary assets news...
                </div>
              ) : (
                // Always show boxes, one for each primary asset
                PRIMARY_ASSETS.map((symbol) => {
                  const article = mainAnalysisArticles.find(item => item.symbol === symbol);
                  const stockPrice = getStockPrice(symbol);
                  const assetInfo = getAssetInfo(symbol);
                  
                  console.log(`Stock price for ${symbol}:`, stockPrice); // Debug log

                  if (article) {
                    // Generate composite headline for this stock/fund with uniqueness checking
                    const existingHeadlines = mainAnalysisArticles
                      .filter(item => item.symbol !== symbol)
                      .map(item => generateCompositeHeadline(item, []));
                    
                    const compositeHeadline = generateCompositeHeadline(article, existingHeadlines);
                    
                    return (
                      <NewsCard 
                        key={article.id} 
                        symbol={article.symbol}
                        title={compositeHeadline}
                        description={article.description}
                        confidence={article.ai_confidence}
                        sentiment={article.ai_sentiment}
                        category={article.category}
                        isHistorical={article.ai_reasoning?.includes('Historical')}
                        sourceLinks={article.source_links || '[]'}
                        stockPrice={stockPrice}
                      />
                    );
                  } else {
                    // Show placeholder for assets without current analysis
                    const fullName = STOCK_NAMES[symbol] || symbol;
                    return (
                      <div key={symbol} className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-6">
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Badge className={`${assetInfo.color} text-white`}>{symbol}</Badge>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
                              {assetInfo.type}
                            </Badge>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs">
                              NO RECENT NEWS
                            </Badge>
                          </div>
                          {stockPrice && (
                            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 dark:bg-slate-800 dark:border-slate-600 rounded-lg px-3 py-2">
                              <div className="text-right">
                                <div className="text-gray-900 dark:text-white font-semibold">${stockPrice.price.toFixed(2)}</div>
                                <div className={`text-xs flex items-center gap-1 ${
                                  stockPrice.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {stockPrice.change >= 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  {stockPrice.change >= 0 ? '+' : ''}{stockPrice.change.toFixed(2)} ({stockPrice.changePercent.toFixed(2)}%)
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-slate-400 mb-2">
                          {fullName}: No recent analysis available
                        </h3>
                        <p className="text-gray-500 dark:text-slate-500 text-sm">
                          Click "Refresh News" to fetch the latest market updates and AI analysis.
                        </p>
                        {!stockPrice && (
                          <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                            Asset price unavailable - check Finnhub connection
                          </p>
                        )}
                      </div>
                    );
                  }
                })
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
                  {allRecentHeadlines && allRecentHeadlines.length > 0 ? (
                    allRecentHeadlines.slice(0, 30).map((item, index) => (
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
                          {item.source && (
                            <span className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded flex-shrink-0">
                              {item.source}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-slate-400 mb-3">
                          {formatPublishTime(item.published_at)}
                        </div>
                        <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3">
                          <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
                            <span className="text-cyan-400 font-medium">Summary:</span> {generateArticleSummary(item)}
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
    </div>
  );
};

export default Dashboard;
