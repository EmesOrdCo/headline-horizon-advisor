import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import StockCard from "@/components/StockCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStockPrices } from "@/hooks/useUserStockPrices";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import StockSearch from "@/components/StockSearch";

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

  // Use the dedicated user stock prices hook
  const userStockSymbols = userStocks.map(stock => stock.symbol);
  const { data: stockPrices, isLoading: stockPricesLoading, error: stockPricesError } = useUserStockPrices(userStockSymbols);

  // Add console logs for debugging
  console.log('User stocks:', userStocks);
  console.log('User stock symbols:', userStockSymbols);
  console.log('Stock prices data:', stockPrices);
  console.log('Stock prices loading:', stockPricesLoading);
  console.log('Stock prices error:', stockPricesError);

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
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-36 p-6 max-w-7xl mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Stocks</h1>
            <p className="text-slate-400">Select up to 3 stocks to track and analyze with Marketaux news</p>
            {stockPricesLoading && <p className="text-yellow-400 text-sm">Loading stock prices...</p>}
            {stockPricesError && <p className="text-red-400 text-sm">Error loading stock prices</p>}
          </div>

          <StockSearch
            userStocks={userStocks}
            selectedStock={selectedStock}
            onSelectedStockChange={setSelectedStock}
            onAddStock={addStock}
            onRemoveStock={removeStock}
            onAnalyzeStocks={analyzeStocks}
            analyzing={analyzing}
            stockPrices={stockPrices}
          />

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-2">Stocks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userStocks.map(stock => (
                <StockCard
                  key={stock.id}
                  symbol={stock.symbol}
                  price={stockPrices.find(price => price.symbol === stock.symbol)?.price}
                  onRemoveStock={() => removeStock(stock.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyStocks;
