import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AlpacaBar {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

interface AlpacaTrade {
  T: string; // message type
  S: string; // symbol
  p: number; // price
  s: number; // size
  t: string; // timestamp
}

const AlpacaLiveChart: React.FC<{ symbol?: string }> = ({ symbol = 'AAPL' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null); // Use any to avoid type issues
  const wsRef = useRef<WebSocket | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Initialize Lightweight Charts with Alpaca data
  useEffect(() => {
    console.log('Initializing Lightweight Chart for Alpaca data...');
    
    // Add delay to ensure DOM is ready
    const initChart = () => {
      if (!chartContainerRef.current) {
        console.error('Chart container not found');
        setIsLoading(false);
        toast.error('Chart container not available');
        return;
      }

      try {
        // Ensure container has proper dimensions
        const containerWidth = Math.max(chartContainerRef.current.clientWidth || 800, 400);
        
        console.log('Container width:', containerWidth);
        console.log('Container element:', chartContainerRef.current);
        
        // Create chart using Lightweight Charts
        const chart = createChart(chartContainerRef.current, {
          width: containerWidth,
          height: 500,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { color: '#e6e6e6' },
            horzLines: { color: '#e6e6e6' },
          },
          crosshair: {
            mode: 1,
          },
          rightPriceScale: {
            borderColor: '#cccccc',
          },
          timeScale: {
            borderColor: '#cccccc',
            timeVisible: true,
            secondsVisible: false,
          },
        });

        console.log('Lightweight Chart initialized successfully');

        // Add candlestick series using correct v5 API method
        const candleSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });
        
        console.log('Candlestick series created for Alpaca data');

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

        // Success notification
        toast.success('Chart initialized successfully');

      } catch (error) {
        console.error('Chart initialization failed:', error);
        setIsLoading(false);
        toast.error('Chart initialization failed: ' + (error as any).message);
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(initChart);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      console.log('Cleaning up Lightweight Chart...');
      window.removeEventListener('resize', () => {});
      if (chartRef.current) {
        chartRef.current.remove();
      }
      if (wsRef.current) {
        wsRef.current.close();
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
        console.error('❌ No session found');
        toast.error('Please log in to access trading features');
        return;
      }

      console.log('✅ Session found, calling Alpaca historical data edge function...');

      // Call our edge function to get Alpaca historical data
      const { data, error } = await supabase.functions.invoke('alpaca-historical-data', {
        body: { 
          symbol,
          timeframe: '1Min',
          limit: 1000
        }
      });

      console.log('📊 Alpaca edge function response:', { data, error });

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

        console.log('Alpaca data formatted for chart:', formatted.length, 'candles');

        if (candlestickSeriesRef.current && formatted.length > 0) {
          console.log('Setting chart data with Alpaca bars:', formatted.length);
          candlestickSeriesRef.current.setData(formatted);
          
          const latestPrice = formatted[formatted.length - 1].close;
          setCurrentPrice(latestPrice);
          console.log('Current price from Alpaca data:', latestPrice);
        } else {
          console.warn('No series or no Alpaca data - Series:', !!candlestickSeriesRef.current, 'Data length:', formatted.length);
        }
      } else {
        console.error('❌ Invalid Alpaca data format received:', data);
        throw new Error('Invalid Alpaca data format received');
      }
    } catch (error) {
      console.error('❌ Error fetching Alpaca historical data:', error);
      toast.error('Failed to fetch Alpaca data: ' + (error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to Alpaca WebSocket for real-time updates
  const connectWebSocket = async () => {
    try {
      console.log('Starting Alpaca WebSocket connection...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session for Alpaca WebSocket');
        return;
      }

      // Use our Supabase edge function WebSocket endpoint for Alpaca
      const wsUrl = `wss://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/alpaca-stream`;
      
      console.log('Connecting to Alpaca WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Alpaca WebSocket connected');
        setIsConnected(true);
        toast.success('Connected to Alpaca live data feed');
        
        // Subscribe to Alpaca trades for the symbol
        console.log('Subscribing to Alpaca symbol:', symbol);
        const subscribeMessage = { 
          type: 'subscribe',
          symbols: [symbol]
        };
        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        try {
          console.log('Alpaca WebSocket message received:', event.data);
          const data = JSON.parse(event.data);
          
          // Handle Alpaca trade messages
          if (Array.isArray(data)) {
            data.forEach(msg => {
              if (msg.T === 't' && msg.S === symbol) {
                const trade = msg;
                const price = trade.p;
                const timestamp = Math.floor(new Date(trade.t).getTime() / 1000);

                console.log('Alpaca trade update:', { symbol, price, timestamp });

                // Update chart with new Alpaca trade price
                if (candlestickSeriesRef.current) {
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
              }
            });
          } else if (data.type === 'trade' && data.symbol === symbol) {
            const price = data.data.p;
            const timestamp = Math.floor(new Date(data.data.t).getTime() / 1000);

            console.log('Alpaca single trade update:', { symbol, price, timestamp });

            if (candlestickSeriesRef.current) {
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
          } else {
            console.log('Other Alpaca WebSocket data:', data);
          }
        } catch (error) {
          console.error('Error parsing Alpaca WebSocket message:', error, event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('Alpaca WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        toast.info('Disconnected from Alpaca live data feed');
      };

      ws.onerror = (error) => {
        console.error('Alpaca WebSocket error:', error);
        setIsConnected(false);
        toast.error('Alpaca WebSocket connection error');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error setting up Alpaca WebSocket:', error);
      toast.error('Failed to connect to Alpaca live data');
    }
  };

  // Place buy/sell order via Alpaca
  const placeOrder = async (side: 'buy' | 'sell') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to place orders');
        return;
      }

      console.log(`Placing ${side} order via Alpaca for ${symbol}`);

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
      console.log('Alpaca order successful:', data);
    } catch (error: any) {
      console.error('Error placing Alpaca order:', error);
      toast.error(`Failed to place ${side} order via Alpaca: ${error.message}`);
    }
  };

  // Load Alpaca data on component mount
  useEffect(() => {
    // Clean up any existing WebSocket connections first
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    fetchHistoricalData();
    connectWebSocket();
    
    // Cleanup on component unmount
    return () => {
      console.log('Component unmounting - cleaning up Alpaca WebSocket');
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setIsConnected(false);
      }
    };
  }, [symbol]);

  return (
    <div className="w-full space-y-6">
      {/* Header with Alpaca Price and Status */}
      <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-bold text-gray-800">{symbol} Alpaca Live Trading</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Alpaca Live Feed Active' : 'Disconnected from Alpaca'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">${currentPrice.toFixed(2)}</div>
          <div className="text-sm text-gray-600">
            {lastUpdate ? `Alpaca Update: ${lastUpdate}` : 'Alpaca Current Price'}
          </div>
        </div>
      </div>

      {/* Lightweight Chart with Alpaca Data */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 relative">
        <div 
          ref={chartContainerRef} 
          className="w-full h-[500px]"
          style={{ minHeight: '500px', minWidth: '100%' }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-lg text-gray-600">Loading Alpaca chart data...</div>
          </div>
        )}
      </div>

      {/* Alpaca Trading Controls */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-center">Alpaca Quick Trading</h3>
        <div className="flex justify-center space-x-6">
          <Button
            onClick={() => placeOrder('buy')}
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-3 text-lg"
            disabled={!isConnected || isLoading}
          >
            🟢 BUY {symbol} via Alpaca
          </Button>
          <Button
            onClick={() => placeOrder('sell')}
            className="bg-red-600 hover:bg-red-700 text-white px-12 py-3 text-lg"
            disabled={!isConnected || isLoading}
          >
            🔴 SELL {symbol} via Alpaca
          </Button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-3">
          Market orders • 1 share • Alpaca Sandbox Mode • Real Alpaca Data
        </p>
      </div>

      {/* Alpaca Info Banner */}
      <div className="text-center text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
        <p className="font-semibold">📊 Pure Alpaca Trading Dashboard</p>
        <p>Lightweight Charts • 100% Alpaca Markets Data • Real-time Alpaca Feed</p>
        <p className="text-xs mt-1">⚠️ Alpaca Sandbox Environment - No Real Money Involved</p>
      </div>
    </div>
  );
};

export default AlpacaLiveChart;