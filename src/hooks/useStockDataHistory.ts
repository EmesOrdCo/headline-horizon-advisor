import { useState, useEffect, useCallback } from 'react';
import { stockDataService, HistoricalDataPoint } from '@/services/stockDataService';

interface UseStockDataHistoryProps {
  symbol: string;
  currentPrice?: number;
  enabled?: boolean;
}

interface UseStockDataHistoryReturn {
  historicalData: HistoricalDataPoint[];
  recentData: HistoricalDataPoint[];
  addDataPoint: (price: number, ohlc?: Partial<HistoricalDataPoint>) => void;
  getDataForMinutes: (minutes: number) => HistoricalDataPoint[];
  dataCount: number;
  clearData: () => void;
}

export const useStockDataHistory = ({ 
  symbol, 
  currentPrice, 
  enabled = true 
}: UseStockDataHistoryProps): UseStockDataHistoryReturn => {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [dataCount, setDataCount] = useState(0);

  // Load initial data on mount
  useEffect(() => {
    if (!enabled) return;
    
    const data = stockDataService.getHistoricalData(symbol);
    setHistoricalData(data);
    setDataCount(data.length);
    
    console.log(`📊 Loaded ${data.length} historical data points for ${symbol}`);
  }, [symbol, enabled]);

  // Add a new data point
  const addDataPoint = useCallback((
    price: number, 
    ohlc: Partial<HistoricalDataPoint> = {}
  ) => {
    if (!enabled) return;

    const now = Date.now();
    const dataPoint: HistoricalDataPoint = {
      timestamp: now,
      price,
      symbol,
      open: ohlc.open || price,
      high: ohlc.high || price,
      low: ohlc.low || price,
      close: ohlc.close || price,
      volume: ohlc.volume || Math.floor(Math.random() * 10000) + 50000,
    };

    // Store in service
    stockDataService.addDataPoint(dataPoint);
    
    // Update local state
    setHistoricalData(prev => {
      const updated = [...prev, dataPoint];
      console.log(`📈 Added data point for ${symbol}: $${price} (total: ${updated.length})`);
      return updated;
    });
    
    setDataCount(prev => prev + 1);
  }, [symbol, enabled]);

  // Get data for specific time range
  const getDataForMinutes = useCallback((minutes: number) => {
    return stockDataService.getRecentData(symbol, minutes);
  }, [symbol]);

  // Get recent data (last 10 minutes)
  const recentData = getDataForMinutes(10);

  // Clear all data
  const clearData = useCallback(() => {
    stockDataService.clearSymbolData(symbol);
    setHistoricalData([]);
    setDataCount(0);
  }, [symbol]);

  // Auto-generate data points if we have a current price and not enough history
  useEffect(() => {
    if (!enabled || !currentPrice || historicalData.length > 10) return;

    // Generate some initial history if we don't have much data
    const now = Date.now();
    const initialPoints: HistoricalDataPoint[] = [];
    
    // Generate last hour of data at 2-minute intervals
    for (let i = 30; i > 0; i--) {
      const timestamp = now - (i * 2 * 60 * 1000); // 2 minutes apart
      const variation = (Math.random() - 0.5) * 0.5;
      const price = currentPrice + variation;
      
      initialPoints.push({
        timestamp,
        price: Math.round(price * 100) / 100,
        symbol,
        open: Math.round((currentPrice + (Math.random() - 0.5) * 0.2) * 100) / 100,
        high: Math.round((price + Math.random() * 0.2) * 100) / 100,
        low: Math.round((price - Math.random() * 0.2) * 100) / 100,
        close: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 10000) + 50000,
      });
    }

    // Store all initial points
    initialPoints.forEach(point => stockDataService.addDataPoint(point));
    setHistoricalData(stockDataService.getHistoricalData(symbol));
    
    console.log(`🏗️ Generated ${initialPoints.length} initial data points for ${symbol}`);
  }, [enabled, currentPrice, symbol, historicalData.length]);

  return {
    historicalData,
    recentData,
    addDataPoint,
    getDataForMinutes,
    dataCount,
    clearData,
  };
};