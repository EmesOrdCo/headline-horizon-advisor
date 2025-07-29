import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, TrendingUp, TrendingDown, Clock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAlpacaBroker } from "@/hooks/useAlpacaBroker";
import { useAccountData } from "@/hooks/useAccountData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlpacaOrder } from "@/hooks/useAlpacaBroker";
import CompanyLogo from "./CompanyLogo";

interface PendingOrdersModalProps {
  children: React.ReactNode;
}

export const PendingOrdersModal = ({ children }: PendingOrdersModalProps) => {
  const { user } = useAuth();
  const { getOrders, cancelOrder, loading } = useAlpacaBroker();
  const { selectedAccount } = useAccountData();
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<AlpacaOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [cancelingOrders, setCancelingOrders] = useState<Set<string>>(new Set());

  const loadPendingOrders = async () => {
    if (!selectedAccount?.id) return;

    setIsLoadingOrders(true);
    try {
      // Fetch orders with pending statuses
      const allOrders = await getOrders(selectedAccount.id, { 
        status: 'open', 
        limit: 50 
      });
      
      // Filter for pending orders (not filled or cancelled)
      const pendingOrders = allOrders.filter(order => 
        ['new', 'partially_filled', 'pending_new', 'accepted', 'pending_cancel', 'pending_replace'].includes(order.status)
      );
      
      setOrders(pendingOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load pending orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadPendingOrders();
    }
  }, [open, selectedAccount]);

  const handleCancelOrder = async (orderId: string) => {
    if (!selectedAccount?.id) return;

    setCancelingOrders(prev => new Set(prev).add(orderId));
    
    try {
      await cancelOrder(selectedAccount.id, orderId);
      toast.success('Order cancelled successfully');
      
      // Remove the cancelled order from the list
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      toast.error(`Failed to cancel order: ${error.message}`);
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
      case 'new':
      case 'accepted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'partially_filled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'pending_new':
      case 'pending_cancel':
      case 'pending_replace':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatOrderType = (order: AlpacaOrder) => {
    if (order.order_type === 'limit') {
      return `Limit ${order.limit_price ? `$${parseFloat(order.limit_price).toFixed(2)}` : ''}`;
    }
    return 'Market';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-white dark:bg-slate-900 border-0 shadow-xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" />
            <h2 className="text-xl font-bold">Pending Orders</h2>
            <Badge variant="secondary" className="ml-auto">
              {orders.length} orders
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto">
          {isLoadingOrders ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No Pending Orders
              </h3>
              <p className="text-sm text-slate-500">
                You don't have any pending orders at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <CompanyLogo symbol={order.symbol} size="sm" />
                    
                    <div className="flex items-center gap-2">
                      {order.side === 'buy' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-semibold text-lg">{order.symbol}</span>
                    </div>

                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="capitalize font-medium">
                          {order.side} {order.qty} shares
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatOrderType(order)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs", getOrderStatusColor(order.status))}>
                          {order.status.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.filled_qty && parseFloat(order.filled_qty) > 0 && (
                      <div className="text-right text-sm">
                        <div className="text-slate-600 dark:text-slate-400">
                          Filled: {order.filled_qty}/{order.qty}
                        </div>
                        {order.filled_avg_price && (
                          <div className="text-xs text-slate-500">
                            Avg: ${parseFloat(order.filled_avg_price).toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={loading || cancelingOrders.has(order.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {cancelingOrders.has(order.id) ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {orders.length > 0 && (
            <div className="mt-6 flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Market orders execute immediately during market hours. Limit orders remain pending until the price reaches your specified limit or you cancel them.
              </span>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setOpen(false)} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};