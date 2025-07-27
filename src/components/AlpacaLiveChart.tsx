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

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart with TradingView default styling
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
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

    // Add candlestick series using the correct API
    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

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
      window.removeEventListener('resize', handleResize);
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
      setIsLoading(true);
      
      // Get API keys from Supabase secrets
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to access trading features');
        return;
      }

      // Call our edge function to get historical data
      const { data, error } = await supabase.functions.invoke('alpaca-historical-data', {
        body: { 
          symbol,
          timeframe: '1Min',
          limit: 100
        }
      });

      if (error) throw error;

      if (data?.bars) {
        const chartData: CandlestickData[] = data.bars.map((bar: AlpacaBar) => ({
          time: Math.floor(new Date(bar.t).getTime() / 1000) as any,
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
        }));

        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(chartData);
          if (chartData.length > 0) {
            setCurrentPrice(chartData[chartData.length - 1].close);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast.error('Failed to fetch historical data');
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to Alpaca WebSocket
  const connectWebSocket = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get the WebSocket URL for our edge function
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      
      // For production Supabase projects, use the correct format
      const projectId = 'gjtswpgjrznbrnmvmpno'; // Your Supabase project ID
      const wsUrl = `${protocol}//${projectId}.supabase.co/functions/v1/alpaca-websocket`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        toast.success('Connected to live data feed');
        // Subscribe to trades for the symbol
        ws.send(JSON.stringify({ action: 'subscribe', symbol }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'trade' && data.symbol === symbol) {
            const trade: AlpacaTrade = data.data;
            const price = trade.p;
            const timestamp = Math.floor(new Date(trade.t).getTime() / 1000);

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
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        toast.info('Disconnected from live data feed');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        toast.error('Connection error');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
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

  // Load data on component mount
  useEffect(() => {
    fetchHistoricalData();
    connectWebSocket();
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

      {/* TradingView Chart Container */}
      <div className="border border-gray-200 rounded-lg relative">
        <div ref={chartContainerRef} className="w-full h-96" />
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