import { Button } from "@/components/ui/button";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export const BuySellButtons = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentSymbol, setCurrentSymbol] = useState<string>("");
  
  // Extract symbol from current route
  useEffect(() => {
    const path = location.pathname;
    
    // Extract symbol from various route patterns
    if (path.includes('/stock-detail/')) {
      const symbol = path.split('/stock-detail/')[1];
      setCurrentSymbol(symbol?.toUpperCase() || "");
    } else if (path.includes('/stock-chart/')) {
      const symbol = path.split('/stock-chart/')[1];
      setCurrentSymbol(symbol?.toUpperCase() || "");
    } else if (path.includes('/trading-view/')) {
      const symbol = path.split('/trading-view/')[1];
      setCurrentSymbol(symbol?.toUpperCase() || "");
    } else if (path.includes('/magnificent-7') || path.includes('/magnificent7')) {
      // Default to AAPL for Mag7 page
      setCurrentSymbol("AAPL");
    } else if (path.includes('/index-funds')) {
      // Default to SPY for Index Funds page
      setCurrentSymbol("SPY");
    } else {
      // Default to SPY for dashboard/other pages
      setCurrentSymbol("SPY");
    }
  }, [location.pathname]);

  const { data: stockPrices, isLoading } = useStockPrices([currentSymbol]);
  const currentStock = stockPrices?.[0];
  
  // Calculate bid/ask prices (similar to existing logic)
  const currentPrice = currentStock?.price || 0;
  const bidPrice = currentStock?.bidPrice || (currentPrice * 0.999);
  const askPrice = currentStock?.askPrice || (currentPrice * 1.001);
  const spread = askPrice - bidPrice;

  const handleBuy = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place orders.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Buy Order",
      description: `Initiating buy order for ${currentSymbol} at $${askPrice.toFixed(2)}`,
    });
  };

  const handleSell = () => {
    if (!user) {
      toast({
        title: "Authentication Required", 
        description: "Please sign in to place orders.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Sell Order",
      description: `Initiating sell order for ${currentSymbol} at $${bidPrice.toFixed(2)}`,
    });
  };

  if (isLoading || !currentSymbol) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-8 bg-slate-700 rounded animate-pulse"></div>
        <div className="w-16 h-8 bg-slate-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Buy Button with Ask Price */}
      <Button
        onClick={handleBuy}
        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 h-auto"
        size="sm"
      >
        <div className="flex flex-col items-center leading-tight">
          <div className="font-medium">BUY</div>
          <div className="text-xs opacity-90">${askPrice.toFixed(2)}</div>
        </div>
      </Button>

      {/* Sell Button with Bid Price */}
      <Button
        onClick={handleSell}
        className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 h-auto"
        size="sm"
      >
        <div className="flex flex-col items-center leading-tight">
          <div className="font-medium">SELL</div>
          <div className="text-xs opacity-90">${bidPrice.toFixed(2)}</div>
        </div>
      </Button>

      {/* Symbol and Spread Info */}
      <div className="hidden sm:flex flex-col text-xs text-slate-400 ml-2">
        <div className="font-medium">{currentSymbol}</div>
        <div className="text-xs">${spread.toFixed(4)}</div>
      </div>
    </div>
  );
};