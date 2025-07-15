
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import MarketTicker from "@/components/MarketTicker";
import StockSelection from "@/components/StockSelection";
import NewsAnalysisDisplay from "@/components/NewsAnalysisDisplay";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useUserStockPrices } from "@/hooks/useUserStockPrices";
import { Loader2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

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
    canonical: "https://yourdomain.com/my-stocks"
  });
  
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
            <p className="text-slate-400">Select up to 3 stocks to track and analyze with Marketaux news</p>
            {stockPricesLoading && <p className="text-yellow-400 text-sm">Loading stock prices...</p>}
            {stockPricesError && <p className="text-red-400 text-sm">Error loading stock prices</p>}
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
