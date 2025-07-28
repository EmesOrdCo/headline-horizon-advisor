import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlpacaTradingChart } from '@/components/chart/AlpacaTradingChart';
import { useAlpacaHistoricalData } from '@/hooks/useAlpacaHistoricalData';

interface AlpacaBar {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

const AlpacaLiveChart: React.FC<{ symbol?: string }> = ({ symbol = 'AAPL' }) => {
  // Use Alpaca historical data
  const { chartData, isLoading, currentPrice, error, refresh } = useAlpacaHistoricalData(symbol, '1Min');

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
              <CardTitle className="text-2xl text-white">{symbol} Alpaca Trading</CardTitle>
              <Badge variant={error ? "destructive" : "default"} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`} />
                {error ? 'Data Error' : 'Historical Data'}
              </Badge>
              {error && (
                <Badge variant="destructive" className="text-xs">
                  {error}
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-400">
                ${currentPrice > 0 ? currentPrice.toFixed(2) : '--'}
              </div>
              <div className="text-sm text-slate-400">
                Alpaca Historical Price
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
                <Badge className="bg-blue-600 text-white">
                  📊 Alpaca Historical Data
                </Badge>
                <span className="text-xs text-slate-500">
                  ({chartData.data.length} bars loaded)
                </span>
              </div>
              
              {error && (
                <div className="text-sm text-red-400">
                  Error: {error}
                </div>
              )}
            </div>
            
            <Button
              onClick={refresh}
              variant="outline"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              disabled={isLoading}
            >
              🔄 Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TradingView-Style Chart with Alpaca Data */}
      <AlpacaTradingChart 
        symbol={symbol}
        initialTimeFrame="1m"
        className="bg-slate-900/50 border-slate-700"
      />

      {/* Trading Controls */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-center text-white">Alpaca Paper Trading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-6">
            <Button
              onClick={() => placeOrder('buy')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
              disabled={isLoading || !!error}
            >
              🟢 BUY {symbol}
            </Button>
            <Button
              onClick={() => placeOrder('sell')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
              disabled={isLoading || !!error}
            >
              🔴 SELL {symbol}
            </Button>
          </div>
          <p className="text-center text-sm text-slate-400 mt-3">
            Market orders • 1 share • Paper Trading • Alpaca Historical Data
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlpacaLiveChart;