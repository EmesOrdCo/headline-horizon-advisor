import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries, LineStyle } from 'lightweight-charts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAlpacaStreamSingleton } from '@/hooks/useAlpacaStreamSingleton';
import { 
  TrendingUp, 
  BarChart3, 
  Crosshair, 
  Minus, 
  TrendingDown, 
  Square, 
  Triangle, 
  Circle, 
  Type, 
  Ruler, 
  Grid,
  Volume,
  Activity,
  Target,
  MousePointer
} from 'lucide-react';

interface AlpacaBar {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

const AlpacaLiveChart: React.FC<{ symbol?: string }> = ({ symbol = 'AAPL' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [dataSource, setDataSource] = useState<'historical' | 'live' | 'error'>('historical');
  const [historicalDataLoaded, setHistoricalDataLoaded] = useState(false);
  
  // Chart control states
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [activeTool, setActiveTool] = useState<string>('cursor');
  const [showGrid, setShowGrid] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);

  // Use the singleton WebSocket for this page only
  const { streamData, isConnected, errorMessage, connectionStatus, connect } = useAlpacaStreamSingleton({
    symbols: [symbol],
    enabled: true
  });

  // Initialize Lightweight Charts
  useEffect(() => {
    console.log('Initializing Lightweight Chart for Alpaca data...');
    
    const initChart = () => {
      if (!chartContainerRef.current) {
        console.error('Chart container not found');
        setIsLoading(false);
        return;
      }

      try {
        const containerWidth = Math.max(chartContainerRef.current.clientWidth || 800, 400);
        
        // Create chart with dark theme to match website
        const chart = createChart(chartContainerRef.current, {
          width: containerWidth,
          height: 500,
          layout: {
            background: { color: '#0f172a' },
            textColor: '#e2e8f0',
          },
          grid: {
            vertLines: { color: '#1e293b' },
            horzLines: { color: '#1e293b' },
          },
          crosshair: {
            mode: 1,
          },
          rightPriceScale: {
            borderColor: '#475569',
          },
          timeScale: {
            borderColor: '#475569',
            timeVisible: true,
            secondsVisible: false,
          },
        });

        // Add candlestick series
        const candleSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#10b981',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });
        
        candlestickSeriesRef.current = candleSeries;
        chartRef.current = chart;

        // Handle resize
        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            const newWidth = Math.max(chartContainerRef.current.clientWidth || 800, 400);
            chartRef.current.applyOptions({
              width: newWidth,
            });
          }
        };

        window.addEventListener('resize', handleResize);
        toast.success('Chart initialized successfully');

        return () => {
          window.removeEventListener('resize', handleResize);
        };

      } catch (error) {
        console.error('Chart initialization failed:', error);
        setIsLoading(false);
        toast.error('Chart initialization failed');
      }
    };

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(initChart);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  // Fetch historical data from Alpaca
  const fetchHistoricalData = async () => {
    try {
      console.log('📊 Fetching Alpaca historical data for', symbol);
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to access trading features');
        return;
      }

      // Call our edge function to get Alpaca historical data
      const { data, error } = await supabase.functions.invoke('alpaca-historical-data', {
        body: { 
          symbol,
          timeframe: '1Min',
          limit: 1000
        }
      });

      if (error) {
        console.error('❌ Alpaca edge function error:', error);
        throw error;
      }

      if (data?.bars && Array.isArray(data.bars)) {
        console.log('Alpaca historical data loaded:', data.bars.length, 'bars');
        
        const formatted: CandlestickData[] = data.bars.map((bar: AlpacaBar) => ({
          time: Math.floor(new Date(bar.t).getTime() / 1000) as any,
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
        }));

        if (candlestickSeriesRef.current && formatted.length > 0) {
          candlestickSeriesRef.current.setData(formatted);
          const latestPrice = formatted[formatted.length - 1].close;
          setCurrentPrice(latestPrice);
          setHistoricalDataLoaded(true);
          setDataSource('historical');
        }
      } else {
        throw new Error('Invalid Alpaca data format received');
      }
    } catch (error) {
      console.error('❌ Error fetching Alpaca historical data:', error);
      toast.error('Failed to fetch Alpaca data');
      setDataSource('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle real-time updates from WebSocket
  useEffect(() => {
    if (streamData[symbol]) {
      const trade = streamData[symbol];
      const price = trade.price;
      const timestamp = Math.floor(new Date(trade.timestamp).getTime() / 1000);

      if (candlestickSeriesRef.current && price) {
        candlestickSeriesRef.current.update({
          time: timestamp as any,
          close: price,
          open: currentPrice || price,
          high: Math.max(currentPrice || price, price),
          low: Math.min(currentPrice || price, price),
        });
      }

      setCurrentPrice(price);
      setLastUpdate(new Date().toLocaleTimeString());
      setDataSource('live'); // Mark that we're receiving live data
    }
  }, [streamData, symbol, currentPrice]);

  // Track WebSocket connection status
  useEffect(() => {
    if (connectionStatus === 'error') {
      setDataSource('error');
    }
  }, [connectionStatus]);

  // Load data on component mount
  useEffect(() => {
    fetchHistoricalData();
  }, [symbol]);

  // Place buy/sell order via Alpaca
  const placeOrder = async (side: 'buy' | 'sell') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to place orders');
        return;
      }

      const { data, error } = await supabase.functions.invoke('alpaca-place-order', {
        body: {
          symbol,
          qty: 1,
          side,
          type: 'market',
          time_in_force: 'gtc'
        }
      });

      if (error) throw error;

      toast.success(`${side.toUpperCase()} order placed via Alpaca for ${symbol}`);
    } catch (error: any) {
      console.error('Error placing Alpaca order:', error);
      toast.error(`Failed to place ${side} order: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Price and Status */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-2xl text-white">{symbol} Live Trading</CardTitle>
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? 'Live Feed Active' : 'Disconnected'}
              </Badge>
              {errorMessage && (
                <Badge variant="destructive" className="text-xs">
                  {errorMessage}
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-400">${currentPrice.toFixed(2)}</div>
              <div className="text-sm text-slate-400">
                {lastUpdate ? `Updated: ${lastUpdate}` : 'Current Price'}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Data Source Status Card */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">Data Source:</span>
                {dataSource === 'live' && (
                  <Badge className="bg-green-600 text-white">
                    🔴 Live WebSocket Data
                  </Badge>
                )}
                {dataSource === 'historical' && (
                  <Badge variant="secondary" className="bg-yellow-600 text-white">
                    📊 Historical Data Only
                  </Badge>
                )}
                {dataSource === 'error' && (
                  <Badge variant="destructive">
                    ❌ Connection Failed
                  </Badge>
                )}
              </div>
              
              {!isConnected && errorMessage && (
                <div className="text-sm text-red-400">
                  Error: {errorMessage}
                </div>
              )}
            </div>
            
            {!isConnected && (
              <Button
                onClick={connect}
                variant="outline"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              >
                🔄 Retry Connection
              </Button>
            )}
          </div>
          
          {dataSource === 'historical' && historicalDataLoaded && (
            <div className="mt-2 text-xs text-slate-500">
              Showing historical data from Alpaca. Real-time WebSocket connection failed.
              {errorMessage && ` (${errorMessage})`}
            </div>
          )}
          
          {dataSource === 'error' && (
            <div className="mt-2 text-xs text-red-500">
              Unable to load data. Please check your connection and try again.
            </div>
          )}
        </CardContent>
      </Card>

      {/* TradingView-Style Chart Controls */}
      <div className="flex gap-4">
        {/* Left Sidebar - Drawing Tools */}
        <Card className="bg-slate-900/50 border-slate-700 w-16">
          <CardContent className="p-2 space-y-2">
            {/* Tool buttons */}
            {[
              { id: 'cursor', icon: MousePointer, label: 'Cursor' },
              { id: 'crosshair', icon: Crosshair, label: 'Crosshair' },
              { id: 'trend-line', icon: TrendingUp, label: 'Trend Line' },
              { id: 'horizontal', icon: Minus, label: 'Horizontal Line' },
              { id: 'rectangle', icon: Square, label: 'Rectangle' },
              { id: 'triangle', icon: Triangle, label: 'Triangle' },
              { id: 'circle', icon: Circle, label: 'Circle' },
              { id: 'text', icon: Type, label: 'Text' },
              { id: 'ruler', icon: Ruler, label: 'Ruler' },
            ].map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "ghost"}
                size="sm"
                className="w-10 h-10 p-0"
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
              >
                <tool.icon className="h-4 w-4" />
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Main Chart Area */}
        <div className="flex-1 space-y-4">
          {/* Top Chart Controls */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Timeframe Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-400">Timeframe:</span>
                  <div className="flex space-x-1">
                    {['1m', '5m', '15m', '30m', '1h', '4h', '1D'].map((tf) => (
                      <Button
                        key={tf}
                        variant={selectedTimeframe === tf ? "default" : "ghost"}
                        size="sm"
                        className="px-3 py-1 h-8 text-xs"
                        onClick={() => setSelectedTimeframe(tf)}
                      >
                        {tf}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Chart Type */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-400">Chart:</span>
                  <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candlestick">Candlestick</SelectItem>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Indicators */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-400">Indicators:</span>
                  <Select onValueChange={(value) => {
                    if (!activeIndicators.includes(value)) {
                      setActiveIndicators([...activeIndicators, value]);
                    }
                  }}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue placeholder="Add..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sma">SMA (20)</SelectItem>
                      <SelectItem value="ema">EMA (20)</SelectItem>
                      <SelectItem value="rsi">RSI (14)</SelectItem>
                      <SelectItem value="macd">MACD</SelectItem>
                      <SelectItem value="bollinger">Bollinger Bands</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Display Options */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant={showGrid ? "default" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setShowGrid(!showGrid)}
                    title="Toggle Grid"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={showVolume ? "default" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setShowVolume(!showVolume)}
                    title="Toggle Volume"
                  >
                    <Volume className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Active Indicators */}
              {activeIndicators.length > 0 && (
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-700">
                  <span className="text-sm text-slate-400">Active:</span>
                  {activeIndicators.map((indicator) => (
                    <Badge
                      key={indicator}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-600"
                      onClick={() => setActiveIndicators(activeIndicators.filter(i => i !== indicator))}
                    >
                      {indicator.toUpperCase()} ×
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-0">
              <div className="relative">
                <div 
                  ref={chartContainerRef} 
                  className="w-full h-[500px]"
                  style={{ minHeight: '500px', minWidth: '100%' }}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10">
                    <div className="text-lg text-slate-300">Loading chart data...</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trading Controls */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-center text-white">Quick Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center space-x-6">
                <Button
                  onClick={() => placeOrder('buy')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
                  disabled={!isConnected || isLoading}
                >
                  🟢 BUY {symbol}
                </Button>
                <Button
                  onClick={() => placeOrder('sell')}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                  disabled={!isConnected || isLoading}
                >
                  🔴 SELL {symbol}
                </Button>
              </div>
              <p className="text-center text-sm text-slate-400 mt-3">
                Market orders • 1 share • Sandbox Mode • {dataSource === 'live' ? 'Real-time Data' : dataSource === 'historical' ? 'Historical Data' : 'No Data'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AlpacaLiveChart;