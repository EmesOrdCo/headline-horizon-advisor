import { OHLCData, PriceRange, TimeRange, ViewportState, ChartDimensions } from '@/types/chart';

export const calculatePriceRange = (data: OHLCData[], startIndex: number, endIndex: number): PriceRange => {
  if (!data || data.length === 0) {
    return { min: 0, max: 100, range: 100 };
  }

  const visibleData = data.slice(Math.max(0, startIndex), Math.min(data.length, endIndex + 1));
  
  if (visibleData.length === 0) {
    return { min: 0, max: 100, range: 100 };
  }

  let min = visibleData[0].low;
  let max = visibleData[0].high;

  for (const candle of visibleData) {
    min = Math.min(min, candle.low);
    max = Math.max(max, candle.high);
  }

  const padding = (max - min) * 0.1; // 10% padding
  min -= padding;
  max += padding;

  return {
    min,
    max,
    range: max - min
  };
};

export const calculateTimeRange = (data: OHLCData[], startIndex: number, endIndex: number): TimeRange => {
  if (!data || data.length === 0) {
    const now = Date.now();
    return { start: now - 86400000, end: now }; // 24 hours
  }

  const start = data[Math.max(0, startIndex)]?.timestamp || data[0].timestamp;
  const end = data[Math.min(data.length - 1, endIndex)]?.timestamp || data[data.length - 1].timestamp;

  return { start, end };
};

export const priceToY = (price: number, priceRange: PriceRange, chartHeight: number, marginTop: number): number => {
  const ratio = (priceRange.max - price) / priceRange.range;
  return marginTop + ratio * chartHeight;
};

export const yToPrice = (y: number, priceRange: PriceRange, chartHeight: number, marginTop: number): number => {
  const ratio = (y - marginTop) / chartHeight;
  return priceRange.max - ratio * priceRange.range;
};

export const timestampToX = (timestamp: number, timeRange: TimeRange, chartWidth: number, marginLeft: number): number => {
  const ratio = (timestamp - timeRange.start) / (timeRange.end - timeRange.start);
  return marginLeft + ratio * chartWidth;
};

export const xToTimestamp = (x: number, timeRange: TimeRange, chartWidth: number, marginLeft: number): number => {
  const ratio = (x - marginLeft) / chartWidth;
  return timeRange.start + ratio * (timeRange.end - timeRange.start);
};

export const indexToX = (index: number, candleWidth: number, candleSpacing: number, marginLeft: number): number => {
  return marginLeft + index * (candleWidth + candleSpacing) + candleWidth / 2;
};

export const xToIndex = (x: number, candleWidth: number, candleSpacing: number, marginLeft: number): number => {
  return Math.floor((x - marginLeft) / (candleWidth + candleSpacing));
};

export const calculateVisibleRange = (viewport: ViewportState, chartWidth: number, candleWidth: number, candleSpacing: number): { startIndex: number; endIndex: number } => {
  const candlesPerScreen = Math.ceil(chartWidth / (candleWidth + candleSpacing));
  const centerIndex = viewport.translateX / (candleWidth + candleSpacing);
  
  const startIndex = Math.max(0, Math.floor(centerIndex - candlesPerScreen / 2));
  const endIndex = Math.floor(centerIndex + candlesPerScreen / 2);

  return { startIndex, endIndex };
};

export const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return price.toFixed(2);
  } else if (price >= 1) {
    return price.toFixed(3);
  } else {
    return price.toFixed(6);
  }
};

export const formatTimestamp = (timestamp: number, timeFrame: string): string => {
  const date = new Date(timestamp);
  
  switch (timeFrame) {
    case '1m':
    case '5m':
    case '15m':
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case '1h':
    case '4h':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    case '1d':
    case '1w':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    default:
      return date.toLocaleDateString('en-US');
  }
};

export const calculateSMA = (data: OHLCData[], period: number): number[] => {
  const sma: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      sma.push(sum / period);
    }
  }
  
  return sma;
};

export const calculateRSI = (data: OHLCData[], period: number): number[] => {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(NaN);
    } else {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
  }
  
  return rsi;
};

export const calculateBollingerBands = (data: OHLCData[], period: number, multiplier: number): { upper: number[]; middle: number[]; lower: number[] } => {
  const sma = calculateSMA(data, period);
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      middle.push(NaN);
      lower.push(NaN);
    } else {
      const avg = sma[i];
      let variance = 0;
      
      for (let j = 0; j < period; j++) {
        variance += Math.pow(data[i - j].close - avg, 2);
      }
      
      const stdDev = Math.sqrt(variance / period);
      
      upper.push(avg + multiplier * stdDev);
      middle.push(avg);
      lower.push(avg - multiplier * stdDev);
    }
  }
  
  return { upper, middle, lower };
};

export const generateTimeLabels = (timeRange: TimeRange, chartWidth: number): { timestamp: number; label: string; x: number }[] => {
  const labels: { timestamp: number; label: string; x: number }[] = [];
  const duration = timeRange.end - timeRange.start;
  const targetLabelCount = Math.floor(chartWidth / 100); // One label per 100px
  const interval = duration / targetLabelCount;
  
  for (let i = 0; i <= targetLabelCount; i++) {
    const timestamp = timeRange.start + i * interval;
    const x = (i / targetLabelCount) * chartWidth;
    const label = new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      ...(duration < 86400000 ? { hour: '2-digit', minute: '2-digit' } : {})
    });
    
    labels.push({ timestamp, label, x });
  }
  
  return labels;
};

export const generatePriceLabels = (priceRange: PriceRange, chartHeight: number): { price: number; label: string; y: number }[] => {
  const labels: { price: number; label: string; y: number }[] = [];
  const targetLabelCount = Math.floor(chartHeight / 50); // One label per 50px
  const interval = priceRange.range / targetLabelCount;
  
  for (let i = 0; i <= targetLabelCount; i++) {
    const price = priceRange.min + i * interval;
    const y = chartHeight - (i / targetLabelCount) * chartHeight;
    const label = formatPrice(price);
    
    labels.push({ price, label, y });
  }
  
  return labels;
};