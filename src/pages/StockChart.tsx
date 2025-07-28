import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createChart, IChartApi, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { 
  ArrowLeft, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  RotateCcw,
  Crosshair,
  Move,
  Pencil,
  Type,
  Circle,
  Square,
  Triangle,
  Trash2,
  Eye,
  Settings,
  MoreHorizontal,
  Star
 } from "lucide-react";
import { useStockPrices } from "@/hooks/useStockPrices";
import CompanyLogo from "@/components/CompanyLogo";

interface AlpacaBar {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

// Alpaca Chart Widget Component
const AlpacaChartWidget: React.FC<{ symbol: string }> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Lightweight Charts with proper margins
  useEffect(() => {
    const initChart = () => {
      if (!chartContainerRef.current) {
        setIsLoading(false);
        return;
      }

      try {
        const containerWidth = Math.max(chartContainerRef.current.clientWidth || 800, 400);
        
        // Create chart with dark theme and proper layout
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
            visible: true,
          },
          leftPriceScale: {
            visible: false,
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

        // Load data immediately after chart initialization
        setTimeout(() => {
          fetchHistoricalData();
        }, 200);

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

        return () => {
          window.removeEventListener('resize', handleResize);
        };

      } catch (error) {
        console.error('Chart initialization failed:', error);
        setIsLoading(false);
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
        const formatted: CandlestickData[] = data.bars.map((bar: AlpacaBar) => ({
          time: Math.floor(new Date(bar.t).getTime() / 1000) as any,
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
        }));

        if (candlestickSeriesRef.current && formatted.length > 0) {
          candlestickSeriesRef.current.setData(formatted);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching Alpaca historical data:', error);
      toast.error('Failed to fetch Alpaca data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and when chart is ready
  useEffect(() => {
    if (chartRef.current && candlestickSeriesRef.current) {
      fetchHistoricalData();
    }
  }, [symbol, chartRef.current, candlestickSeriesRef.current]);

  return (
    <div className="w-full h-full">
      <div 
        ref={chartContainerRef} 
        className="w-full h-full"
        style={{ minHeight: '500px', minWidth: '100%' }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10">
          <div className="text-lg text-slate-300">Loading chart data...</div>
        </div>
      )}
    </div>
  );
};

// Professional Trading Panel Component
const TradingPanel: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [userAccountId, setUserAccountId] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState('');
  const [timeInForce, setTimeInForce] = useState<'day' | 'gtc' | 'ioc' | 'fok'>('gtc');
  const [extendedHours, setExtendedHours] = useState(false);

  // Get user's Alpaca account ID
  useEffect(() => {
    const getUserAccount = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('alpaca_account_id')
          .eq('id', session.user.id)
          .single();

        if (profile?.alpaca_account_id) {
          setUserAccountId(profile.alpaca_account_id);
        }
      } catch (error) {
        console.error('Error getting user account:', error);
      }
    };

    getUserAccount();
  }, []);

  // Place buy/sell order via Alpaca
  const placeOrder = async (side: 'buy' | 'sell') => {
    if (!userAccountId) {
      toast.error('Alpaca account not linked. Please complete onboarding first.');
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast.error('Please enter a valid limit price');
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to place orders');
        return;
      }

      const orderData: any = {
        account_id: userAccountId,
        symbol,
        qty: quantity,
        side,
        type: orderType,
        time_in_force: timeInForce,
        extended_hours: extendedHours
      };

      if (orderType === 'limit') {
        orderData.limit_price = limitPrice;
      }

      const { data, error } = await supabase.functions.invoke('alpaca-place-order', {
        body: orderData
      });

      if (error) {
        throw new Error(error.message);
      }
      
      toast.success(`${side.toUpperCase()} order placed successfully`, {
        description: `${quantity} shares of ${symbol} - Order ID: ${data.id}`
      });
      
    } catch (error: any) {
      console.error('Error placing Alpaca order:', error);
      
      let errorMessage = error.message || 'Unknown error occurred';
      
      if (errorMessage.includes('insufficient')) {
        errorMessage = 'Insufficient buying power to place order';
      } else if (errorMessage.includes('market closed') || errorMessage.includes('not tradable')) {
        errorMessage = 'Market is currently closed or asset not tradable';
      } else if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
        errorMessage = 'Trading not permitted. Check account status.';
      } else if (errorMessage.includes('404')) {
        errorMessage = 'Asset not found or account access denied';
      }
      
      toast.error(`Failed to place ${side} order`, {
        description: errorMessage
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-white text-lg font-medium mb-4">Trading Panel</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
        {/* Order Type */}
        <div>
          <label className="text-sm text-slate-300 block mb-2">Order Type</label>
          <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="market" className="text-white">Market</SelectItem>
              <SelectItem value="limit" className="text-white">Limit</SelectItem>
              <SelectItem value="stop" className="text-white">Stop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-sm text-slate-300 block mb-2">Quantity</label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Shares"
            className="bg-slate-700 border-slate-600 text-white"
            min="1"
          />
        </div>

        {/* Limit Price (conditional) */}
        {orderType === 'limit' && (
          <div>
            <label className="text-sm text-slate-300 block mb-2">Limit Price</label>
            <Input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="$0.00"
              className="bg-slate-700 border-slate-600 text-white"
              step="0.01"
            />
          </div>
        )}

        {/* Time in Force */}
        <div>
          <label className="text-sm text-slate-300 block mb-2">Time in Force</label>
          <Select value={timeInForce} onValueChange={(value: any) => setTimeInForce(value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="day" className="text-white">Day</SelectItem>
              <SelectItem value="gtc" className="text-white">GTC</SelectItem>
              <SelectItem value="ioc" className="text-white">IOC</SelectItem>
              <SelectItem value="fok" className="text-white">FOK</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Extended Hours Toggle */}
        <div className="flex flex-col">
          <label className="text-sm text-slate-300 block mb-2">Options</label>
          <div className="flex items-center space-x-2 h-10">
            <input
              type="checkbox"
              id="extended-hours"
              checked={extendedHours}
              onChange={(e) => setExtendedHours(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
            />
            <label htmlFor="extended-hours" className="text-sm text-slate-300">
              Extended Hours
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={() => placeOrder('buy')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 h-10"
            disabled={!userAccountId || isPlacingOrder}
          >
            {isPlacingOrder ? '...' : 'BUY'}
          </Button>
          <Button
            onClick={() => placeOrder('sell')}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 h-10"
            disabled={!userAccountId || isPlacingOrder}
          >
            {isPlacingOrder ? '...' : 'SELL'}
          </Button>
        </div>
      </div>

      {/* Account Status */}
      <div className="text-xs text-center mt-3">
        {userAccountId ? (
          <span className="text-green-400">✓ Alpaca Account Linked</span>
        ) : (
          <span className="text-red-400">⚠ Complete Alpaca onboarding to enable trading</span>
        )}
      </div>
    </div>
  );
};

const StockChart: React.FC = () => {
  console.log('StockChart component loaded - WebSocketMonitor should be removed');
  
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [chartType, setChartType] = useState<'line' | 'candles'>('candles');
  
  // Fetch current stock data and historical data - use SPY as it has extended hours trading
  const activeSymbol = symbol || 'AAPL';
  const { data: stockPrices } = useStockPrices([activeSymbol]);
  
  // Fetch watchlist data - include globally traded assets
  const watchlistSymbols = ['SPY', 'QQQ', 'GLD', 'TLT', 'EEM', 'IWM', 'XLF'];
  const { data: watchlistPrices } = useStockPrices(watchlistSymbols);
  
  const leftSidebarTools = [
    { icon: Crosshair, label: 'Cursor' },
    { icon: Move, label: 'Hand' },
    { icon: Pencil, label: 'Draw' },
    { icon: TrendingUp, label: 'Trend Line' },
    { icon: Type, label: 'Text' },
    { icon: Circle, label: 'Circle' },
    { icon: Square, label: 'Rectangle' },
    { icon: Triangle, label: 'Triangle' },
    { icon: Trash2, label: 'Remove' },
    { icon: Eye, label: 'Hide' },
    { icon: Settings, label: 'Settings' }
  ];

  // Create watchlist with REAL data from APIs
  const watchlistStocks = watchlistSymbols.map(sym => {
    const price = watchlistPrices?.find(p => p.symbol === sym);
    
    // Use REAL API data
    const currentPrice = price?.price || 0;
    const change = price?.change || 0;
    const changePercent = price?.changePercent || 0;
    
    return {
      symbol: sym,
      price: currentPrice > 0 ? currentPrice.toFixed(2) : '0.00',
      change: change >= 0 ? `+${Math.abs(change).toFixed(2)}` : `-${Math.abs(change).toFixed(2)}`,
      changePercent: changePercent >= 0 ? `+${Math.abs(changePercent).toFixed(2)}%` : `-${Math.abs(changePercent).toFixed(2)}%`,
      positive: change >= 0
    };
  });

  // Get current stock info using REAL data from APIs
  const currentStock = stockPrices?.find(s => s.symbol === activeSymbol);
  
  // Use REAL data from APIs
  const currentPrice = currentStock?.price || 0;
  const bidPrice = currentStock?.bidPrice || (currentPrice * 0.999);
  const askPrice = currentStock?.askPrice || (currentPrice * 1.001);
  const spread = askPrice - bidPrice;
  const spreadPercent = bidPrice > 0 ? ((spread / bidPrice) * 100) : 0;
  
  // Calculate change using REAL data
  const previousClose = currentStock?.previousClose || currentPrice;
  const change = currentStock?.change || (currentPrice - previousClose);
  const changePercent = currentStock?.changePercent || (previousClose > 0 ? ((change / previousClose) * 100) : 0);
  
  // Format volume
  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`;
    return vol.toString();
  };
  
  // Get company name mapping
  const companyNames: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'TSLA': 'Tesla, Inc.',
    'NFLX': 'Netflix, Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms, Inc.',
    'NVDA': 'NVIDIA Corporation'
  };
  
  const companyName = companyNames[activeSymbol] || `${activeSymbol} ETF`;
  const exchange = activeSymbol.startsWith('SPY') || activeSymbol.startsWith('QQQ') ? 'NYSE Arca' : 'NASDAQ';

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Top Navigation Bar - Compact layout */}
      <div className="flex items-center justify-between px-2 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {/* Go Back Button - Compact */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white p-1 min-w-fit"
            onClick={() => navigate('/watchlist')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          {/* Stock Symbol with Real Logo - Compact */}
          <div className="flex items-center space-x-1 min-w-0">
            <CompanyLogo symbol={activeSymbol || 'AAPL'} size="sm" />
            <span className="text-white font-bold text-base">{activeSymbol}</span>
            <span className="text-slate-400 text-xs hidden sm:inline">{exchange}</span>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" title="Historical data" />
          </div>
          
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white p-1 min-w-fit">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart Type Buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={`text-sm px-3 py-1 h-8 rounded ${
                chartType === 'line' ? 'bg-green-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`text-sm px-3 py-1 h-8 rounded ${
                chartType === 'candles' ? 'bg-green-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => setChartType('candles')}
            >
              Candles
            </Button>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center space-x-1">
            {['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M'].map((timeframe) => (
              <Button
                key={timeframe}
                variant="ghost"
                size="sm"
                className={`text-sm px-2 py-1 h-8 rounded ${
                  timeframe === selectedTimeframe 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          {/* Indicators Button */}
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-sm">
            <BarChart3 className="w-4 h-4 mr-1" />
            Indicators
          </Button>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Alert
          </Button>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-sm">
            <RotateCcw className="w-4 h-4 mr-1" />
            Replay
          </Button>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm px-3 py-1 bg-blue-600 text-white"
            >
              Trading View
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm px-3 py-1 text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => navigate(`/stock-analysis/${activeSymbol}`)}
            >
              Analysis
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm px-3 py-1 text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => navigate(`/stock-data/${activeSymbol}`)}
            >
              Data
            </Button>
          </div>
        </div>
      </div>

      {/* Price Header - EXACT replica */}
      <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <span className="text-white text-2xl font-bold">{currentPrice.toFixed(2)}</span>
              <span className={`px-2 py-1 text-sm rounded ${change >= 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="flex space-x-6 text-sm">
              <div className="text-slate-400">O <span className="text-white">{currentPrice.toFixed(2)}</span></div>
              <div className="text-slate-400">H <span className="text-white">{currentPrice.toFixed(2)}</span></div>
              <div className="text-slate-400">L <span className="text-white">{currentPrice.toFixed(2)}</span></div>
              <div className="text-slate-400">C <span className="text-white">{currentPrice.toFixed(2)}</span></div>
              <div className="text-slate-400">Vol <span className="text-blue-400">{formatVolume(1000000)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* Main Chart Area with Trading Panel */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Alpaca Chart */}
          <div className="flex-1 bg-slate-900 relative min-h-0 pl-4">
            <AlpacaChartWidget symbol={activeSymbol} />
          </div>
          
          {/* Bottom Trading Panel - Only spans chart area width */}
          <div className="border-t border-slate-700 bg-slate-800/50 p-4 flex-shrink-0">
            <TradingPanel symbol={activeSymbol} />
          </div>
        </div>

        {/* Right Sidebar - Watchlist & Info - EXACT replica */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          {/* Watchlist Section */}
          <div className="border-b border-slate-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Watchlist</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-slate-400 hover:text-white">
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-slate-400 hover:text-white">
                    <Settings className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-slate-400 hover:text-white">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400 border-b border-slate-600 pb-2 mb-2">
                <span className="flex-1">Symbol</span>
                <span className="w-16 text-right">Last</span>
                <span className="w-16 text-right">Chg</span>
                <span className="w-16 text-right">Chg%</span>
              </div>

              <div className="space-y-1">
                {watchlistStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center space-x-2 py-1 hover:bg-slate-700/50 cursor-pointer text-xs rounded"
                    onClick={() => navigate(`/stock-chart/${stock.symbol}`)}
                  >
                    <span className="flex-1 text-white font-medium">{stock.symbol}</span>
                    <span className="w-16 text-right text-white">{stock.price}</span>
                    <span className={`w-16 text-right ${stock.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.change}
                    </span>
                    <span className={`w-16 text-right ${stock.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.changePercent}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buy/Sell Spread - EXACT replica */}
          <div className="border-b border-slate-700 p-4">
            <h3 className="text-white font-medium mb-3">Buy/Sell Spread</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-medium">BID (Sell)</span>
                <span className="text-green-400 font-bold text-lg">${bidPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400 font-medium">ASK (Buy)</span>
                <span className="text-red-400 font-bold text-lg">${askPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-600 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Spread</span>
                  <span className="text-white">${spread.toFixed(4)}</span>
                </div>
                <div className="text-xs text-slate-500 text-right">{spreadPercent.toFixed(3)}%</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Real-time bid/ask prices for {activeSymbol}
            </div>
          </div>

          {/* Stock Details - EXACT replica */}
          <div className="flex-1 p-4">
            <h3 className="text-white font-medium mb-3">{companyName}</h3>
            <div className="text-sm text-slate-400 mb-3">{exchange} • Real-time • Live</div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Market Cap</span>
                <span className="text-white">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">P/E Ratio</span>
                <span className="text-white">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">52W High</span>
                <span className="text-white">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">52W Low</span>
                <span className="text-white">N/A</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-white">{currentPrice.toFixed(2)}</span>
                <span className={change >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {change >= 0 ? '+' : ''}{change.toFixed(2)} {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Last update: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StockChart;