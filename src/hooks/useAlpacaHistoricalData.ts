import { useState, useEffect, useCallback } from 'react';
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

interface AlpacaChartData {
  symbol: string;
  data: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  lastUpdate: number;
}

export const useAlpacaHistoricalData = (symbol: string, timeFrame: string = '1Min') => {
  const [chartData, setChartData] = useState<AlpacaChartData>({
    symbol,
    data: [],
    lastUpdate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalData = useCallback(async () => {
    try {
      console.log(`📊 Fetching Alpaca historical data for ${symbol} with timeframe ${timeFrame}`);
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to access trading features');
      }

      // Call our edge function to get Alpaca historical data
      const { data, error } = await supabase.functions.invoke('alpaca-historical-data', {
        body: { 
          symbol,
          timeframe: timeFrame,
          limit: 1000
        }
      });

      if (error) {
        console.error('❌ Alpaca edge function error:', error);
        throw error;
      }

      if (data?.bars && Array.isArray(data.bars)) {
        console.log(`✅ Alpaca historical data loaded: ${data.bars.length} bars`);
        
        const formattedData = data.bars.map((bar: AlpacaBar) => ({
          timestamp: new Date(bar.t).getTime(),
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
          volume: bar.v,
        }));

        const newChartData: AlpacaChartData = {
          symbol,
          data: formattedData,
          lastUpdate: Date.now()
        };

        setChartData(newChartData);
        
        if (formattedData.length > 0) {
          const latestPrice = formattedData[formattedData.length - 1].close;
          setCurrentPrice(latestPrice);
        }
      } else {
        throw new Error('Invalid Alpaca data format received');
      }
    } catch (error: any) {
      console.error('❌ Error fetching Alpaca historical data:', error);
      setError(error.message || 'Failed to fetch Alpaca data');
      toast.error(`Failed to fetch Alpaca data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeFrame]);

  // Load data on component mount and when symbol/timeframe changes
  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  return {
    chartData,
    isLoading,
    currentPrice,
    error,
    refresh: fetchHistoricalData
  };
};