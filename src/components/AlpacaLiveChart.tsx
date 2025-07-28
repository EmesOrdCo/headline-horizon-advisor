import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TradingChart } from '@/components/chart/TradingChart';

const AlpacaLiveChart: React.FC<{ symbol?: string }> = ({ symbol = 'AAPL' }) => {
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
      {/* Use the existing TradingChart component with Alpaca data */}
      <TradingChart 
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
            >
              🟢 BUY {symbol}
            </Button>
            <Button
              onClick={() => placeOrder('sell')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
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