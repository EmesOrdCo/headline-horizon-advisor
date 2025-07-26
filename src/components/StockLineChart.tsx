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
  currentPrice: parentPrice = 0, 
  symbol = 'AAPL',
  chartType = 'line'
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
  const [activeChartType, setActiveChartType] = useState<'line' | 'candles'>(chartType);
  const lastDataPointRef = useRef<number>(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Zoom functionality state
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = default, >1 = zoomed in, <1 = zoomed out
  const [isHovering, setIsHovering] = useState(false);
  
  // Zoom configuration
  const MIN_ZOOM = 0.1; // Max zoom out (10x more data visible)
  const MAX_ZOOM = 10;  // Max zoom in (10x less data visible)
  const ZOOM_SENSITIVITY = 0.15; // 15% change per scroll
  const BASE_VIEWPORT_SIZE = 25; // Base number of data points to show

  // Sync chart type with prop
  useEffect(() => {
    setActiveChartType(chartType);
  }, [chartType]);

  // Calculate dynamic viewport size based on zoom level
  const getViewportSize = () => {
    // Inverse relationship: higher zoom = smaller viewport (more detailed view)
    return Math.max(5, Math.floor(BASE_VIEWPORT_SIZE / zoomLevel));
  };

  // Zoom indicator text
  const getZoomIndicator = () => {
    const timeRange = getViewportSize();
    if (timeRange <= 5) return "Viewing: 1-2m range";
    if (timeRange <= 15) return "Viewing: 5m range";
    if (timeRange <= 30) return "Viewing: 15m range";
    if (timeRange <= 60) return "Viewing: 30m range";
    if (timeRange <= 120) return "Viewing: 1h range";
    if (timeRange <= 250) return "Viewing: 3h range";
    return "Viewing: 6h+ range";
  };

  // Handle wheel event for zooming
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isHovering || !chartContainerRef.current) return;
      
      e.preventDefault(); // Prevent page scrolling
      e.stopPropagation();
      
      const delta = e.deltaY;
      const zoomDirection = delta > 0 ? 1 : -1; // Scroll down = zoom in, scroll up = zoom out
      
      setZoomLevel(prevZoom => {
        const newZoom = prevZoom * (1 + (zoomDirection * ZOOM_SENSITIVITY));
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
        
        // Calculate new viewport start to maintain center position
        const currentViewportSize = getViewportSize();
        const newViewportSize = Math.max(5, Math.floor(BASE_VIEWPORT_SIZE / clampedZoom));
        const centerPoint = viewportStart + currentViewportSize / 2;
        const newViewportStart = Math.max(0, centerPoint - newViewportSize / 2);
        
        // Update viewport start with the new centered position
        setViewportStart(Math.floor(newViewportStart));
        
        // Disable auto-scrolling when manually zooming
        setIsAutoScrolling(false);
        
        console.log(`🔍 Zoom: ${clampedZoom.toFixed(2)}x, Viewport: ${newViewportSize} points`);
        
        return clampedZoom;
      });
    };

    const chartElement = chartContainerRef.current;
    if (chartElement) {
      chartElement.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        chartElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, [isHovering, viewportStart, getViewportSize]);

  // Mouse enter/leave handlers for hover detection
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

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
        const currentViewportSize = getViewportSize();
        if (isAutoScrolling && chartData.length > currentViewportSize) {
          setTimeout(() => {
            setViewportStart(Math.max(0, chartData.length - currentViewportSize));
          }, 100);
        }
        
        return chartData;
      }
      return prevData;
    });
  }, [dataCount, getDataForMinutes, isAutoScrolling, zoomLevel]);

  // Add new data points from WebSocket and real price data
  useEffect(() => {
    const streamPrice = streamData[symbol];
    const effectivePrice = streamPrice?.price || parentPrice;
    
    if (effectivePrice > 0) {
      const now = Date.now();
      
      // Throttle updates to prevent spam (update every 2-3 seconds)
      if (now - lastDataPointRef.current < 2000) return;
      
      lastDataPointRef.current = now;
      
      console.log(`📈 Adding real price data for ${symbol}: $${effectivePrice}`);
      
      // Add the real price point with OHLC data if available
      addDataPoint(effectivePrice, {
        open: streamPrice?.open || effectivePrice,
        high: streamPrice?.high || effectivePrice,
        low: streamPrice?.low || effectivePrice,
        close: streamPrice?.close || effectivePrice,
        volume: streamPrice?.volume || Math.floor(Math.random() * 10000) + 50000,
      });
    }
  }, [streamData, symbol, addDataPoint, parentPrice]);

  // Get viewport data for smooth scrolling with dynamic viewport size
  const currentViewportSize = getViewportSize();
  const viewportData = displayData.slice(viewportStart, viewportStart + currentViewportSize);
  
  const currentPrice = parentPrice;

  // Scroll controls (updated for dynamic viewport)
  const canScrollLeft = viewportStart > 0;
  const canScrollRight = viewportStart + currentViewportSize < displayData.length;

  const scrollLeft = () => {
    setIsAutoScrolling(false);
    setViewportStart(Math.max(0, viewportStart - 5));
  };

  const scrollRight = () => {
    setViewportStart(Math.min(displayData.length - currentViewportSize, viewportStart + 5));
    // Re-enable auto-scrolling if we're at the latest data
    if (viewportStart + currentViewportSize >= displayData.length - 5) {
      setIsAutoScrolling(true);
    }
  };

  const scrollToLatest = () => {
    setIsAutoScrolling(true);
    setViewportStart(Math.max(0, displayData.length - currentViewportSize));
  };

  return (
    <div className="w-full h-full bg-gray-900 relative">
      {/* Zoom Indicator */}
      <div className="absolute top-2 right-2 z-10 bg-gray-800/80 px-2 py-1 rounded text-xs text-gray-300 pointer-events-none">
        {getZoomIndicator()} • Zoom: {zoomLevel.toFixed(1)}x
      </div>
      
      <div 
        ref={chartContainerRef}
        className="flex-1 p-2 w-full min-h-0 h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isHovering ? 'grab' : 'default' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {activeChartType === 'line' ? (
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