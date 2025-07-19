import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import MarketTicker from "@/components/MarketTicker";
import StockSelection from "@/components/StockSelection";
import NewsAnalysisDisplay from "@/components/NewsAnalysisDisplay";
import Footer from "@/components/Footer";
import RealTimeStockCard from "@/components/RealTimeStockCard";
import RealTimePriceChart from "@/components/RealTimePriceChart";
import { useToast } from "@/hooks/use-toast";
import { useUserStockPrices } from "@/hooks/useUserStockPrices";
import { useAlpacaStream } from "@/hooks/useAlpacaStream";
import { Loader2, BarChart3 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserStock {
  id: string;
  symbol: string;
  created_at: string;
}

interface NewsArticle {
  id: string;
  symbol: string;
  title: string;
  description: string;
  url: string;
  published_at: string;
  ai_sentiment: string;
  ai_confidence: number;
  ai_reasoning: string;
  source_links: string;
  category?: string;
}

const MyStocks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  useSEO({
    title: "My Stock Portfolio",
    description: "Track and analyze your personal stock portfolio with AI-powered insights. Get customized news analysis and market sentiment for your selected stocks.",
    canonical: "https://yourdomain.com/my-stocks",
    ogType: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "My Stock Portfolio",
      "description": "Personal stock portfolio tracking with AI analysis",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    }
  });
  
  const [userStocks, setUserStocks] = useState<UserStock[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedStock, setSelectedStock] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [priceHistory, setPriceHistory] = useState<Record<string, Array<{timestamp: string, price: number, symbol: string}>>({});

  // Use the dedicated user stock prices hook for fallback
  const userStockSymbols = userStocks.map(stock => stock.symbol);
  const { data: stockPrices, isLoading: stockPricesLoading, error: stockPricesError } = useUserStockPrices(userStockSymbols);

  // Use the real-time streaming hook - fix the destructuring
  const streamHookResult = useAlpacaStream({
    symbols: userStockSymbols,
    enabled: userStocks.length > 0
  });
  
  const { isConnected, isAuthenticated, connectionStatus, streamData, connect, disconnect } = streamHookResult;

  // Store price history for charts
  useEffect(() => {
    Object.entries(streamData).forEach(([symbol, data]) => {
      if (data.price && data.timestamp) {
        setPriceHistory(prev => ({
          ...prev,
          [symbol]: [
            ...(prev[symbol] || []).slice(-99), // Keep last 100 points
            {
              timestamp: data.timestamp,
              price: data.price,
              symbol: symbol
            }
          ]
        }));
      }
    });
  }, [streamData]);

  useEffect(() => {
    if (user) {
      fetchUserStocks();
    }
  }, [user]);

  const fetchUserStocks = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stocks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched user stocks:', data);
      setUserStocks(data || []);
      
      if (data && data.length > 0) {
        // Automatically fetch articles when stocks are loaded
        await fetchNewsArticles(data.map(stock => stock.symbol));
      }
    } catch (error) {
      console.error('Error fetching user stocks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your stocks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsArticles = async (symbols: string[]) => {
    try {
      // Get user-specific articles from Marketaux analysis
      const { data: userArticles, error: userError } = await supabase
        .from('user_stock_articles')
        .select('id, symbol, title, description, url, published_at, ai_sentiment, ai_confidence, ai_reasoning, source_links')
        .eq('user_id', user?.id)
        .in('symbol', symbols)
        .order('published_at', { ascending: false });

      if (userError) throw userError;

      // Transform the data to match NewsArticle interface
      const formattedArticles: NewsArticle[] = (userArticles || []).map(article => ({
        id: article.id,
        symbol: article.symbol,
        title: article.title || '',
        description: article.description || '',
        url: article.url || '',
        published_at: article.published_at || '',
        ai_sentiment: article.ai_sentiment || 'Neutral',
        ai_confidence: article.ai_confidence || 50,
        ai_reasoning: article.ai_reasoning || '',
        source_links: article.source_links || '[]',
        category: 'Marketaux Analysis'
      }));

      setNewsArticles(formattedArticles);
    } catch (error) {
      console.error('Error fetching news articles:', error);
    }
  };

  const addStock = async () => {
    if (!selectedStock) return;

    try {
      const { error } = await supabase
        .from('user_stocks')
        .insert([
          {
            user_id: user?.id,
            symbol: selectedStock
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedStock} added successfully`,
      });

      setSelectedStock("");
      fetchUserStocks();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast({
        title: "Error",
        description: "Failed to add stock. Please check if the symbol is valid.",
        variant: "destructive",
      });
    }
  };

  const removeStock = async (stockId: string) => {
    try {
      const { error } = await supabase
        .from('user_stocks')
        .delete()
        .eq('id', stockId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock removed successfully",
      });

      fetchUserStocks();
    } catch (error) {
      console.error('Error removing stock:', error);
      toast({
        title: "Error",
        description: "Failed to remove stock",
        variant: "destructive",
      });
    }
  };

  const analyzeStocks = async () => {
    if (userStocks.length === 0) return;

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-user-stocks', {
        body: {
          symbols: userStocks.map(stock => stock.symbol),
          userId: user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success", 
        description: "Stock analysis completed",
      });

      // Refresh articles after analysis
      fetchNewsArticles(userStocks.map(stock => stock.symbol));
    } catch (error) {
      console.error('Error analyzing stocks:', error);
      toast({
        title: "Error",
        description: "Failed to analyze stocks",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <DashboardNav />
        <div className="pt-32 px-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardNav />
      
      {/* Market Ticker */}
      <div className="pt-16">
        <MarketTicker />
      </div>
      
      <div className="pt-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Stocks</h1>
            <p className="text-slate-400">Track and analyze your stocks with real-time data and AI-powered insights</p>
            
            {/* Connection Status */}
            <div className="flex items-center gap-4 mt-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                connectionStatus === 'connected' && isAuthenticated ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20' :
                connectionStatus === 'connecting' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/20' :
                connectionStatus === 'error' ? 'bg-red-900/20 text-red-400 border border-red-500/20' :
                'bg-slate-700/50 text-slate-400 border border-slate-600'
              }`}>
                {connectionStatus === 'connected' && isAuthenticated ? '🟢 Live Data Connected' :
                 connectionStatus === 'connecting' ? '🟡 Connecting...' :
                 connectionStatus === 'error' ? '🔴 Connection Error' :
                 '⚫ Disconnected'}
              </div>
              
              {userStocks.length > 0 && (
                <Button
                  onClick={() => setShowChart(!showChart)}
                  variant="outline"
                  size="sm"
                  className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {showChart ? 'Hide Charts' : 'Show Charts'}
                </Button>
              )}
            </div>
            
            {stockPricesLoading && <p className="text-yellow-400 text-sm mt-2">Loading fallback stock prices...</p>}
            {stockPricesError && <p className="text-red-400 text-sm mt-2">Error loading fallback stock prices</p>}
          </div>

          <StockSelection
            userStocks={userStocks}
            selectedStock={selectedStock}
            onSelectedStockChange={setSelectedStock}
            onAddStock={addStock}
            onRemoveStock={removeStock}
            onAnalyzeStocks={analyzeStocks}
            analyzing={analyzing}
            stockPrices={stockPrices}
          />

          {/* Real-time Stock Display */}
          {userStocks.length > 0 && (
            <Card className="mb-8 bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  Real-Time Stock Prices
                  {isConnected && isAuthenticated && (
                    <span className="text-emerald-400 text-sm">● LIVE</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userStocks.map((stock) => (
                    <RealTimeStockCard
                      key={stock.id}
                      stock={stock}
                      streamData={streamData[stock.symbol]}
                      isConnected={isConnected && isAuthenticated}
                      onRemove={removeStock}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Real-time Charts */}
          {showChart && userStocks.length > 0 && (
            <Card className="mb-8 bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Live Price Charts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {userStocks.map((stock) => (
                    <div key={stock.id} className="bg-slate-700/30 rounded-lg p-4">
                      <RealTimePriceChart
                        data={priceHistory[stock.symbol] || []}
                        symbol={stock.symbol}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <NewsAnalysisDisplay
            userStocks={userStocks}
            newsArticles={newsArticles}
            stockPrices={stockPrices}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MyStocks;
