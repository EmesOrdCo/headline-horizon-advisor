import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAccountData } from "@/hooks/useAccountData";
import { useAlpacaBroker } from "@/hooks/useAlpacaBroker";
import { Clock, TrendingUp, TrendingDown, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface StockPendingOrdersProps {
  symbol: string;
}

export const StockPendingOrders: React.FC<StockPendingOrdersProps> = ({ symbol }) => {
  const { selectedAccount } = useAccountData();
  const { getOrders, cancelOrder } = useAlpacaBroker();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelingOrders, setCancelingOrders] = useState<Set<string>>(new Set());

  const loadPendingOrders = async () => {
    console.log('🔍 StockPendingOrders: Loading pending orders for symbol:', symbol);
    console.log('🔍 StockPendingOrders: Selected Account:', selectedAccount);
    
    if (!selectedAccount?.id || !symbol) {
      console.log('❌ StockPendingOrders: Missing account ID or symbol:', { accountId: selectedAccount?.id, symbol });
      return;
    }

    setIsLoading(true);
    try {
      console.log('📡 StockPendingOrders: Fetching orders...');
      const allOrders = await getOrders(selectedAccount.id, { 
        status: 'open', 
        limit: 50 
      });
      
      console.log('📋 StockPendingOrders: All orders received:', allOrders);
      
      // Filter for this specific symbol and pending statuses
      const pendingOrders = allOrders.filter(order => 
        order.symbol === symbol &&
        ['new', 'partially_filled', 'pending_new', 'accepted', 'pending_cancel', 'pending_replace'].includes(order.status)
      );
      
      console.log(`⏳ StockPendingOrders: Filtered pending orders for ${symbol}:`, pendingOrders);
      setOrders(pendingOrders);
    } catch (error) {
      console.error('❌ StockPendingOrders: Failed to load pending orders:', error);
      toast.error('Failed to load pending orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingOrders();
    
    // Refresh every 10 seconds for active trading
    const interval = setInterval(loadPendingOrders, 10000);
    return () => clearInterval(interval);
  }, [selectedAccount?.id, symbol]);

  const handleCancelOrder = async (orderId: string) => {
    if (!selectedAccount?.id) return;

    setCancelingOrders(prev => new Set(prev).add(orderId));
    try {
      await cancelOrder(selectedAccount.id, orderId);
      toast.success('Order cancelled successfully');
      loadPendingOrders(); // Refresh the list
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setCancelingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'partially_filled': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'pending_new': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const formatOrderType = (order: any) => {
    if (order.order_type === 'limit') {
      return `Limit $${parseFloat(order.limit_price).toFixed(2)}`;
    }
    return order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1);
  };

  if (!symbol) {
    console.log('❌ StockPendingOrders: No symbol provided');
    return null;
  }

  console.log('🔧 StockPendingOrders: Rendering component for symbol:', symbol);
  console.log('🔧 StockPendingOrders: Current orders:', orders);
  console.log('🔧 StockPendingOrders: Account data:', { accountId: selectedAccount?.id, isLoading });

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3 className="text-white font-medium">
              {symbol} Pending Orders
            </h3>
            <Badge variant="secondary" className="text-xs">
              {orders.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadPendingOrders}
            disabled={isLoading}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="text-slate-400">Loading pending orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-slate-400">No pending orders for {symbol}</div>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded border border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {order.side === 'buy' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`font-medium ${order.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {order.side.toUpperCase()} {order.qty}
                    </span>
                  </div>
                  
                  <div className="text-slate-300">
                    {formatOrderType(order)}
                  </div>
                  
                  <Badge className={`text-xs ${getOrderStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-400">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancelingOrders.has(order.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-auto"
                  >
                    {cancelingOrders.has(order.id) ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};