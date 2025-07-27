import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AlpacaTrade {
  T: string; // message type
  S: string; // symbol
  p: number; // price
  s: number; // size
  t: string; // timestamp
}

interface TradingViewWidgetProps {
  symbol: string;
  onPriceUpdate?: (price: number) => void;
}

// TradingView Widget Component
const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, onPriceUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing widget
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create TradingView script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).TradingView && containerRef.current) {
        widgetRef.current = new (window as any).TradingView.widget({
          container_id: containerRef.current.id,
          width: '100%',
          height: 500,
          symbol: `NASDAQ:${symbol}`,
          interval: '1',
          timezone: 'Etc/UTC',
          theme: 'light',
          style: '1',
          locale: 'en',
          enable_publishing: false,
          allow_symbol_change: true,
          details: true,
          hotlist: true,
          calendar: true,
          studies: [
            'RSI@tv-basicstudies',
            'MASimple@tv-basicstudies'
          ],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
          no_referral_id: false,
          onChartReady: () => {
            console.log('TradingView chart is ready');
          }
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol]);

  // Generate unique ID for each widget instance
  const widgetId = `tradingview-widget-${symbol}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div 
      id={widgetId}
      ref={containerRef}
      className="w-full h-[500px] border border-gray-200 rounded-lg"
    />
  );
};

const AlpacaLiveChart: React.FC<{ symbol?: string }> = ({ symbol = 'AAPL' }) => {
  const wsRef = useRef<WebSocket | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Fetch current price from Alpaca
  const fetchCurrentPrice = async () => {
    try {
      console.log('📊 Fetching current price for', symbol);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No session found');
        toast.error('Please log in to access trading features');
        return;
      }

      const { data, error } = await supabase.functions.invoke('stock-price', {
        body: { symbols: [symbol] }
      });

      if (error) {
        console.error('❌ Error fetching price:', error);
        throw error;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const stockData = data[0];
        setCurrentPrice(stockData.price || 0);
        console.log('Current price set to:', stockData.price);
      }
    } catch (error) {
      console.error('❌ Error fetching current price:', error);
      toast.error('Failed to fetch current price: ' + (error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to Alpaca WebSocket for real-time price updates
  const connectWebSocket = async () => {
    try {
      console.log('Starting WebSocket connection...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session for WebSocket');
        return;
      }

      // Use our Supabase edge function WebSocket endpoint
      const wsUrl = `wss://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/alpaca-stream`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast.success('Connected to live data feed');
        
        // Subscribe to trades for the symbol after connection
        console.log('Subscribing to symbol:', symbol);
        const subscribeMessage = { 
          type: 'subscribe',
          symbols: [symbol]
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
                console.log('Trade update:', { symbol, price });
                setCurrentPrice(price);
                setLastUpdate(new Date().toLocaleTimeString());
              }
            });
          } else if (data.type === 'trade' && data.symbol === symbol) {
            // Handle single trade message
            const price = data.data.p;
            console.log('Trade update:', { symbol, price });
            setCurrentPrice(price);
            setLastUpdate(new Date().toLocaleTimeString());
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
    
    fetchCurrentPrice();
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
    <div className="w-full space-y-6">
      {/* Header with Price and Status */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-bold text-gray-800">{symbol} Live Trading</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Live Feed Active' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">${currentPrice.toFixed(2)}</div>
          <div className="text-sm text-gray-600">
            {lastUpdate ? `Last Update: ${lastUpdate}` : 'Current Price'}
          </div>
        </div>
      </div>

      {/* TradingView Chart */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center h-[500px] bg-gray-50">
            <div className="text-lg text-gray-600">Loading TradingView chart...</div>
          </div>
        )}
        <TradingViewWidget 
          symbol={symbol} 
          onPriceUpdate={setCurrentPrice}
        />
      </div>

      {/* Trading Controls */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-center">Quick Trading</h3>
        <div className="flex justify-center space-x-6">
          <Button
            onClick={() => placeOrder('buy')}
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-3 text-lg"
            disabled={!isConnected || isLoading}
          >
            🟢 BUY {symbol}
          </Button>
          <Button
            onClick={() => placeOrder('sell')}
            className="bg-red-600 hover:bg-red-700 text-white px-12 py-3 text-lg"
            disabled={!isConnected || isLoading}
          >
            🔴 SELL {symbol}
          </Button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-3">
          Market orders • 1 share • Alpaca Sandbox Mode
        </p>
      </div>

      {/* Info Banner */}
      <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p className="font-semibold">📊 Live Trading Dashboard</p>
        <p>TradingView Professional Charts • Alpaca Markets Integration • Real-time Data Feed</p>
        <p className="text-xs mt-1">⚠️ Sandbox Environment - No Real Money Involved</p>
      </div>
    </div>
  );
};

export default AlpacaLiveChart;