interface HistoricalDataPoint {
  timestamp: number;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
}

class StockDataService {
  private storageKey = 'stock_historical_data';
  private maxDataPoints = 1000; // Keep last 1000 data points per symbol
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Get historical data for a symbol
  getHistoricalData(symbol: string): HistoricalDataPoint[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const allData: Record<string, HistoricalDataPoint[]> = JSON.parse(data);
      const symbolData = allData[symbol] || [];

      // Filter out old data (older than 24 hours)
      const now = Date.now();
      return symbolData.filter(point => (now - point.timestamp) < this.maxAge);
    } catch (error) {
      console.error('Error reading historical data:', error);
      return [];
    }
  }

  // Add new data point
  addDataPoint(dataPoint: HistoricalDataPoint): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      const allData: Record<string, HistoricalDataPoint[]> = data ? JSON.parse(data) : {};
      
      if (!allData[dataPoint.symbol]) {
        allData[dataPoint.symbol] = [];
      }

      // Add new data point
      allData[dataPoint.symbol].push(dataPoint);

      // Keep only the last maxDataPoints and remove old data
      const now = Date.now();
      allData[dataPoint.symbol] = allData[dataPoint.symbol]
        .filter(point => (now - point.timestamp) < this.maxAge)
        .slice(-this.maxDataPoints);

      localStorage.setItem(this.storageKey, JSON.stringify(allData));
    } catch (error) {
      console.error('Error storing historical data:', error);
    }
  }

  // Get data for the last N minutes
  getRecentData(symbol: string, minutes: number): HistoricalDataPoint[] {
    const allData = this.getHistoricalData(symbol);
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    
    return allData.filter(point => point.timestamp >= cutoffTime);
  }

  // Clear all data for a symbol
  clearSymbolData(symbol: string): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return;

      const allData: Record<string, HistoricalDataPoint[]> = JSON.parse(data);
      delete allData[symbol];
      
      localStorage.setItem(this.storageKey, JSON.stringify(allData));
    } catch (error) {
      console.error('Error clearing symbol data:', error);
    }
  }

  // Get data count for a symbol
  getDataCount(symbol: string): number {
    return this.getHistoricalData(symbol).length;
  }
}

export const stockDataService = new StockDataService();
export type { HistoricalDataPoint };
