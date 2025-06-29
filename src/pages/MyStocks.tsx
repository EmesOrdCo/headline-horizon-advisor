import DashboardNav from "@/components/DashboardNav";
import StockCard from "@/components/StockCard";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserStockPrices } from "@/hooks/useUserStockPrices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, User, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const MyStocks = () => {
  const { user } = useAuth();

  const { data: stocks, isLoading: stocksLoading, refetch: refetchStocks } = useQuery(
    ['userStocks', user?.id],
    async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_stocks')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching user stocks:", error);
        throw error;
      }
      return data;
    },
    {
      enabled: !!user?.id,
    }
  );

  const stockSymbols = stocks?.map(stock => stock.symbol) || [];
  const { stockPrices, isLoading: pricesLoading } = useUserStockPrices(stockSymbols);

  const handleAddStock = async () => {
    const symbol = prompt("Enter the stock symbol to add:");
    if (symbol) {
      try {
        const { data, error } = await supabase
          .from('user_stocks')
          .insert([{ user_id: user?.id, symbol: symbol.toUpperCase() }]);

        if (error) {
          console.error("Error adding stock:", error);
          alert("Failed to add stock. Please try again.");
        } else {
          refetchStocks();
        }
      } catch (error) {
        console.error("Error adding stock:", error);
        alert("Failed to add stock. Please try again.");
      }
    }
  };

  const handleDeleteStock = async (symbol: string) => {
    if (window.confirm(`Are you sure you want to remove ${symbol} from your watchlist?`)) {
      try {
        const { data, error } = await supabase
          .from('user_stocks')
          .delete()
          .eq('user_id', user?.id)
          .eq('symbol', symbol);

        if (error) {
          console.error("Error deleting stock:", error);
          alert("Failed to delete stock. Please try again.");
        } else {
          refetchStocks();
        }
      } catch (error) {
        console.error("Error deleting stock:", error);
        alert("Failed to delete stock. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <DashboardNav />
      
      <main className="pt-20 pb-8">
        <div className="w-[95%] mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">My Stocks</h1>
              <Badge className="bg-emerald-500 text-white text-xs">
                {stocks?.length || 0} Stocks
              </Badge>
            </div>
            <Button onClick={handleAddStock} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </div>

          {stocksLoading ? (
            <div className="text-center text-slate-400">Loading your stocks...</div>
          ) : stocks && stocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stocks.map((stock) => {
                const stockPrice = stockPrices?.find(price => price.symbol === stock.symbol);
                return (
                  <StockCard
                    key={stock.symbol}
                    symbol={stock.symbol}
                    price={stockPrice?.price}
                    change={stockPrice?.change}
                    changePercent={stockPrice?.changePercent}
                    onDelete={() => handleDeleteStock(stock.symbol)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-400">
              No stocks in your watchlist yet. Add some to get started!
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyStocks;
