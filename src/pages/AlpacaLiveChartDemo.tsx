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
import { BuySellButtons } from '@/components/BuySellButtons';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            📈 Alpaca Live Trading Platform
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Professional trading platform with real-time data feeds and automated webhook integration
          </p>
        </div>

        {/* Status Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert className="border-blue-500/20 bg-blue-950/50 text-blue-200">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Sandbox Mode:</strong> Safe testing environment. No real money involved.
            </AlertDescription>
          </Alert>

          <Alert className="border-emerald-500/20 bg-emerald-950/50 text-emerald-200">
            <Webhook className="h-4 w-4" />
            <AlertDescription>
              <strong>TradingView Ready:</strong> Webhook endpoint active for automated trading alerts.
            </AlertDescription>
          </Alert>
        </div>

        {/* Symbol Selector */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5" />
              Stock Symbol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="symbol-select" className="text-slate-300">Select Symbol:</Label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {popularSymbols.map(sym => (
                    <SelectItem key={sym} value={sym} className="text-white hover:bg-slate-700">{sym}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => window.location.href = `/alpaca-live-chart/${selectedSymbol}`}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Update Chart
              </Button>
              
              {/* Buy/Sell Buttons */}
              <BuySellButtons />
            </div>
          </CardContent>
        </Card>

        {/* Main Trading Interface */}
        <Tabs defaultValue="chart" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 border-slate-700">
            <TabsTrigger value="chart" className="flex items-center gap-2 data-[state=active]:bg-slate-700 text-slate-300">
              <BarChart3 className="w-4 h-4" />
              Live Chart
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2 data-[state=active]:bg-slate-700 text-slate-300">
              <TrendingUp className="w-4 h-4" />
              Manual Trading
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-slate-700 text-slate-300">
              📋 Order History
            </TabsTrigger>
            <TabsTrigger value="webhook" className="flex items-center gap-2 data-[state=active]:bg-slate-700 text-slate-300">
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
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5" />
                    Manual Order Entry
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Place orders manually using the form below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualOrder} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="symbol" className="text-slate-300">Symbol</Label>
                        <Select 
                          value={manualOrder.symbol} 
                          onValueChange={(value) => setManualOrder({ ...manualOrder, symbol: value })}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            {popularSymbols.map(sym => (
                              <SelectItem key={sym} value={sym} className="text-white hover:bg-slate-700">{sym}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="quantity" className="text-slate-300">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={manualOrder.quantity}
                          onChange={(e) => setManualOrder({ ...manualOrder, quantity: parseInt(e.target.value) })}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="side" className="text-slate-300">Side</Label>
                        <Select 
                          value={manualOrder.side} 
                          onValueChange={(value: 'buy' | 'sell') => setManualOrder({ ...manualOrder, side: value })}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="buy" className="text-white hover:bg-slate-700">Buy</SelectItem>
                            <SelectItem value="sell" className="text-white hover:bg-slate-700">Sell</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="orderType" className="text-slate-300">Order Type</Label>
                        <Select 
                          value={manualOrder.orderType} 
                          onValueChange={(value: 'market' | 'limit') => setManualOrder({ ...manualOrder, orderType: value })}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="market" className="text-white hover:bg-slate-700">Market</SelectItem>
                            <SelectItem value="limit" className="text-white hover:bg-slate-700">Limit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="timeInForce" className="text-slate-300">Time in Force</Label>
                      <Select 
                        value={manualOrder.timeInForce} 
                        onValueChange={(value: any) => setManualOrder({ ...manualOrder, timeInForce: value })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="gtc" className="text-white hover:bg-slate-700">Good Till Canceled</SelectItem>
                          <SelectItem value="ioc" className="text-white hover:bg-slate-700">Immediate or Cancel</SelectItem>
                          <SelectItem value="day" className="text-white hover:bg-slate-700">Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Place {manualOrder.side.toUpperCase()} Order
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quick Order Buttons */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions for {selectedSymbol}</CardTitle>
                  <CardDescription className="text-slate-400">Fast one-click trading</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 h-16 text-lg"
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
                  
                  <div className="text-center text-sm text-slate-400 mt-4">
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
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Webhook className="w-5 h-5" />
                  TradingView Webhook Configuration
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Set up automated trading from TradingView alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Webhook URL */}
                <div>
                  <Label htmlFor="webhook-url" className="text-slate-300">Webhook URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      readOnly
                      value="https://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/tradingview-webhook"
                      className="font-mono text-sm bg-slate-800 border-slate-600 text-slate-300"
                    />
                    <Button variant="outline" size="sm" onClick={copyWebhookUrl} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Setup Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                    <li>Create an alert in TradingView</li>
                    <li>Set the webhook URL above in the alert settings</li>
                    <li>Use the JSON format below for the message</li>
                    <li>Your alerts will automatically place orders</li>
                  </ol>
                </div>

                {/* JSON Example */}
                <div>
                  <Label htmlFor="json-example" className="text-slate-300">Alert Message Format (JSON)</Label>
                  <div className="mt-2 p-4 bg-slate-950 text-emerald-400 rounded-lg font-mono text-sm overflow-x-auto border border-slate-700">
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
                  <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                    <h5 className="font-semibold text-emerald-400 mb-2">Buy Example</h5>
                    <pre className="text-xs bg-emerald-950/30 p-2 rounded text-emerald-300">{`{
  "symbol": "AAPL",
  "action": "buy",
  "quantity": 10
}`}</pre>
                  </div>
                  <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                    <h5 className="font-semibold text-red-400 mb-2">Sell Example</h5>
                    <pre className="text-xs bg-red-950/30 p-2 rounded text-red-300">{`{
  "symbol": "AAPL", 
  "action": "sell",
  "quantity": 5
}`}</pre>
                  </div>
                </div>

                <Alert className="border-blue-500/20 bg-blue-950/50">
                  <Info className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    <strong>Pro Tip:</strong> Test your webhook with a small quantity first to ensure it's working correctly.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Information */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h4 className="font-semibold text-emerald-400 mb-2">📊 Professional Charts</h4>
                <p className="text-sm text-slate-300">
                  Real-time Lightweight Charts with professional indicators and analysis tools
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">⚡ Real-time Data</h4>
                <p className="text-sm text-slate-300">
                  Live price feeds via Alpaca WebSocket with instant trade execution
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">🤖 Automated Trading</h4>
                <p className="text-sm text-slate-300">
                  TradingView webhook integration for seamless automated strategy execution
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