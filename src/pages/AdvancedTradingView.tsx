import React, { useState, useEffect } from 'react';
import { TradingChart } from '@/components/chart/TradingChart';
import DashboardNav from '@/components/DashboardNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, BarChart3, Activity, Zap } from 'lucide-react';
import { useAlpacaBroker, AlpacaAsset } from '@/hooks/useAlpacaBroker';
import { useAccountData } from '@/hooks/useAccountData';
import { toast } from 'sonner';

const AdvancedTradingView: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [orderData, setOrderData] = useState({
    qty: '10',
    side: 'buy' as 'buy' | 'sell',
    type: 'market' as 'market' | 'limit',
    time_in_force: 'day' as 'day' | 'gtc' | 'ioc' | 'fok',
    limit_price: '',
  });
  const [assets, setAssets] = useState<AlpacaAsset[]>([]);

  const { placeOrder, getAssets, loading } = useAlpacaBroker();
  const { selectedAccount, refreshData } = useAccountData();

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assetList = await getAssets({ status: 'active', asset_class: 'us_equity' });
        setAssets(assetList);
      } catch (error) {
        console.error('Failed to load assets:', error);
      }
    };
    loadAssets();
  }, [getAssets]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccount?.id) {
      toast.error('Please connect your Alpaca account first');
      return;
    }

    try {
      const order = await placeOrder(selectedAccount.id, {
        symbol: selectedSymbol,
        qty: orderData.qty,
        side: orderData.side,
        type: orderData.type,
        time_in_force: orderData.time_in_force,
        limit_price: orderData.type === 'limit' ? orderData.limit_price : undefined,
      });
      toast.success(`Order placed successfully! Order ID: ${order.id}`);
      refreshData();
      
      // Reset form
      setOrderData({
        ...orderData,
        qty: '10',
        limit_price: '',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      toast.error(errorMessage);
      console.error('Order placement error:', error);
    }
  };
  
  const popularSymbols = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
    { symbol: 'BTC-USD', name: 'Bitcoin USD' },
    { symbol: 'ETH-USD', name: 'Ethereum USD' }
  ];

  const features = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Real-time Data",
      description: "Live market data with WebSocket streaming"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Multiple Timeframes",
      description: "1m, 5m, 15m, 1h, 4h, 1d, 1w intervals"
    },
    {
      icon: <Activity className="h-5 w-5" />,
      title: "Technical Indicators",
      description: "MA, RSI, Bollinger Bands, and more"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Live Trading",
      description: "Real-time order placement via Alpaca"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Advanced Trading View</h1>
              <p className="text-muted-foreground text-lg">
                Professional-grade charting with real-time data and live trading capabilities
              </p>
            </div>
            <Badge variant="default" className="px-3 py-1">
              <Zap className="h-4 w-4 mr-1" />
              Live Trading
            </Badge>
          </div>

          {/* Symbol Selector */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-medium">Symbol:</span>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {popularSymbols.map(({ symbol, name }) => (
                    <SelectItem key={symbol} value={symbol}>
                      <div>
                        <div className="font-medium">{symbol}</div>
                        <div className="text-sm text-muted-foreground">{name}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Symbol Buttons */}
            <div className="flex gap-2">
              {['AAPL', 'GOOGL', 'TSLA', 'NVDA'].map((symbol) => (
                <Button
                  key={symbol}
                  variant={selectedSymbol === symbol ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSymbol(symbol)}
                >
                  {symbol}
                </Button>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Chart and Trading Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2">
            <TradingChart 
              symbol={selectedSymbol} 
              initialTimeFrame="1h"
            />
          </div>
          
          {/* Order Placement Interface */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Place Order</CardTitle>
              <p className="text-slate-400 text-sm">
                Simulate order placement in sandbox environment
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol" className="text-white">Symbol</Label>
                    <div className="mt-1 p-3 bg-slate-700 rounded-md border border-slate-600">
                      <span className="text-white font-mono">{selectedSymbol}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="qty" className="text-white">Quantity</Label>
                    <Input
                      id="qty"
                      type="number"
                      value={orderData.qty}
                      onChange={(e) => setOrderData({ ...orderData, qty: e.target.value })}
                      min="1"
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="side" className="text-white">Side</Label>
                    <Select value={orderData.side} onValueChange={(value: 'buy' | 'sell') => setOrderData({ ...orderData, side: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="type" className="text-white">Order Type</Label>
                    <Select value={orderData.type} onValueChange={(value: 'market' | 'limit') => setOrderData({ ...orderData, type: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
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
                    <Label htmlFor="limit_price" className="text-white">Limit Price ($)</Label>
                    <Input
                      id="limit_price"
                      type="number"
                      step="0.01"
                      value={orderData.limit_price}
                      onChange={(e) => setOrderData({ ...orderData, limit_price: e.target.value })}
                      placeholder="0.00"
                      required={orderData.type === 'limit'}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="time_in_force" className="text-white">Time in Force</Label>
                  <Select value={orderData.time_in_force} onValueChange={(value: any) => setOrderData({ ...orderData, time_in_force: value })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
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

                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <h4 className="font-semibold mb-2 text-white">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Action:</span>
                      <Badge variant={orderData.side === 'buy' ? 'default' : 'destructive'}>
                        {orderData.side.toUpperCase()} {orderData.qty} shares
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Symbol:</span>
                      <span className="font-mono text-white">{selectedSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Type:</span>
                      <span className="text-white">{orderData.type.toUpperCase()}</span>
                    </div>
                    {orderData.type === 'limit' && orderData.limit_price && (
                      <div className="flex justify-between">
                        <span className="text-slate-300">Limit Price:</span>
                        <span className="text-white">${orderData.limit_price}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !selectedAccount?.id} 
                  className="w-full"
                  variant={orderData.side === 'buy' ? 'default' : 'destructive'}
                >
                  {loading ? 'Placing Order...' : 
                   !selectedAccount?.id ? 'Connect Alpaca Account' :
                   `Place ${orderData.side.toUpperCase()} Order`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Chart Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Candlestick charts with OHLC data
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Interactive crosshair and tooltips
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Zoom and pan functionality
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Real-time price updates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  Customizable grid and themes
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Moving Averages (SMA/EMA)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Relative Strength Index (RSI)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Bollinger Bands
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  MACD (Coming Soon)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Volume Overlay
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Real-time order placement
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Alpaca sandbox integration
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Market & limit orders
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Buy & sell functionality
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  Live price data integration
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTradingView;