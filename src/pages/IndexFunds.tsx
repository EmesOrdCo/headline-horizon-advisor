import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import { useNews, useFetchNews } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";

const IndexFunds = () => {
  useSEO({
    title: "Index Funds Analysis & Market Insights",
    description: "AI-powered analysis of major market index funds including SPY, QQQ, and DIA. Get comprehensive insights into market trends and index fund performance.",
    canonical: "https://yourdomain.com/index-funds",
    ogType: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Index Funds Analysis & Market Insights",
      "description": "AI-powered analysis of major market index funds",
      "author": {
        "@type": "Organization",
        "name": "MarketSensorAI"
      },
      "publisher": {
        "@type": "Organization",
        "name": "MarketSensorAI",
        "url": "https://yourdomain.com"
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://yourdomain.com/index-funds"
      },
      "about": [
        { "@type": "InvestmentFund", "name": "SPDR S&P 500 ETF Trust", "tickerSymbol": "SPY" },
        { "@type": "InvestmentFund", "name": "Invesco QQQ Trust", "tickerSymbol": "QQQ" },
        { "@type": "InvestmentFund", "name": "SPDR Dow Jones Industrial Average ETF Trust", "tickerSymbol": "DIA" }
      ]
    }
  });
  const { data: newsData, isLoading, refetch } = useNews();
  const { data: stockPrices } = useStockPrices();
  const fetchNews = useFetchNews();
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();

  const MAJOR_INDEX_FUNDS = ['SPY', 'QQQ', 'DIA'];

  const STOCK_NAMES: { [key: string]: string } = {
    'SPY': 'SPDR S&P 500 ETF Trust',
    'QQQ': 'Invesco QQQ Trust',
    'DIA': 'SPDR Dow Jones Industrial Average ETF Trust'
  };

  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(stock => stock.symbol === symbol);
  };

  const indexFundArticles = MAJOR_INDEX_FUNDS.map(symbol => {
    return newsData?.find(item => 
      item.symbol === symbol && 
      item.ai_confidence && 
      item.ai_sentiment
    );
  }).filter(Boolean);

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
      
      if (titles.some(t => t.includes('fed') || t.includes('interest') || t.includes('rate'))) {
        summary = sentiment === 'bullish' ? 'Fed policy supports markets' : 'Rate concerns pressure indices';
      } else if (titles.some(t => t.includes('market') || t.includes('index') || t.includes('trading'))) {
        summary = sentiment === 'bullish' ? 'Strong market momentum' : 'Market volatility increases';
      } else {
        summary = sentiment === 'bullish' ? 'Positive market outlook' : 'Market headwinds emerge';
      }
    } else {
      summary = sentiment === 'bullish' ? 'Index showing strength' : 'Index faces pressure';
    }

    return `${symbol}: ${summary}`;
  };

  const handleRefreshNews = async () => {
    setIsFetching(true);
    
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
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      {/* Market Ticker */}
      <div className="pt-16">
        <MarketTicker />
      </div>
      
      <div className="pt-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between">
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={handleRefreshNews}
                  disabled={isFetching}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                  {isFetching ? 'Fetching...' : 'Refresh News'}
                </Button>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Index Funds</h1>
                <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">AI-analyzed news for major market index funds</p>
              </div>
            </div>
          </div>

        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="text-center text-gray-600 dark:text-slate-400 py-8">
              Loading Index Funds analysis...
            </div>
          ) : (
            MAJOR_INDEX_FUNDS.map((symbol) => {
              const article = indexFundArticles.find(item => item.symbol === symbol);
              const stockPrice = getStockPrice(symbol);
              
              if (article) {
                const compositeHeadline = generateCompositeHeadline(article);
                
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
                return (
                  <div key={symbol} className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500 text-white">{symbol}</Badge>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs">
                          NO RECENT NEWS
                        </Badge>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-slate-400 mb-2">
                      {symbol}: No recent analysis available
                    </h3>
                    <p className="text-gray-500 dark:text-slate-500 text-sm">
                      Click "Refresh News" to fetch the latest market updates and AI analysis.
                    </p>
                  </div>
                );
              }
            })
          )}
        </div>

        {/* Crypto Coming Soon Section */}
        <div className="mt-12 mb-8">
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
        </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default IndexFunds;
