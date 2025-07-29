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
    } else if (path.includes('/alpaca-live-chart/')) {
      const symbol = path.split('/alpaca-live-chart/')[1];
      setCurrentSymbol(symbol?.toUpperCase() || "");
    } else if (path.includes('/magnificent-7') || path.includes('/magnificent7')) {
      // Default to AAPL for Mag7 page
      setCurrentSymbol("AAPL");
    } else if (path.includes('/index-funds')) {
      // Default to SPY for Index Funds page
      setCurrentSymbol("SPY");
    } else if (path.includes('/advanced-trading-view')) {
      // Default to AAPL for Advanced Trading View
      setCurrentSymbol("AAPL");
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
      {/* Sell Button with Bid Price (styled like reference image) */}
      <Button
        onClick={handleSell}
        className="bg-transparent border border-red-500 text-red-400 hover:bg-red-500/10 text-sm px-4 py-2 h-auto rounded-full"
        size="sm"
      >
        <div className="flex items-center space-x-1">
          <div className="font-medium">S</div>
          <div className="font-bold">{bidPrice.toFixed(2)}</div>
        </div>
      </Button>

      {/* Buy Button with Ask Price (styled like reference image) */}
      <Button
        onClick={handleBuy}
        className="bg-transparent border border-green-500 text-green-400 hover:bg-green-500/10 text-sm px-4 py-2 h-auto rounded-full"
        size="sm"
      >
        <div className="flex items-center space-x-1">
          <div className="font-medium">B</div>
          <div className="font-bold">{askPrice.toFixed(2)}</div>
        </div>
      </Button>
    </div>
  );
};