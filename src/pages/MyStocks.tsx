
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Plus, X, RefreshCw, ExternalLink } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { useUserStocks, useAddUserStock, useRemoveUserStock } from "@/hooks/useUserStocks";
import { useUserStockArticles, useFetchUserStockNews } from "@/hooks/useUserStockArticles";
import { useToast } from "@/hooks/use-toast";

const AVAILABLE_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX', 'SPY', 'QQQ', 'DIA'
];

const MyStocks = () => {
  const [selectedStock, setSelectedStock] = useState('');
  const { toast } = useToast();
  
  const { data: userStocks, isLoading: stocksLoading } = useUserStocks();
  const addStockMutation = useAddUserStock();
  const removeStockMutation = useRemoveUserStock();
  const { refetch: fetchNews, isFetching: fetchingNews } = useFetchUserStockNews();
  
  const symbols = userStocks?.map(stock => stock.symbol) || [];
  const { data: articles, isLoading: articlesLoading } = useUserStockArticles(symbols);

  const handleAddStock = async () => {
    if (!selectedStock) return;
    
    if (userStocks && userStocks.length >= 3) {
      toast({
        title: "Maximum reached",
        description: "You can only select up to 3 stocks",
        variant: "destructive"
      });
      return;
    }

    if (userStocks?.some(stock => stock.symbol === selectedStock)) {
      toast({
        title: "Stock already added",
        description: "This stock is already in your list",
        variant: "destructive"
      });
      return;
    }

    try {
      await addStockMutation.mutateAsync(selectedStock);
      setSelectedStock('');
      toast({
        title: "Stock added",
        description: `${selectedStock} has been added to your watchlist`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add stock",
        variant: "destructive"
      });
    }
  };

  const handleRemoveStock = async (stockId: string) => {
    try {
      await removeStockMutation.mutateAsync(stockId);
      toast({
        title: "Stock removed",
        description: "Stock has been removed from your watchlist",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove stock",
        variant: "destructive"
      });
    }
  };

  const handleFetchNews = async () => {
    if (!userStocks || userStocks.length === 0) {
      toast({
        title: "No stocks selected",
        description: "Please add some stocks to your watchlist first",
        variant: "destructive"
      });
      return;
    }

    try {
      await fetchNews();
      toast({
        title: "News updated",
        description: "Latest news has been fetched and analyzed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch news",
        variant: "destructive"
      });
    }
  };

  const getOverallSentiment = () => {
    if (!articles || articles.length === 0) return null;

    const sentimentCounts = articles.reduce((acc, article) => {
      const sentiment = article.ai_sentiment || 'Neutral';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominant = Object.entries(sentimentCounts).reduce((a, b) => 
      sentimentCounts[a[0]] > sentimentCounts[b[0]] ? a : b
    );

    return {
      sentiment: dominant[0],
      count: dominant[1],
      total: articles.length
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const overallSentiment = getOverallSentiment();

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Stocks</h1>
          <p className="text-slate-400">Track up to 3 stocks with AI-powered news analysis</p>
        </div>

        {/* Stock Selection */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Select Your Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              {userStocks?.map((stock) => (
                <div key={stock.id} className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2">
                  <Badge className="bg-blue-500 text-white">{stock.symbol}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveStock(stock.id)}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {(!userStocks || userStocks.length < 3) && (
              <div className="flex gap-2">
                <Select value={selectedStock} onValueChange={setSelectedStock}>
                  <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select a stock" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {AVAILABLE_STOCKS.filter(stock => 
                      !userStocks?.some(userStock => userStock.symbol === stock)
                    ).map((stock) => (
                      <SelectItem key={stock} value={stock} className="text-white">
                        {stock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddStock}
                  disabled={!selectedStock || addStockMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock
                </Button>
              </div>
            )}

            <div className="mt-4">
              <Button
                onClick={handleFetchNews}
                disabled={fetchingNews || !userStocks || userStocks.length === 0}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${fetchingNews ? 'animate-spin' : ''}`} />
                {fetchingNews ? 'Fetching News...' : 'Fetch Latest News'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Overall Sentiment */}
        {overallSentiment && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Overall Market Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge className={`${
                  overallSentiment.sentiment === 'Bullish' ? 'bg-emerald-500' :
                  overallSentiment.sentiment === 'Bearish' ? 'bg-red-500' :
                  'bg-gray-500'
                } text-white text-lg px-4 py-2`}>
                  {overallSentiment.sentiment.toUpperCase()}
                </Badge>
                <span className="text-slate-300">
                  Based on {overallSentiment.total} articles ({overallSentiment.count} {overallSentiment.sentiment.toLowerCase()})
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Articles */}
        <div className="space-y-6">
          {symbols.map((symbol) => {
            const symbolArticles = articles?.filter(article => article.symbol === symbol) || [];
            
            if (symbolArticles.length === 0) return null;

            return (
              <Card key={symbol} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Badge className="bg-blue-500 text-white">{symbol}</Badge>
                    <span>{symbolArticles.length} Articles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {symbolArticles.map((article) => (
                      <div key={article.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            {article.url ? (
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white font-medium hover:text-blue-400 transition-colors group"
                              >
                                <div className="flex items-start gap-2">
                                  <span>{article.title}</span>
                                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                                </div>
                              </a>
                            ) : (
                              <h3 className="text-white font-medium">{article.title}</h3>
                            )}
                            <p className="text-slate-300 text-sm mt-1">{article.description}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge className={`${
                              article.ai_sentiment === 'Bullish' ? 'bg-emerald-500' :
                              article.ai_sentiment === 'Bearish' ? 'bg-red-500' :
                              'bg-gray-500'
                            } text-white`}>
                              {article.ai_sentiment?.toUpperCase() || 'NEUTRAL'}
                            </Badge>
                            {article.ai_confidence && (
                              <span className="text-slate-400 text-sm">
                                {article.ai_confidence}%
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {article.ai_reasoning && (
                          <div className="bg-slate-800/50 border border-slate-600 rounded p-3 mb-3">
                            <p className="text-slate-300 text-sm">{article.ai_reasoning}</p>
                          </div>
                        )}
                        
                        <div className="text-slate-500 text-xs">
                          {article.published_at && formatDate(article.published_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {articles && articles.length === 0 && !articlesLoading && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="text-center py-12">
              <p className="text-slate-400 text-lg">No articles found</p>
              <p className="text-slate-500 text-sm mt-2">
                Click "Fetch Latest News" to get the latest articles for your selected stocks
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MyStocks;
