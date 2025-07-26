import React, { useState } from 'react';
import { TradingChart } from '@/components/chart/TradingChart';
import DashboardNav from '@/components/DashboardNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Activity, Zap } from 'lucide-react';

const AdvancedTradingView: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  
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
      title: "High Performance",
      description: "GPU-accelerated Canvas rendering"
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
                Professional-grade charting with real-time data and advanced technical analysis
              </p>
            </div>
            <Badge variant="default" className="px-3 py-1">
              <Zap className="h-4 w-4 mr-1" />
              Live Data
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
              {['AAPL', 'GOOGL', 'TSLA', 'BTC-USD'].map((symbol) => (
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

        {/* Main Chart */}
        <TradingChart 
          symbol={selectedSymbol} 
          initialTimeFrame="1h"
          className="mb-8"
        />

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
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  GPU-accelerated rendering
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  &lt;16ms frame times
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Virtualized data windows
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Memory-efficient structures
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  High-DPI display support
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