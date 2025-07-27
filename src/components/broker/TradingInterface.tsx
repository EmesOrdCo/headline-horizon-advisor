import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAlpacaBroker, AlpacaAsset } from '@/hooks/useAlpacaBroker';
import TradingChart from './TradingChart';
import { toast } from 'sonner';

interface TradingInterfaceProps {
  accountId: string;
  assets: AlpacaAsset[];
  onOrderPlaced: () => void;
}

const TradingInterface = ({ accountId, assets, onOrderPlaced }: TradingInterfaceProps) => {
  const [orderData, setOrderData] = useState({
    symbol: 'AAPL',
    qty: '10',
    side: 'buy' as 'buy' | 'sell',
    type: 'market' as 'market' | 'limit',
    time_in_force: 'day' as 'day' | 'gtc' | 'ioc' | 'fok',
    limit_price: '',
  });

  const { placeOrder, loading } = useAlpacaBroker();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId) {
      toast.error('Please select an account first');
      return;
    }

    try {
      const order = await placeOrder(accountId, orderData);
      toast.success(`Order placed successfully! Order ID: ${order.id}`);
      onOrderPlaced();
      
      // Reset form
      setOrderData({
        ...orderData,
        qty: '10',
        limit_price: '',
      });
    } catch (error) {
      // Show specific error message from the API
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      toast.error(errorMessage);
      console.error('Order placement error:', error);
    }
  };

  const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];

  if (!accountId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trading Interface</CardTitle>
          <CardDescription>Please select an account to start trading</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trading Form */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Place Order</CardTitle>
          <CardDescription className="text-slate-400">Simulate order placement in sandbox environment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="symbol">Symbol</Label>
                <Select value={orderData.symbol} onValueChange={(value) => setOrderData({ ...orderData, symbol: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {popularSymbols.map(symbol => (
                      <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  value={orderData.qty}
                  onChange={(e) => setOrderData({ ...orderData, qty: e.target.value })}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="side">Side</Label>
                <Select value={orderData.side} onValueChange={(value: 'buy' | 'sell') => setOrderData({ ...orderData, side: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Order Type</Label>
                <Select value={orderData.type} onValueChange={(value: 'market' | 'limit') => setOrderData({ ...orderData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {orderData.type === 'limit' && (
              <div>
                <Label htmlFor="limit_price">Limit Price ($)</Label>
                <Input
                  id="limit_price"
                  type="number"
                  step="0.01"
                  value={orderData.limit_price}
                  onChange={(e) => setOrderData({ ...orderData, limit_price: e.target.value })}
                  placeholder="0.00"
                  required={orderData.type === 'limit'}
                />
              </div>
            )}

            <div>
              <Label htmlFor="time_in_force">Time in Force</Label>
              <Select value={orderData.time_in_force} onValueChange={(value: any) => setOrderData({ ...orderData, time_in_force: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="gtc">Good Till Canceled</SelectItem>
                  <SelectItem value="ioc">Immediate or Cancel</SelectItem>
                  <SelectItem value="fok">Fill or Kill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Action:</span>
                  <Badge variant={orderData.side === 'buy' ? 'default' : 'destructive'}>
                    {orderData.side.toUpperCase()} {orderData.qty} shares
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Symbol:</span>
                  <span className="font-mono">{orderData.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{orderData.type.toUpperCase()}</span>
                </div>
                {orderData.type === 'limit' && orderData.limit_price && (
                  <div className="flex justify-between">
                    <span>Limit Price:</span>
                    <span>${orderData.limit_price}</span>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Placing Order...' : `Place ${orderData.side.toUpperCase()} Order`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stock Chart and Analysis */}
      <TradingChart 
        symbol={orderData.symbol} 
        quantity={orderData.qty}
      />
    </div>
  );
};

export default TradingInterface;