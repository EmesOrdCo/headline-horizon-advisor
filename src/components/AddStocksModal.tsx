import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserStockPrices } from "@/hooks/useUserStockPrices";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, TrendingUp, TrendingDown, Search, X } from "lucide-react";
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

  const addStock = async () => {
    if (!selectedStock.trim()) return;

    const symbol = selectedStock.toUpperCase().trim();
    
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
      addStock();
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
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 border-slate-700 text-white overflow-hidden">
        <DialogHeader className="pb-4 border-b border-slate-700">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Plus className="w-6 h-6" />
            </div>
            Manage Your Stocks
          </DialogTitle>
          <p className="text-slate-400 mt-2">
            Add and manage stocks in your personal watchlist to track performance and get AI insights
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-12rem)] space-y-6">
          {/* Add New Stock Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-400" />
                Add New Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="stock-symbol" className="text-slate-300 text-sm">
                    Stock Symbol (e.g., AAPL, TSLA, MSFT)
                  </Label>
                  <Input
                    id="stock-symbol"
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter stock symbol..."
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={addStock}
                    disabled={!selectedStock.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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