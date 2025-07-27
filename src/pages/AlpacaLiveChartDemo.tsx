import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import AlpacaLiveChart from '@/components/AlpacaLiveChart';
import TradingInterface from '@/components/broker/TradingInterface';
import OrderHistory from '@/components/broker/OrderHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Info, BarChart3, TrendingUp, Webhook, Copy, ExternalLink } from 'lucide-react';
import { useAccountData } from '@/hooks/useAccountData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AlpacaLiveChartDemo: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const currentSymbol = symbol || 'AAPL';
  const [selectedSymbol, setSelectedSymbol] = useState(currentSymbol);
  const [orderRefreshTrigger, setOrderRefreshTrigger] = useState(0);

  // Manual trading form state
  const [manualOrder, setManualOrder] = useState({
    symbol: currentSymbol,
    quantity: 1,
    side: 'buy' as 'buy' | 'sell',
    orderType: 'market' as 'market' | 'limit',
    timeInForce: 'gtc' as 'gtc' | 'ioc' | 'day'
  });

  const { accounts, selectedAccount, refreshData } = useAccountData();

  const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'SPY', 'QQQ'];

  // Manual order submission
  const handleManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to place orders');
        return;
      }

      const { data, error } = await supabase.functions.invoke('alpaca-place-order', {
        body: {
          symbol: manualOrder.symbol,
          qty: manualOrder.quantity,
          side: manualOrder.side,
          type: manualOrder.orderType,
          time_in_force: manualOrder.timeInForce
        }
      });

      if (error) throw error;

      toast.success(`${manualOrder.side.toUpperCase()} order placed successfully for ${manualOrder.symbol}`);
      setOrderRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Error placing manual order:', error);
      toast.error(`Failed to place order: ${error.message}`);
    }
  };

  // Copy webhook URL to clipboard
  const copyWebhookUrl = () => {
    const webhookUrl = 'https://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/tradingview-webhook';
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📈 Alpaca Live Trading Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional trading platform with TradingView charts, real-time data feeds, and automated webhook integration
          </p>
        </div>

        {/* Status Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Sandbox Mode:</strong> Safe testing environment. No real money involved.
            </AlertDescription>
          </Alert>

          <Alert className="border-green-200 bg-green-50">
            <Webhook className="h-4 w-4" />
            <AlertDescription>
              <strong>TradingView Ready:</strong> Webhook endpoint active for automated trading alerts.
            </AlertDescription>
          </Alert>
        </div>

        {/* Symbol Selector */}
        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Stock Symbol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="symbol-select">Select Symbol:</Label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {popularSymbols.map(sym => (
                    <SelectItem key={sym} value={sym}>{sym}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => window.location.href = `/alpaca-live-chart/${selectedSymbol}`}
                variant="outline"
              >
                Update Chart
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Trading Interface */}
        <Tabs defaultValue="chart" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur">
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Live Chart
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Manual Trading
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              📋 Order History
            </TabsTrigger>
            <TabsTrigger value="webhook" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              TradingView Setup
            </TabsTrigger>
          </TabsList>

          {/* Live Chart Tab */}
          <TabsContent value="chart" className="space-y-6">
            <AlpacaLiveChart symbol={selectedSymbol} />
          </TabsContent>

          {/* Manual Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Manual Trading Form */}
              <Card className="bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Manual Order Entry
                  </CardTitle>
                  <CardDescription>
                    Place orders manually using the form below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualOrder} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="symbol">Symbol</Label>
                        <Select 
                          value={manualOrder.symbol} 
                          onValueChange={(value) => setManualOrder({ ...manualOrder, symbol: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {popularSymbols.map(sym => (
                              <SelectItem key={sym} value={sym}>{sym}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={manualOrder.quantity}
                          onChange={(e) => setManualOrder({ ...manualOrder, quantity: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="side">Side</Label>
                        <Select 
                          value={manualOrder.side} 
                          onValueChange={(value: 'buy' | 'sell') => setManualOrder({ ...manualOrder, side: value })}
                        >
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
                        <Label htmlFor="orderType">Order Type</Label>
                        <Select 
                          value={manualOrder.orderType} 
                          onValueChange={(value: 'market' | 'limit') => setManualOrder({ ...manualOrder, orderType: value })}
                        >
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

                    <div>
                      <Label htmlFor="timeInForce">Time in Force</Label>
                      <Select 
                        value={manualOrder.timeInForce} 
                        onValueChange={(value: any) => setManualOrder({ ...manualOrder, timeInForce: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gtc">Good Till Canceled</SelectItem>
                          <SelectItem value="ioc">Immediate or Cancel</SelectItem>
                          <SelectItem value="day">Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full">
                      Place {manualOrder.side.toUpperCase()} Order
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quick Order Buttons */}
              <Card className="bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle>Quick Actions for {selectedSymbol}</CardTitle>
                  <CardDescription>Fast one-click trading</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 h-16 text-lg"
                      onClick={() => {
                        setManualOrder({
                          symbol: selectedSymbol,
                          quantity: 1,
                          side: 'buy',
                          orderType: 'market',
                          timeInForce: 'gtc'
                        });
                        handleManualOrder(new Event('submit') as any);
                      }}
                    >
                      🟢 BUY 1 {selectedSymbol}
                    </Button>
                    <Button 
                      className="bg-red-600 hover:bg-red-700 h-16 text-lg"
                      onClick={() => {
                        setManualOrder({
                          symbol: selectedSymbol,
                          quantity: 1,
                          side: 'sell',
                          orderType: 'market',
                          timeInForce: 'gtc'
                        });
                        handleManualOrder(new Event('submit') as any);
                      }}
                    >
                      🔴 SELL 1 {selectedSymbol}
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm text-gray-600 mt-4">
                    <p>Market orders • Sandbox environment • Instant execution</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Order History Tab */}
          <TabsContent value="history">
            <OrderHistory 
              accountId={selectedAccount?.id || ''} 
              refreshTrigger={orderRefreshTrigger}
            />
          </TabsContent>

          {/* TradingView Webhook Setup Tab */}
          <TabsContent value="webhook" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5" />
                  TradingView Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Set up automated trading from TradingView alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Webhook URL */}
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      readOnly
                      value="https://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/tradingview-webhook"
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Setup Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Create an alert in TradingView</li>
                    <li>Set the webhook URL above in the alert settings</li>
                    <li>Use the JSON format below for the message</li>
                    <li>Your alerts will automatically place orders</li>
                  </ol>
                </div>

                {/* JSON Example */}
                <div>
                  <Label htmlFor="json-example">Alert Message Format (JSON)</Label>
                  <div className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`{
  "symbol": "AAPL",
  "action": "buy",
  "quantity": 1,
  "order_type": "market",
  "time_in_force": "gtc",
  "strategy_name": "My Strategy",
  "alert_message": "Buy signal triggered"
}`}</pre>
                  </div>
                </div>

                {/* Examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-semibold text-green-600 mb-2">Buy Example</h5>
                    <pre className="text-xs bg-green-50 p-2 rounded">{`{
  "symbol": "AAPL",
  "action": "buy",
  "quantity": 10
}`}</pre>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-semibold text-red-600 mb-2">Sell Example</h5>
                    <pre className="text-xs bg-red-50 p-2 rounded">{`{
  "symbol": "AAPL", 
  "action": "sell",
  "quantity": 5
}`}</pre>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Pro Tip:</strong> Test your webhook with a small quantity first to ensure it's working correctly.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Information */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">📊 Professional Charts</h4>
                <p className="text-sm text-blue-700">
                  Real TradingView widgets with professional indicators and analysis tools
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-2">⚡ Real-time Data</h4>
                <p className="text-sm text-green-700">
                  Live price feeds via Alpaca WebSocket with instant trade execution
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">🤖 Automated Trading</h4>
                <p className="text-sm text-purple-700">
                  TradingView webhook integration for fully automated strategy execution
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlpacaLiveChartDemo;