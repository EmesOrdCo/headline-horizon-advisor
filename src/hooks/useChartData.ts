import { useState, useEffect, useRef, useCallback } from 'react';
import { ChartData, OHLCData, TimeFrame } from '@/types/chart';

const generateMockData = (symbol: string, timeFrame: TimeFrame, count: number = 1000): OHLCData[] => {
  const data: OHLCData[] = [];
  let basePrice = 100 + Math.random() * 100;
  const now = Date.now();
  
  const timeFrameMs = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000
  };
  
  const interval = timeFrameMs[timeFrame];
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * interval;
    
    // Generate realistic OHLC data with some volatility
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * volatility * basePrice;
    const open = basePrice;
    
    const high = open + Math.random() * Math.abs(change) * 2;
    const low = open - Math.random() * Math.abs(change) * 2;
    const close = open + change;
    
    // Ensure OHLC relationships are maintained
    const realHigh = Math.max(open, close, high);
    const realLow = Math.min(open, close, low);
    
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    
    data.push({
      timestamp,
      open,
      high: realHigh,
      low: realLow,
      close,
      volume
    });
    
    basePrice = close;
  }
  
  return data;
};

export const useChartData = (symbol: string, timeFrame: TimeFrame) => {
  const [chartData, setChartData] = useState<ChartData>({
    symbol,
    data: [],
    lastUpdate: Date.now()
  });
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData = generateMockData(symbol, timeFrame);
      
      setChartData({
        symbol,
        data: mockData,
        lastUpdate: Date.now()
      });
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeFrame]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // In a real implementation, this would connect to your WebSocket server
      // For demo purposes, we'll simulate real-time updates
      const simulateRealTimeUpdates = () => {
        setInterval(() => {
          setChartData(prevData => {
            if (prevData.data.length === 0) return prevData;
            
            const lastCandle = prevData.data[prevData.data.length - 1];
            const now = Date.now();
            
            // Update the last candle or add a new one
            const timeDiff = now - lastCandle.timestamp;
            const timeFrameMs = {
              '1m': 60 * 1000,
              '5m': 5 * 60 * 1000,
              '15m': 15 * 60 * 1000,
              '1h': 60 * 60 * 1000,
              '4h': 4 * 60 * 60 * 1000,
              '1d': 24 * 60 * 60 * 1000,
              '1w': 7 * 24 * 60 * 60 * 1000
            };
            
            const interval = timeFrameMs[timeFrame];
            
            if (timeDiff >= interval) {
              // Create new candle
              const change = (Math.random() - 0.5) * 0.01 * lastCandle.close;
              const newCandle: OHLCData = {
                timestamp: lastCandle.timestamp + interval,
                open: lastCandle.close,
                high: lastCandle.close + Math.random() * Math.abs(change),
                low: lastCandle.close - Math.random() * Math.abs(change),
                close: lastCandle.close + change,
                volume: Math.floor(Math.random() * 1000000) + 100000
              };
              
              // Ensure OHLC relationships
              newCandle.high = Math.max(newCandle.open, newCandle.close, newCandle.high);
              newCandle.low = Math.min(newCandle.open, newCandle.close, newCandle.low);
              
              return {
                ...prevData,
                data: [...prevData.data, newCandle],
                lastUpdate: now
              };
            } else {
              // Update current candle
              const change = (Math.random() - 0.5) * 0.005 * lastCandle.close;
              const updatedCandle: OHLCData = {
                ...lastCandle,
                close: lastCandle.close + change,
                high: Math.max(lastCandle.high, lastCandle.close + change),
                low: Math.min(lastCandle.low, lastCandle.close + change),
                volume: lastCandle.volume + Math.floor(Math.random() * 10000)
              };
              
              const newData = [...prevData.data];
              newData[newData.length - 1] = updatedCandle;
              
              return {
                ...prevData,
                data: newData,
                lastUpdate: now
              };
            }
          });
        }, 1000); // Update every second
      };
      
      simulateRealTimeUpdates();
      
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      
      // Retry connection after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 5000);
    }
  }, [timeFrame]);

  const addDataPoint = useCallback((newData: OHLCData) => {
    setChartData(prevData => ({
      ...prevData,
      data: [...prevData.data, newData],
      lastUpdate: Date.now()
    }));
  }, []);

  const updateLastDataPoint = useCallback((updatedData: Partial<OHLCData>) => {
    setChartData(prevData => {
      if (prevData.data.length === 0) return prevData;
      
      const newData = [...prevData.data];
      const lastIndex = newData.length - 1;
      newData[lastIndex] = { ...newData[lastIndex], ...updatedData };
      
      return {
        ...prevData,
        data: newData,
        lastUpdate: Date.now()
      };
    });
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  return {
    chartData,
    isLoading,
    addDataPoint,
    updateLastDataPoint,
    refetch: loadInitialData
  };
};