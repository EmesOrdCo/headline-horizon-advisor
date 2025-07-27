import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
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
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize chart - TradingView Lightweight Charts
  useEffect(() => {
    console.log('Chart initialization started');
    
    if (!chartContainerRef.current) {
      console.error('Chart container not found');
      return;
    }

    try {
      console.log('Creating TradingView Lightweight Chart...');
      
      // Create chart using TradingView createChart method
      const chart = createChart(chartContainerRef.current, {
        width: 800,
        height: 400,
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

      console.log('Chart initialized');

      // Add candlestick series using proper TradingView method with type casting
      const candleSeries = (chart as any).addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      
      console.log('Candlestick series created');

      candlestickSeriesRef.current = candleSeries;
      chartRef.current = chart;
      
      console.log('Chart and series refs set');

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        console.log('Cleaning up chart...');
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
        if (wsRef.current) {
          wsRef.current.close();
        }
      };

    } catch (error) {
      console.error('Chart initialization failed:', error);
      setIsLoading(false);
      toast.error('Chart initialization failed');
    }
  }, []);

  // Fetch historical data from Alpaca
  const fetchHistoricalData = async () => {
    try {
      console.log('📊 Starting historical data fetch for', symbol);
      setIsLoading(true);
      
      // Get API keys from Supabase secrets
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No session found');
        toast.error('Please log in to access trading features');
        return;
      }

      console.log('✅ Session found, calling edge function...');

      // Call our edge function to get historical data with increased limit
      const { data, error } = await supabase.functions.invoke('alpaca-historical-data', {
        body: { 
          symbol,
          timeframe: '1Min',
          limit: 1000  // Increased to 1000 as requested
        }
      });

      console.log('📊 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }

      if (data?.bars && Array.isArray(data.bars)) {
        console.log('Historical data loaded:', data.bars.length, 'bars');
        
        const formatted: CandlestickData[] = data.bars.map((bar: AlpacaBar) => ({
          time: Math.floor(new Date(bar.t).getTime() / 1000) as any,
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
        }));

        console.log('Historical data loaded:', formatted);

        if (candlestickSeriesRef.current && formatted.length > 0) {
          console.log('Setting chart data with', formatted.length, 'bars');
          candlestickSeriesRef.current.setData(formatted);
          
          const latestPrice = formatted[formatted.length - 1].close;
          setCurrentPrice(latestPrice);
          console.log('Current price set to:', latestPrice);
        } else {
          console.warn('No series or no data to set - Series:', !!candlestickSeriesRef.current, 'Data length:', formatted.length);
        }
      } else {
        console.error('❌ Invalid data format received:', data);
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('❌ Error fetching historical data:', error);
      toast.error('Failed to fetch historical data: ' + (error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to Alpaca WebSocket via our edge function
  const connectWebSocket = async () => {
    try {
      console.log('Starting WebSocket connection...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session for WebSocket');
        return;
      }

      // Use our Supabase edge function WebSocket endpoint
      const wsUrl = `wss://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/alpaca-websocket`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast.success('Connected to live data feed');
        
        // Subscribe to trades for the symbol after connection
        console.log('Subscribing to symbol:', symbol);
        const subscribeMessage = { 
          action: 'subscribe', 
          symbol: symbol 
        };
        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        try {
          console.log('WebSocket message received:', event.data);
          const data = JSON.parse(event.data);
          
          // Handle different message types from Alpaca
          if (Array.isArray(data)) {
            // Handle array of trade messages
            data.forEach(msg => {
              if (msg.T === 't' && msg.S === symbol) {
                const trade = msg;
                const price = trade.p;
                const timestamp = Math.floor(new Date(trade.t).getTime() / 1000);

                console.log('Trade update:', { symbol, price, timestamp });

                // Update chart with new trade price
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
              }
            });
          } else if (data.type === 'trade' && data.symbol === symbol) {
            // Handle single trade message
            const price = data.data.p;
            const timestamp = Math.floor(new Date(data.data.t).getTime() / 1000);

            console.log('Trade update:', { symbol, price, timestamp });

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
          } else {
            console.log('Other WebSocket data:', data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        toast.info('Disconnected from live data feed');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        toast.error('WebSocket connection error');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      toast.error('Failed to connect to live data');
    }
  };

  // Place buy/sell order
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

      toast.success(`${side.toUpperCase()} order placed successfully for ${symbol}`);
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(`Failed to place ${side} order: ${error.message}`);
    }
  };

  // Load data on component mount and cleanup on unmount
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
      console.log('Component unmounting - cleaning up WebSocket');
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setIsConnected(false);
      }
    };
  }, [symbol]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">{symbol} Live Chart</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Current Price</div>
        </div>
      </div>

      {/* TradingView Chart Container with Fixed Dimensions */}
      <div className="border border-gray-200 rounded-lg relative">
        <div 
          ref={chartContainerRef} 
          className="w-full h-96"
          style={{ width: '800px', height: '400px', minWidth: '100%' }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-lg">Loading chart data...</div>
          </div>
        )}
      </div>

      {/* Trading Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={() => placeOrder('buy')}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
          disabled={!isConnected}
        >
          Buy {symbol}
        </Button>
        <Button
          onClick={() => placeOrder('sell')}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-2"
          disabled={!isConnected}
        >
          Sell {symbol}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-600">
        <p>Live trading with Alpaca Markets (Sandbox Mode)</p>
        <p>Chart powered by TradingView Lightweight Charts</p>
      </div>
    </div>
  );
};

export default AlpacaLiveChart;