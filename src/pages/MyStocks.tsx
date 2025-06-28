
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";

const AVAILABLE_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "AMD", name: "Advanced Micro Devices" },
  { symbol: "CRM", name: "Salesforce Inc." }
];

interface UserStock {
  id: string;
  symbol: string;
  created_at: string;
}

interface StockArticle {
  id: string;
  symbol: string;
  title: string;
  description: string;
  url: string;
  published_at: string;
  ai_sentiment: string;
  ai_confidence: number;
  ai_reasoning: string;
}

const MyStocks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userStocks, setUserStocks] = useState<UserStock[]>([]);
  const [stockArticles, setStockArticles] = useState<StockArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedStock, setSelectedStock] = useState("");

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
        fetchStockArticles(data.map(stock => stock.symbol));
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

  const fetchStockArticles = async (symbols: string[]) => {
    try {
      const { data, error } = await supabase
        .from('user_stock_articles')
        .select('*')
        .eq('user_id', user?.id)
        .in('symbol', symbols)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setStockArticles(data || []);
    } catch (error) {
      console.error('Error fetching stock articles:', error);
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
        description: "Stock added successfully",
      });

      setSelectedStock("");
      fetchUserStocks();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast({
        title: "Error",
        description: "Failed to add stock",
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
      fetchStockArticles(userStocks.map(stock => stock.symbol));
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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const availableStocks = AVAILABLE_STOCKS.filter(
    stock => !userStocks.some(userStock => userStock.symbol === stock.symbol)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <DashboardNav />
        <div className="pt-20 px-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardNav />
      <div className="pt-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Stocks</h1>
            <p className="text-slate-600">Select up to 3 stocks to track and analyze</p>
          </div>

          {/* Stock Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Stock Selection ({userStocks.length}/3)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Select value={selectedStock} onValueChange={setSelectedStock}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stock to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStocks.map((stock) => (
                        <SelectItem key={stock.symbol} value={stock.symbol}>
                          {stock.symbol} - {stock.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={addStock} 
                  disabled={!selectedStock || userStocks.length >= 3}
                >
                  Add Stock
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {userStocks.map((stock) => (
                  <Badge key={stock.id} variant="secondary" className="flex items-center gap-2">
                    {stock.symbol}
                    <button
                      onClick={() => removeStock(stock.id)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              {userStocks.length > 0 && (
                <Button 
                  onClick={analyzeStocks} 
                  disabled={analyzing}
                  className="mt-4"
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

          {/* Articles Analysis */}
          {stockArticles.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Recent News Analysis</h2>
              
              {userStocks.map((stock) => {
                const stockArticlesList = stockArticles.filter(article => article.symbol === stock.symbol);
                
                if (stockArticlesList.length === 0) return null;

                const overallSentiment = stockArticlesList.reduce((acc, article) => {
                  const sentiment = article.ai_sentiment?.toLowerCase();
                  if (sentiment === 'positive') acc.positive++;
                  else if (sentiment === 'negative') acc.negative++;
                  else acc.neutral++;
                  return acc;
                }, { positive: 0, negative: 0, neutral: 0 });

                const dominantSentiment = 
                  overallSentiment.positive > overallSentiment.negative ? 'positive' :
                  overallSentiment.negative > overallSentiment.positive ? 'negative' : 'neutral';

                return (
                  <Card key={stock.symbol}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {stock.symbol}
                          {getSentimentIcon(dominantSentiment)}
                        </CardTitle>
                        <Badge className={getSentimentColor(dominantSentiment)}>
                          Overall: {dominantSentiment}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {stockArticlesList.slice(0, 5).map((article) => (
                          <div key={article.id} className="border-l-4 border-slate-200 pl-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-slate-900 flex-1">
                                <a 
                                  href={article.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600"
                                >
                                  {article.title}
                                </a>
                              </h4>
                              <div className="flex items-center gap-2 ml-4">
                                {getSentimentIcon(article.ai_sentiment)}
                                <Badge className={getSentimentColor(article.ai_sentiment)}>
                                  {article.ai_sentiment}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{article.description}</p>
                            {article.ai_reasoning && (
                              <p className="text-sm text-slate-500 italic">
                                AI Analysis: {article.ai_reasoning}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {userStocks.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-600 mb-4">No stocks selected yet</p>
                <p className="text-sm text-slate-500">Add up to 3 stocks to start tracking and analyzing news</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyStocks;
