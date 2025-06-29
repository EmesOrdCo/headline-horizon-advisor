import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import StockSearch from "@/components/StockSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useStockPrices } from "@/hooks/useStockPrices";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

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
  const [userStocks, setUserStocks] = useState<UserStock[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedStock, setSelectedStock] = useState("");

  // Pass user stock symbols to the hook
  const userStockSymbols = userStocks.map(stock => stock.symbol);
  const { data: stockPrices } = useStockPrices(userStockSymbols);

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
    if (!selectedStock || userStocks.length >= 3) return;

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

  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(price => price.symbol === symbol);
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
      <div className="pt-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Stocks</h1>
            <p className="text-slate-400">Select up to 3 stocks to track and analyze with Marketaux news</p>
          </div>

          {/* Stock Selection */}
          <Card className="mb-8 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Stock Selection ({userStocks.length}/3)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <StockSearch
                    value={selectedStock}
                    onValueChange={setSelectedStock}
                    excludedSymbols={userStocks.map(stock => stock.symbol)}
                  />
                </div>
                <Button 
                  onClick={addStock} 
                  disabled={!selectedStock || userStocks.length >= 3}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Add Stock
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {userStocks.map((stock) => {
                  const stockPrice = getStockPrice(stock.symbol);
                  return (
                    <div key={stock.id} className="flex items-center gap-3 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2">
                      <Badge variant="secondary" className="bg-slate-700 text-white">
                        {stock.symbol}
                      </Badge>
                      
                      {stockPrice && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-white font-semibold">
                            ${stockPrice.price.toFixed(2)}
                          </span>
                          <div className={`flex items-center gap-1 ${
                            stockPrice.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {stockPrice.change >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span className="text-xs">
                              {stockPrice.change >= 0 ? '+' : ''}{stockPrice.change.toFixed(2)} ({stockPrice.changePercent.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => removeStock(stock.id)}
                        className="ml-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              {userStocks.length > 0 && (
                <Button 
                  onClick={analyzeStocks} 
                  disabled={analyzing}
                  className="mt-4 bg-cyan-600 hover:bg-cyan-700"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Stocks'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* News Analysis Display */}
          {userStocks.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Marketaux News Analysis</h2>
              
              {userStocks.map((stock) => {
                const stockArticles = newsArticles.filter(article => article.symbol === stock.symbol);
                const stockPrice = getStockPrice(stock.symbol);
                
                if (stockArticles.length === 0) {
                  return (
                    <Card key={stock.symbol} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="text-center py-12">
                        <p className="text-slate-400 mb-4">No analysis available for {stock.symbol}</p>
                        <p className="text-sm text-slate-500">Click "Analyze Stocks" to fetch latest Marketaux news</p>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <div key={stock.symbol} className="space-y-4">
                    {stockArticles.map((article) => (
                      <NewsCard
                        key={article.id}
                        symbol={article.symbol}
                        title={article.title}
                        description={article.description}
                        confidence={article.ai_confidence}
                        sentiment={article.ai_sentiment}
                        category={article.category}
                        sourceLinks={article.source_links}
                        stockPrice={stockPrice ? {
                          price: stockPrice.price,
                          change: stockPrice.change,
                          changePercent: stockPrice.changePercent
                        } : undefined}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {userStocks.length === 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="text-center py-12">
                <p className="text-slate-400 mb-4">No stocks selected yet</p>
                <p className="text-sm text-slate-500">Search and add up to 3 stocks to start tracking and analyzing Marketaux news</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyStocks;
