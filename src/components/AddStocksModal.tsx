import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserStockPrices } from "@/hooks/useUserStockPrices";
import { useFinnhubMetrics } from "@/hooks/useFinnhubMetrics";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, TrendingUp, TrendingDown, Search, Building2, DollarSign, Target, BarChart3, Plus } from "lucide-react";
import CompanyLogo from "./CompanyLogo";
import { Badge } from "@/components/ui/badge";

interface UserStock {
  id: string;
  symbol: string;
  created_at: string;
}

interface AddStocksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddStocksModal = ({ open, onOpenChange }: AddStocksModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [userStocks, setUserStocks] = useState<UserStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState("");

  // Get Finnhub metrics for the selected search result
  const { metrics, loading: metricsLoading, error: metricsError } = useFinnhubMetrics(selectedSearchResult);

  // Get real-time stock prices
  const userStockSymbols = userStocks.map(stock => stock.symbol);
  const { data: stockPrices, isLoading: stockPricesLoading } = useUserStockPrices(userStockSymbols);

  useEffect(() => {
    if (user && open) {
      fetchUserStocks();
    }
  }, [user, open]);

  const fetchUserStocks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_stocks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserStocks(data || []);
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

  // Search for stocks when query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      const timer = setTimeout(() => {
        searchStocks(searchQuery.trim().toUpperCase());
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setSelectedSearchResult("");
    }
  }, [searchQuery]);

  const searchStocks = async (query: string) => {
    try {
      // For now, we'll suggest common stock symbols that match the query
      const commonStocks = [
        'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'CRM', 'UBER',
        'SPOT', 'ADBE', 'PYPL', 'INTC', 'AMD', 'BABA', 'DIS', 'BA', 'GE', 'GM',
        'F', 'T', 'VZ', 'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'V', 'MA', 'COST'
      ];
      
      const filtered = commonStocks.filter(symbol => 
        symbol.includes(query) || symbol.startsWith(query)
      ).slice(0, 10);
      
      setSearchResults(filtered);
      if (filtered.length > 0 && !selectedSearchResult) {
        setSelectedSearchResult(filtered[0]);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
    }
  };

  const addStock = async (symbolToAdd?: string) => {
    const symbol = (symbolToAdd || selectedSearchResult || selectedStock).toUpperCase().trim();
    if (!symbol) return;
    
    // Check if stock already exists
    if (userStocks.some(stock => stock.symbol === symbol)) {
      toast({
        title: "Already Added",
        description: `${symbol} is already in your watchlist`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_stocks')
        .insert([
          {
            user_id: user?.id,
            symbol: symbol
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${symbol} added to your watchlist`,
      });

      setSelectedStock("");
      setSearchQuery("");
      setSearchResults([]);
      setSelectedSearchResult("");
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

  const removeStock = async (stockId: string, symbol: string) => {
    try {
      const { error } = await supabase
        .from('user_stocks')
        .delete()
        .eq('id', stockId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${symbol} removed from your watchlist`,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedSearchResult) {
        addStock(selectedSearchResult);
      } else {
        addStock();
      }
    }
  };

  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(stock => stock.symbol === symbol);
  };

  const filteredStocks = userStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-slate-900 border-slate-700 text-white overflow-hidden">
        <DialogHeader className="pb-4 border-b border-slate-700">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            Manage Your Stocks
          </DialogTitle>
          <p className="text-slate-400 mt-2">
            Search and add stocks to your personal watchlist to track performance and get AI insights
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-12rem)] space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Section - Left Side */}
            <div className="space-y-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-emerald-400" />
                    Search Stocks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="stock-search" className="text-slate-300 text-sm">
                      Enter stock symbol or company name
                    </Label>
                    <Input
                      id="stock-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Search for stocks (e.g., AAPL, TSLA)..."
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-sm">Search Results:</Label>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {searchResults.map((symbol) => (
                          <Button
                            key={symbol}
                            onClick={() => setSelectedSearchResult(symbol)}
                            variant={selectedSearchResult === symbol ? "default" : "ghost"}
                            className={`w-full justify-start text-left p-3 ${
                              selectedSearchResult === symbol 
                                ? "bg-emerald-600 text-white" 
                                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <CompanyLogo symbol={symbol} size="sm" />
                              <span className="font-medium">{symbol}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stock Details - Right Side */}
            <div className="space-y-4">
              {selectedSearchResult && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CompanyLogo symbol={selectedSearchResult} size="md" />
                        <span>{selectedSearchResult}</span>
                      </div>
                      <Button 
                        onClick={() => addStock(selectedSearchResult)}
                        disabled={userStocks.some(stock => stock.symbol === selectedSearchResult)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {userStocks.some(stock => stock.symbol === selectedSearchResult) ? 'Already Added' : 'Add to Watchlist'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metricsLoading ? (
                      <div className="space-y-3">
                        <div className="animate-pulse bg-slate-600 h-4 w-3/4 rounded"></div>
                        <div className="animate-pulse bg-slate-600 h-4 w-1/2 rounded"></div>
                        <div className="animate-pulse bg-slate-600 h-4 w-2/3 rounded"></div>
                      </div>
                    ) : metricsError ? (
                      <div className="text-slate-400 text-sm">
                        <p>Financial data temporarily unavailable</p>
                        <p className="text-xs">Finnhub API experiencing issues</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Key Financial Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          {metrics.marketCap && (
                            <div>
                              <p className="text-slate-400 text-xs">Market Cap</p>
                              <p className="text-white font-medium">${(metrics.marketCap / 1e9).toFixed(2)}B</p>
                            </div>
                          )}
                          {metrics.peRatio && (
                            <div>
                              <p className="text-slate-400 text-xs">P/E Ratio</p>
                              <p className="text-white font-medium">{metrics.peRatio.toFixed(2)}</p>
                            </div>
                          )}
                          {metrics.eps && (
                            <div>
                              <p className="text-slate-400 text-xs">EPS</p>
                              <p className="text-white font-medium">${metrics.eps.toFixed(2)}</p>
                            </div>
                          )}
                          {metrics.dividendYield && (
                            <div>
                              <p className="text-slate-400 text-xs">Dividend Yield</p>
                              <p className="text-white font-medium">{(metrics.dividendYield * 100).toFixed(2)}%</p>
                            </div>
                          )}
                        </div>

                        {/* 52-week Range */}
                        {(metrics.fiftyTwoWeekHigh || metrics.fiftyTwoWeekLow) && (
                          <div>
                            <p className="text-slate-400 text-xs mb-1">52-Week Range</p>
                            <div className="flex items-center gap-2 text-sm">
                              {metrics.fiftyTwoWeekLow && (
                                <span className="text-red-400">${metrics.fiftyTwoWeekLow.toFixed(2)}</span>
                              )}
                              <span className="text-slate-400">-</span>
                              {metrics.fiftyTwoWeekHigh && (
                                <span className="text-emerald-400">${metrics.fiftyTwoWeekHigh.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Financial Health Indicators */}
                        {(metrics.returnOnEquity || metrics.debtToEquity) && (
                          <div className="pt-2 border-t border-slate-700">
                            <p className="text-slate-400 text-xs mb-2">Financial Health</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {metrics.returnOnEquity && (
                                <div>
                                  <p className="text-slate-400 text-xs">ROE</p>
                                  <p className="text-white">{(metrics.returnOnEquity * 100).toFixed(1)}%</p>
                                </div>
                              )}
                              {metrics.debtToEquity && (
                                <div>
                                  <p className="text-slate-400 text-xs">Debt/Equity</p>
                                  <p className="text-white">{metrics.debtToEquity.toFixed(2)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Current Stocks Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  Your Watchlist
                  <Badge variant="secondary" className="bg-emerald-600 text-white">
                    {userStocks.length} stocks
                  </Badge>
                </CardTitle>
                {userStocks.length > 3 && (
                  <div className="flex-1 max-w-xs">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search your stocks..."
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-sm"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                  <span className="ml-2 text-slate-400">Loading your stocks...</span>
                </div>
              ) : filteredStocks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  {searchQuery ? (
                    <div>
                      <Search className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                      <p>No stocks found matching "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div>
                      <Plus className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                      <p className="text-lg mb-2">No stocks in your watchlist yet</p>
                      <p className="text-sm">Add your first stock using the form above</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredStocks.map((stock) => {
                    const priceData = getStockPrice(stock.symbol);
                    const isPositive = (priceData?.changePercent || 0) >= 0;
                    
                    return (
                      <div
                        key={stock.id}
                        className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <CompanyLogo symbol={stock.symbol} size="sm" />
                          <div className="flex-1">
                            <div className="font-semibold text-white">{stock.symbol}</div>
                            <div className="text-slate-400 text-sm">
                              {stockPricesLoading ? (
                                <span className="flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Loading...
                                </span>
                              ) : priceData ? (
                                <span className="flex items-center gap-2">
                                  <span>${priceData.price.toFixed(2)}</span>
                                  <span className={`flex items-center gap-1 text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {isPositive ? '+' : ''}{priceData.changePercent.toFixed(2)}%
                                  </span>
                                </span>
                              ) : (
                                'Price unavailable'
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeStock(stock.id, stock.symbol)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-700">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStocksModal;