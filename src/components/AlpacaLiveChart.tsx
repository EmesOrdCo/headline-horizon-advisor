import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAlpacaStreamSingleton } from '@/hooks/useAlpacaStreamSingleton';
import { TradingModal } from "@/components/TradingModal";
import { useAlpacaBroker } from '@/hooks/useAlpacaBroker';

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
  const [userAccountId, setUserAccountId] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Use the singleton WebSocket for this page only
  const { streamData, isConnected, errorMessage, connectionStatus, connect } = useAlpacaStreamSingleton({
    symbols: [symbol],
    enabled: true
  });

  // Use Alpaca broker for trading operations
  const { placeOrder: alpacaPlaceOrder, loading: brokerLoading } = useAlpacaBroker();

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

  // Load data on component mount
  useEffect(() => {
    fetchHistoricalData();
  }, [symbol]);

  // Place buy/sell order via Alpaca
  const placeOrder = async (side: 'buy' | 'sell') => {
    if (!userAccountId) {
      toast.error('Alpaca account not linked. Please complete onboarding first.');
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to place orders');
        return;
      }

      const orderData = {
        account_id: userAccountId,
        symbol,
        qty: '1',
        side,
        type: 'market' as const,
        time_in_force: 'gtc' as const
      };

      console.log('Placing Alpaca order:', orderData);
      
      const { data, error } = await supabase.functions.invoke('alpaca-place-order', {
        body: orderData
      });

      if (error) {
        throw new Error(error.message);
      }
      
      toast.success(`${side.toUpperCase()} order placed successfully for ${symbol}`, {
        description: `Order ID: ${data.id}`
      });
      
    } catch (error: any) {
      console.error('Error placing Alpaca order:', error);
      
      // Handle specific Alpaca error messages
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
            <TradingModal 
              symbol={symbol} 
              currentPrice={currentPrice} 
              initialMode="buy"
            >
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
                disabled={!userAccountId || isPlacingOrder || brokerLoading}
              >
                {isPlacingOrder ? '...' : '🟢 BUY'} {symbol}
              </Button>
            </TradingModal>
            <TradingModal 
              symbol={symbol} 
              currentPrice={currentPrice} 
              initialMode="sell"
            >
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                disabled={!userAccountId || isPlacingOrder || brokerLoading}
              >
                {isPlacingOrder ? '...' : '🔴 SELL'} {symbol}
              </Button>
            </TradingModal>
          </div>
          <p className="text-center text-sm text-slate-400 mt-3">
            Market orders • 1 share • Sandbox Mode • {userAccountId ? 'Account Linked' : 'No Account Linked'}
          </p>
          {!userAccountId && (
            <p className="text-center text-xs text-red-400 mt-1">
              Complete Alpaca onboarding to enable trading
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlpacaLiveChart;