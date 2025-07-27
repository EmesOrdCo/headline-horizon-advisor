import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAlpacaBroker, AlpacaOrder } from '@/hooks/useAlpacaBroker';
import { Loader2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface OrderHistoryProps {
  accountId: string;
  refreshTrigger?: number;
}

const OrderHistory = ({ accountId, refreshTrigger }: OrderHistoryProps) => {
  const [orders, setOrders] = useState<AlpacaOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getOrders } = useAlpacaBroker();

  const loadOrders = async () => {
    if (!accountId) return;

    try {
      setIsLoading(true);
      console.log('Loading orders for account:', accountId);
      
      const orderData = await getOrders(accountId);
      console.log('Orders loaded:', orderData);
      
      // Sort orders by created date (newest first)
      const sortedOrders = orderData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load order history');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [accountId, refreshTrigger]);

  const getStatusBadge = (status: string) => {
    const statusColor = {
      'filled': 'bg-green-100 text-green-800',
      'partially_filled': 'bg-yellow-100 text-yellow-800',
      'pending_new': 'bg-blue-100 text-blue-800',
      'new': 'bg-blue-100 text-blue-800',
      'accepted': 'bg-blue-100 text-blue-800',
      'canceled': 'bg-gray-100 text-gray-800',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800'
    }[status.toLowerCase()] || 'bg-gray-100 text-gray-800';

    return (
      <Badge className={statusColor}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getSideIcon = (side: string) => {
    return side.toLowerCase() === 'buy' ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!accountId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Please select an account to view order history</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              📋 Order History
            </CardTitle>
            <CardDescription>Recent trading activity and order status</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading order history...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">No orders found</p>
            <p className="text-sm">Place your first order to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                <div className="text-sm text-blue-600">Total Orders</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'filled').length}
                </div>
                <div className="text-sm text-green-600">Filled</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => ['pending_new', 'new', 'accepted'].includes(o.status)).length}
                </div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono font-semibold">
                        {order.symbol}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSideIcon(order.side)}
                          <span className={`font-medium ${
                            order.side.toLowerCase() === 'buy' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {order.side.toUpperCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{order.qty}</TableCell>
                      <TableCell className="capitalize">{order.order_type}</TableCell>
                      <TableCell>
                        {order.order_type === 'market' ? 'Market' : 
                         order.limit_price ? formatCurrency(order.limit_price) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* TradingView Webhook Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📡 TradingView Webhook Integration</h4>
              <p className="text-sm text-blue-700 mb-2">
                Connect your TradingView alerts to automatically place orders using our webhook endpoint:
              </p>
              <code className="block p-2 bg-white rounded text-xs font-mono text-blue-800 border">
                https://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/tradingview-webhook
              </code>
              <p className="text-xs text-blue-600 mt-2">
                Send POST requests with: {`{ "symbol": "AAPL", "action": "buy", "quantity": 1 }`}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;