import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts';
import { useAlpacaStreamSingleton } from '@/hooks/useAlpacaStreamSingleton';
import { useStockDataHistory } from '@/hooks/useStockDataHistory';

interface PricePoint {
  timestamp: string;
  time: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockLineChartProps {
  currentPrice?: number;
  symbol: string;
  chartType?: 'line' | 'candles';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg">
        <p className="text-white font-medium mb-2">{data.timestamp}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-300">Close:</span>
            <span className="text-white font-medium">${data.close.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-300">Open:</span>
            <span className="text-white">${data.open.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-300">High:</span>
            <span className="text-green-400">${data.high.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-300">Low:</span>
            <span className="text-red-400">${data.low.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-300">Volume:</span>
            <span className="text-white">{data.volume.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CandlestickBar = (props: any) => {
  const { payload, x, y, width, height } = props;
  if (!payload) return null;
  
  const { open, close, high, low, price } = payload;
  const actualOpen = open || price;
  const actualClose = close || price;
  const actualHigh = high || price;
  const actualLow = low || price;
  
  const isGreen = actualClose >= actualOpen;
  const color = isGreen ? '#10B981' : '#EF4444';
  
  // Calculate positions based on price range
  const priceRange = actualHigh - actualLow;
  const pixelsPerDollar = height / priceRange;
  
  // Calculate wick positions
  const wickTop = y;
  const wickBottom = y + height;
  const wickX = x + width / 2;
  
  // Calculate body positions
  const bodyTop = y + (actualHigh - Math.max(actualOpen, actualClose)) * pixelsPerDollar;
  const bodyHeight = Math.abs(actualClose - actualOpen) * pixelsPerDollar;
  const bodyWidth = width * 0.3; // Make body much thinner
  const bodyX = x + (width - bodyWidth) / 2;
  
  return (
    <g>
      {/* High-Low Wick (thin line) */}
      <line
        x1={wickX}
        y1={wickTop}
        x2={wickX}
        y2={wickBottom}
        stroke={color}
        strokeWidth={1}
      />
      {/* Open-Close Body (thick rectangle) */}
      <rect
        x={bodyX}
        y={bodyTop}
        width={bodyWidth}
        height={Math.max(bodyHeight, 2)} // Minimum height of 2px
        fill={isGreen ? color : color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

const StockLineChart: React.FC<StockLineChartProps> = ({ 
  currentPrice: parentPrice = 214.73, 
  symbol = 'AAPL',
  chartType: propChartType = 'line'
}) => {
  const { streamData, isConnected, errorMessage } = useAlpacaStreamSingleton({ 
    symbols: [symbol], 
    enabled: true 
  });

  const { 
    addDataPoint, 
    getDataForMinutes,
    dataCount 
  } = useStockDataHistory({ 
    symbol, 
    currentPrice: parentPrice, 
    enabled: true 
  });

  const [displayData, setDisplayData] = useState<PricePoint[]>([]);
  const [viewportStart, setViewportStart] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'candles'>(propChartType);
  const lastDataPointRef = useRef<number>(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Sync chart type with prop
  useEffect(() => {
    setChartType(propChartType);
  }, [propChartType]);

  // Fixed viewport size - always show exactly this many points
  const VIEWPORT_SIZE = 25;

  // Convert historical data points to chart format
  const convertToChartData = (historicalData: any[]): PricePoint[] => {
    return historicalData.map(point => ({
      timestamp: new Date(point.timestamp).toLocaleDateString() + ' ' + new Date(point.timestamp).toLocaleTimeString(),
      time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: point.price,
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volume,
    }));
  };

  // Load and update display data smoothly
  useEffect(() => {
    const tenMinuteData = getDataForMinutes(10);
    const chartData = convertToChartData(tenMinuteData);
    
    setDisplayData(prevData => {
      // Only update if we have significantly new data to prevent continuous redraws
      if (Math.abs(chartData.length - prevData.length) > 0) {
        console.log(`📊 Updated display data: ${chartData.length} points`);
        
        // Auto-scroll to latest data if auto-scrolling is enabled
        if (isAutoScrolling && chartData.length > VIEWPORT_SIZE) {
          setTimeout(() => {
            setViewportStart(Math.max(0, chartData.length - VIEWPORT_SIZE));
          }, 100);
        }
        
        return chartData;
      }
      return prevData;
    });
  }, [dataCount, getDataForMinutes, isAutoScrolling]);

  // Add new data points from WebSocket ONLY - no demo data
  useEffect(() => {
    const streamPrice = streamData[symbol];
    
    if (streamPrice?.price) {
      const now = Date.now();
      
      // Throttle updates to prevent spam
      if (now - lastDataPointRef.current < 1000) return;
      lastDataPointRef.current = now;
      
      // Use real WebSocket data only
      addDataPoint(streamPrice.price, {
        open: streamPrice.open || streamPrice.price,
        high: streamPrice.high || streamPrice.price,
        low: streamPrice.low || streamPrice.price,
        close: streamPrice.close || streamPrice.price,
        volume: streamPrice.volume || 0,
      });
      console.log(`📡 Real WebSocket data: $${streamPrice.price}`);
    } else if (!isConnected) {
      console.log(`❌ WebSocket not connected - no data updates`);
    }
  }, [streamData, symbol, isConnected, addDataPoint]);

  // Get viewport data for smooth scrolling
  const viewportData = displayData.slice(viewportStart, viewportStart + VIEWPORT_SIZE);
  
  const currentPrice = parentPrice;

  // Scroll controls
  const canScrollLeft = viewportStart > 0;
  const canScrollRight = viewportStart + VIEWPORT_SIZE < displayData.length;

  const scrollLeft = () => {
    setIsAutoScrolling(false);
    setViewportStart(Math.max(0, viewportStart - 5));
  };

  const scrollRight = () => {
    setViewportStart(Math.min(displayData.length - VIEWPORT_SIZE, viewportStart + 5));
    // Re-enable auto-scrolling if we're at the latest data
    if (viewportStart + VIEWPORT_SIZE >= displayData.length - 5) {
      setIsAutoScrolling(true);
    }
  };

  const scrollToLatest = () => {
    setIsAutoScrolling(true);
    setViewportStart(Math.max(0, displayData.length - VIEWPORT_SIZE));
  };

  return (
    <div className="w-full h-full bg-gray-900">
      <div className="flex-1 p-2 w-full min-h-0 h-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart 
              data={viewportData} 
              margin={{ top: 5, right: 15, left: 15, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF" 
                fontSize={10}
                tick={{ fill: '#9CA3AF' }}
                interval={Math.max(0, Math.floor(viewportData.length / 6))}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={10}
                tick={{ fill: '#9CA3AF' }}
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
                animationDuration={0}
              />
            </LineChart>
          ) : (
            <ComposedChart 
              data={viewportData} 
              margin={{ top: 5, right: 15, left: 15, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF" 
                fontSize={10}
                tick={{ fill: '#9CA3AF' }}
                interval={Math.max(0, Math.floor(viewportData.length / 6))}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={10}
                tick={{ fill: '#9CA3AF' }}
                domain={[(dataMin: number) => dataMin - 5, (dataMax: number) => dataMax + 5]}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
              <Bar 
                dataKey="high" 
                shape={<CandlestickBar />}
                isAnimationActive={false}
                animationDuration={0}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockLineChart;