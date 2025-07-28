import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAlpacaStreamSingleton } from '@/hooks/useAlpacaStreamSingleton';
import { TradingChart } from '@/components/chart/TradingChart';
import { useTheme } from '@/contexts/ThemeContext';

interface AlpacaBar {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

const AlpacaLiveChart: React.FC<{ symbol?: string }> = ({ symbol = 'AAPL' }) => {
  const { isDarkMode } = useTheme();
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [dataSource, setDataSource] = useState<'historical' | 'live' | 'error'>('historical');

  // Use the singleton WebSocket for this page only
  const { streamData, isConnected, errorMessage, connectionStatus, connect } = useAlpacaStreamSingleton({
    symbols: [symbol],
    enabled: true
  });

  // Handle real-time updates from WebSocket
  useEffect(() => {
    if (streamData[symbol]) {
      const trade = streamData[symbol];
      const price = trade.price;
      setCurrentPrice(price);
      setLastUpdate(new Date().toLocaleTimeString());
      setDataSource('live'); // Mark that we're receiving live data
    }
  }, [streamData, symbol]);

  // Track WebSocket connection status
  useEffect(() => {
    if (connectionStatus === 'error') {
      setDataSource('error');
    } else if (connectionStatus === 'connected') {
      setDataSource('live');
    }
  }, [connectionStatus]);

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
              <div className="text-3xl font-bold text-emerald-400">
                ${currentPrice > 0 ? currentPrice.toFixed(2) : '--'}
              </div>
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
        </CardContent>
      </Card>

      {/* TradingView Chart with Controls */}
      <TradingChart 
        symbol={symbol}
        initialTimeFrame="1m"
        className="bg-slate-900/50 border-slate-700"
      />

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
              disabled={!isConnected}
            >
              🟢 BUY {symbol}
            </Button>
            <Button
              onClick={() => placeOrder('sell')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
              disabled={!isConnected}
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
  );
};

export default AlpacaLiveChart;