import { useState, useEffect, useRef, useCallback } from 'react';
import { useStockPrices } from '@/hooks/useStockPrices';
import { useAlpacaStreamSingleton } from '@/hooks/useAlpacaStreamSingleton';
import { supabase } from '@/integrations/supabase/client';
import { CandlestickData, HistogramData, UTCTimestamp } from 'lightweight-charts';

interface UseChartDataProps {
  symbol: string;
  timeframe: string;
  isDemo?: boolean;
}

interface HistoricalData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Overload for SimpleLightweightChart (object params)
export function useChartData(params: UseChartDataProps): {
  candlestickData: CandlestickData[];
  volumeData: HistogramData[];
  currentPrice: number | null;
  priceChange: number;
  priceChangePercent: number;
  isLoading: boolean;
  isConnected: boolean;
  refresh: () => Promise<void>;
};

// Overload for TradingChart (separate params)
export function useChartData(symbol: string, timeframe: string): {
  chartData: {
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
  };
  isLoading: boolean;
};

export function useChartData(
  symbolOrParams: string | UseChartDataProps, 
  timeframe?: string
): any {
  // Determine which interface is being used
  const isObjectParam = typeof symbolOrParams === 'object';
  const symbol = isObjectParam ? symbolOrParams.symbol : symbolOrParams;
  const tf = isObjectParam ? symbolOrParams.timeframe : timeframe || '1h';
  const isDemo = isObjectParam ? symbolOrParams.isDemo || false : false;
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [volumeData, setVolumeData] = useState<HistogramData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const lastPriceRef = useRef<number | null>(null);

  // Fetch current stock price
  const { data: stockPrices } = useStockPrices([symbol]);
  
  // Real-time data stream
  // Disable WebSocket if user is on the live trading page to prevent connection conflicts
  const isOnLiveTradingPage = window.location.pathname.includes('/alpaca-live-chart');
  const { streamData, isConnected } = useAlpacaStreamSingleton({
    symbols: [symbol],
    enabled: !isDemo && !isOnLiveTradingPage
  });

  // Fetch historical data
  const fetchHistoricalData = useCallback(async () => {
    if (isDemo) {
      // Generate realistic demo data
      const generateDemoData = (): { candlestickData: CandlestickData[], volumeData: HistogramData[] } => {
        const candlestickData: CandlestickData[] = [];
        const volumeData: HistogramData[] = [];
        const basePrice = 213.95; // AAPL current price
        const baseVolume = 50000000; // Realistic volume
        
        for (let i = 0; i < 100; i++) {
          const time = (Math.floor(Date.now() / 1000) - (100 - i) * 3600) as UTCTimestamp;
          const priceVariation = (Math.random() - 0.5) * 10;
          const open = basePrice + priceVariation + (i * 0.1);
          const close = open + (Math.random() - 0.5) * 5;
          const high = Math.max(open, close) + Math.random() * 3;
          const low = Math.min(open, close) - Math.random() * 3;
          const volume = baseVolume + (Math.random() - 0.5) * baseVolume * 0.5;
          
          candlestickData.push({
            time,
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2))
          });

          volumeData.push({
            time,
            value: Math.floor(volume),
            color: close > open ? '#10b981' : '#ef4444'
          });
        }
        
        return { candlestickData, volumeData };
      };

      const demoData = generateDemoData();
      setCandlestickData(demoData.candlestickData);
      setVolumeData(demoData.volumeData);
      
      if (demoData.candlestickData.length > 0) {
        const lastCandle = demoData.candlestickData[demoData.candlestickData.length - 1];
        setCurrentPrice(lastCandle.close);
        lastPriceRef.current = lastCandle.close;
        
        if (demoData.candlestickData.length > 1) {
          const prevCandle = demoData.candlestickData[demoData.candlestickData.length - 2];
          const change = lastCandle.close - prevCandle.close;
          const changePercent = (change / prevCandle.close) * 100;
          setPriceChange(change);
          setPriceChangePercent(changePercent);
        }
      }
      
      setIsLoading(false);
      return;
    }

    try {
      console.log(`🚀 [useChartData] Starting historical data fetch for ${symbol} with timeframe ${timeframe}`);
      
      // Call historical prices edge function
      const { data, error } = await supabase.functions.invoke('historical-prices', {
        body: { 
          symbol, 
          timeframe,
          limit: 100 
        },
      });

      if (error) {
        console.error('Error fetching historical data:', error);
        throw error;
      }

      if (data && data.bars && Array.isArray(data.bars)) {
        console.log(`Received ${data.bars.length} historical bars for ${symbol}`);
        
        const processedCandlestickData: CandlestickData[] = data.bars.map((bar: any) => ({
          time: Math.floor(new Date(bar.timestamp || bar.t).getTime() / 1000) as UTCTimestamp,
          open: Number(bar.open || bar.o),
          high: Number(bar.high || bar.h),
          low: Number(bar.low || bar.l),
          close: Number(bar.close || bar.c)
        }));

        const processedVolumeData: HistogramData[] = data.bars.map((bar: any) => ({
          time: Math.floor(new Date(bar.timestamp || bar.t).getTime() / 1000) as UTCTimestamp,
          value: Number(bar.volume || bar.v),
          color: (bar.close || bar.c) > (bar.open || bar.o) ? '#10b981' : '#ef4444'
        }));

        setCandlestickData(processedCandlestickData);
        setVolumeData(processedVolumeData);

        if (processedCandlestickData.length > 0) {
          const lastCandle = processedCandlestickData[processedCandlestickData.length - 1];
          setCurrentPrice(lastCandle.close);
          lastPriceRef.current = lastCandle.close;
          
          if (processedCandlestickData.length > 1) {
            const prevCandle = processedCandlestickData[processedCandlestickData.length - 2];
            const change = lastCandle.close - prevCandle.close;
            const changePercent = (change / prevCandle.close) * 100;
            setPriceChange(change);
            setPriceChangePercent(changePercent);
          }
        }
      } else {
        console.warn('No historical data received for', symbol);
        // Fall back to demo data structure with current price
        if (stockPrices && stockPrices.length > 0) {
          const currentStock = stockPrices.find(s => s.symbol === symbol);
          if (currentStock) {
            const basePrice = currentStock.price;
            const demoData: CandlestickData[] = [];
            const demoVolume: HistogramData[] = [];
            
            for (let i = 0; i < 50; i++) {
              const time = (Math.floor(Date.now() / 1000) - (50 - i) * 3600) as UTCTimestamp;
              const priceVariation = (Math.random() - 0.5) * 5;
              const open = basePrice + priceVariation;
              const close = open + (Math.random() - 0.5) * 2;
              const high = Math.max(open, close) + Math.random() * 1;
              const low = Math.min(open, close) - Math.random() * 1;
              
              demoData.push({
                time,
                open: Number(open.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                close: Number(close.toFixed(2))
              });

              demoVolume.push({
                time,
                value: Math.floor(Math.random() * 1000000) + 500000,
                color: close > open ? '#10b981' : '#ef4444'
              });
            }
            
            setCandlestickData(demoData);
            setVolumeData(demoVolume);
            setCurrentPrice(basePrice);
            lastPriceRef.current = basePrice;
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchHistoricalData:', error);
      // Fall back to basic demo data
      const fallbackData: CandlestickData[] = [{
        time: Math.floor(Date.now() / 1000) as UTCTimestamp,
        open: 200,
        high: 205,
        low: 195,
        close: 202
      }];
      setCandlestickData(fallbackData);
      setCurrentPrice(202);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, tf, isDemo, stockPrices]);

  // Update with real-time data
  useEffect(() => {
    if (!isDemo && streamData && streamData[symbol]) {
      const liveData = streamData[symbol];
      console.log('📊 Updating chart with live data:', liveData);

      if (liveData.price && liveData.price > 0) {
        setCurrentPrice(liveData.price);
        
        // Calculate price change if we have a previous price
        if (lastPriceRef.current !== null) {
          const change = liveData.price - lastPriceRef.current;
          const changePercent = (change / lastPriceRef.current) * 100;
          setPriceChange(change);
          setPriceChangePercent(changePercent);
        }

        // Update the last candlestick with new price data
        setCandlestickData(prev => {
          if (prev.length === 0) return prev;
          
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          const lastCandle = updated[lastIndex];
          
          // Update the last candle with new price
          updated[lastIndex] = {
            ...lastCandle,
            close: liveData.price,
            high: Math.max(lastCandle.high, liveData.price),
            low: Math.min(lastCandle.low, liveData.price)
          };
          
          return updated;
        });

        // Update volume data if available
        if (liveData.volume) {
          setVolumeData(prev => {
            if (prev.length === 0) return prev;
            
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            
            updated[lastIndex] = {
              ...updated[lastIndex],
              value: liveData.volume,
              color: liveData.price > (candlestickData[lastIndex]?.open || liveData.price) ? '#10b981' : '#ef4444'
            };
            
            return updated;
          });
        }
      }
    }
  }, [streamData, symbol, isDemo, candlestickData]);

  // Load historical data on mount and when symbol/timeframe changes
  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  // Update current price from stock prices hook when available
  useEffect(() => {
    if (stockPrices && stockPrices.length > 0) {
      const currentStock = stockPrices.find(s => s.symbol === symbol);
      if (currentStock && currentStock.price > 0) {
        setCurrentPrice(currentStock.price);
        setPriceChange(currentStock.change);
        setPriceChangePercent(currentStock.changePercent);
        
        if (lastPriceRef.current === null) {
          lastPriceRef.current = currentStock.price;
        }
      }
    }
  }, [stockPrices, symbol]);

  return {
    candlestickData,
    volumeData,
    currentPrice,
    priceChange,
    priceChangePercent,
    isLoading,
    isConnected: !isDemo ? isConnected : true,
    refresh: fetchHistoricalData,
    // Legacy interface for TradingChart compatibility
    chartData: {
      symbol,
      data: candlestickData.map((candle, index) => ({
        timestamp: Number(candle.time) * 1000,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: volumeData[index]?.value || 0
      })),
      lastUpdate: Date.now()
    }
  };
};