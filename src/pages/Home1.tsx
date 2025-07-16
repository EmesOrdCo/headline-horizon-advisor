
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import { useNews } from "@/hooks/useNews";
import { useRSSHeadlines } from "@/hooks/useRSSHeadlines";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useSEO } from "@/hooks/useSEO";

const Home1 = () => {
  useSEO({
    title: "Home1 - Reuters Style Market Dashboard",
    description: "Reuters-style market news dashboard with integrated headlines, Magnificent 7 stocks, and index funds analysis.",
    canonical: "https://yourdomain.com/home1",
    ogType: "website"
  });
  
  const { data: newsData, isLoading } = useNews();
  const { data: headlines } = useRSSHeadlines();
  const { data: stockPrices, isLoading: isPricesLoading } = useStockPrices();

  const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
  const MAJOR_INDEX_FUNDS = ['SPY', 'QQQ', 'DIA'];

  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(stock => stock.symbol === symbol);
  };

  // Categorize headlines based on content
  const categorizeHeadlines = (headlines: any[]) => {
    const techKeywords = ['apple', 'microsoft', 'google', 'alphabet', 'amazon', 'nvidia', 'tesla', 'meta', 'facebook', 'tech', 'ai', 'artificial intelligence', 'chip', 'semiconductor'];
    const marketKeywords = ['market', 'index', 'spy', 'nasdaq', 'dow', 'trading', 'stocks', 'etf'];
    
    const magnificentHeadlines = headlines.filter(headline => 
      techKeywords.some(keyword => 
        headline.title.toLowerCase().includes(keyword) || 
        headline.description?.toLowerCase().includes(keyword)
      )
    );
    
    const indexHeadlines = headlines.filter(headline => 
      marketKeywords.some(keyword => 
        headline.title.toLowerCase().includes(keyword) || 
        headline.description?.toLowerCase().includes(keyword)
      ) && !magnificentHeadlines.includes(headline)
    );
    
    return { magnificentHeadlines, indexHeadlines };
  };

  const { magnificentHeadlines, indexHeadlines } = headlines ? categorizeHeadlines(headlines) : { magnificentHeadlines: [], indexHeadlines: [] };

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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36 p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Reuters Style Market News</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">LIVE • Auto-updating every minute</span>
            </div>
          </div>
          
          {!isPricesLoading && (!stockPrices || stockPrices.length === 0) && (
            <div className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">
              ⚠️ Asset prices unavailable - check Finnhub API connection
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Magnificent 7 Section with Related Headlines */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Magnificent 7</h2>
                  <Badge className="bg-blue-500 text-white w-fit">Top Analysis</Badge>
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
                  <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">No Magnificent 7 analysis available. Updates will appear automatically.</p>
                </div>
              )}
            </div>

            {/* Related Tech Headlines */}
            {magnificentHeadlines.length > 0 && (
              <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Related Tech Headlines
                </h3>
                <div className="space-y-3">
                  {magnificentHeadlines.slice(0, 4).map((headline, index) => (
                    <div key={`tech-${index}`} className="group cursor-pointer border-b border-gray-100 dark:border-slate-700 pb-3 last:border-b-0">
                      <a 
                        href={headline.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {headline.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-500">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(headline.published_at)}
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Index Funds Section with Related Headlines */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Index Funds</h2>
                  <Badge className="bg-purple-500 text-white w-fit">Top Analysis</Badge>
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
                  <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">No Index Fund analysis available. Updates will appear automatically.</p>
                </div>
              )}
            </div>

            {/* Related Market Headlines */}
            {indexHeadlines.length > 0 && (
              <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Related Market Headlines
                </h3>
                <div className="space-y-3">
                  {indexHeadlines.slice(0, 4).map((headline, index) => (
                    <div key={`market-${index}`} className="group cursor-pointer border-b border-gray-100 dark:border-slate-700 pb-3 last:border-b-0">
                      <a 
                        href={headline.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {headline.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-500">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(headline.published_at)}
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray-400 dark:text-slate-500 group-hover:text-purple-500 transition-colors flex-shrink-0 mt-1" />
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home1;
