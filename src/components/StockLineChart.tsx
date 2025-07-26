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
  timeframe?: string;
  historicalData?: any;
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
  
  // Determine if bullish (green) or bearish (red)
  const isBullish = actualClose >= actualOpen;
  const color = isBullish ? '#10B981' : '#EF4444'; // Green for bullish, red for bearish
  
  // Calculate the scale factor for price to pixels
  const priceRange = actualHigh - actualLow;
  if (priceRange === 0) return null; // Avoid division by zero
  
  const pixelsPerPrice = height / priceRange;
  
  // Calculate positions
  const centerX = x + width / 2;
  const bodyWidth = Math.max(2, width * 0.7); // 70% of available width, minimum 2px
  const bodyLeft = centerX - bodyWidth / 2;
  
  // Calculate Y positions (remember Y increases downward)
  const highY = y;
  const lowY = y + height;
  
  const openY = y + ((actualHigh - actualOpen) * pixelsPerPrice);
  const closeY = y + ((actualHigh - actualClose) * pixelsPerPrice);
  
  // Body coordinates
  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.max(1, bodyBottom - bodyTop); // Minimum 1px height
  
  return (
    <g>
      {/* High-Low Wick (thin vertical line) */}
      <line
        x1={centerX}
        y1={highY}
        x2={centerX}
        y2={lowY}
        stroke={color}
        strokeWidth={1}
        opacity={0.8}
      />
      
      {/* Open-Close Body (rectangle) */}
      <rect
        x={bodyLeft}
        y={bodyTop}
        width={bodyWidth}
        height={bodyHeight}
        fill={isBullish ? color : color}
        stroke={color}
        strokeWidth={1}
        opacity={isBullish ? 0.8 : 1}
      />
      
      {/* For hollow/filled appearance */}
      {isBullish && (
        <rect
          x={bodyLeft + 1}
          y={bodyTop + 1}
          width={Math.max(0, bodyWidth - 2)}
          height={Math.max(0, bodyHeight - 2)}
          fill="rgba(255, 255, 255, 0.3)"
        />
      )}
    </g>
  );
};

const StockLineChart: React.FC<StockLineChartProps> = ({ 
  currentPrice: parentPrice = 0, 
  symbol = 'AAPL',
  chartType = 'line',
  timeframe = '1D',
  historicalData
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
    enabled: !historicalData // Only use local history if no external historical data
  });

  const [displayData, setDisplayData] = useState<PricePoint[]>([]);
  const [viewportStart, setViewportStart] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [activeChartType, setActiveChartType] = useState<'line' | 'candles'>(chartType);
  const lastDataPointRef = useRef<number>(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Zoom functionality state with timeframe-aware navigation
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  
  // Timeframe-aware zoom configuration
  const getTimeframeZoomConfig = () => {
    const timeframeIndex = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'].indexOf(timeframe);
    return {
      MIN_ZOOM: 0.2,
      MAX_ZOOM: 8,
      ZOOM_SENSITIVITY: 0.12,
      BASE_VIEWPORT_SIZE: getBaseViewportForTimeframe(timeframe),
      CAN_ZOOM_DOWN: timeframeIndex > 0,
      CAN_ZOOM_UP: timeframeIndex < 8,
      NEXT_TIMEFRAME_DOWN: timeframeIndex > 0 ? ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'][timeframeIndex - 1] : null,
      NEXT_TIMEFRAME_UP: timeframeIndex < 8 ? ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'][timeframeIndex + 1] : null
    };
  };

  
  // Dynamic timeframe configuration - TARGET_CANDLES = 60 rule
  const TARGET_CANDLES = 60;
  
  // Get base viewport size based on timeframe specifications (always ~60 candles)
  const getBaseViewportForTimeframe = (tf: string) => {
    // Always target 60 candles for consistent viewing experience
    return TARGET_CANDLES;
  };
  
  // Get time window in minutes for each timeframe
  const getTimeWindowMinutes = (tf: string) => {
    switch (tf) {
      case '1m': return 60;      // 60 * 1m = 1 hour
      case '5m': return 180;     // 36 * 5m = 3 hours
      case '15m': return 360;    // 24 * 15m = 6 hours
      case '30m': return 720;    // 24 * 30m = 12 hours
      case '1H': return 2880;    // 48 * 1H = 2 days (48 hours)
      case '4H': return 7200;    // 30 * 4H = 5 days (120 hours)
      case '1D': return 43200;   // 30 * 1D = 30 days (720 hours)
      case '1W': return 129600;  // 12 * 1W = 12 weeks (84 days)
      case '1M': return 525600;  // 12 * 1M = 12 months (365 days)
      default: return 1440; // 1 day default
    }
  };

  // Calculate dynamic viewport size based on zoom level (max ~70 candles)
  const getViewportSize = () => {
    const config = getTimeframeZoomConfig();
    const baseSize = config.BASE_VIEWPORT_SIZE;
    const zoomedSize = Math.floor(baseSize / zoomLevel);
    // Never display more than 70 candles unless heavily zoomed in
    return Math.max(5, Math.min(70, zoomedSize));
  };

  // Sync chart type with prop
  useEffect(() => {
    setActiveChartType(chartType);
  }, [chartType]);

  // Enhanced zoom indicator with timeframe-specific ranges
  const getZoomIndicator = () => {
    const timeRange = getViewportSize();
    const config = getTimeframeZoomConfig();
    
    // Calculate actual time range being viewed
    switch (timeframe) {
      case '1m':
        const minutes = timeRange;
        if (minutes <= 5) return "Viewing: 5m range";
        if (minutes <= 15) return "Viewing: 15m range";
        if (minutes <= 30) return "Viewing: 30m range";
        if (minutes <= 60) return "Viewing: 1h range";
        return `Viewing: ${Math.round(minutes/60)}h range`;
      case '5m':
        const mins5 = timeRange * 5;
        if (mins5 <= 30) return "Viewing: 30m range";
        if (mins5 <= 60) return "Viewing: 1h range";
        if (mins5 <= 180) return "Viewing: 3h range";
        return `Viewing: ${Math.round(mins5/60)}h range`;
      case '15m':
        const mins15 = timeRange * 15;
        if (mins15 <= 60) return "Viewing: 1h range";
        if (mins15 <= 180) return "Viewing: 3h range";
        if (mins15 <= 360) return "Viewing: 6h range";
        return `Viewing: ${Math.round(mins15/60)}h range`;
      case '30m':
        const mins30 = timeRange * 30;
        if (mins30 <= 180) return "Viewing: 3h range";
        if (mins30 <= 360) return "Viewing: 6h range";
        if (mins30 <= 720) return "Viewing: 12h range";
        return `Viewing: ${Math.round(mins30/60)}h range`;
      case '1H':
        const hours = timeRange;
        if (hours <= 6) return "Viewing: 6h range";
        if (hours <= 24) return "Viewing: 1d range";
        if (hours <= 48) return "Viewing: 2d range";
        return `Viewing: ${Math.round(hours/24)}d range`;
      case '4H':
        const hours4 = timeRange * 4;
        if (hours4 <= 24) return "Viewing: 1d range";
        if (hours4 <= 120) return "Viewing: 5d range";
        return `Viewing: ${Math.round(hours4/24)}d range`;
      case '1D':
        const days = timeRange;
        if (days <= 7) return "Viewing: 1w range";
        if (days <= 30) return "Viewing: 1m range";
        return `Viewing: ${Math.round(days/30)}m range`;
      case '1W':
        const weeks = timeRange;
        if (weeks <= 4) return "Viewing: 1m range";
        if (weeks <= 12) return "Viewing: 3m range";
        return `Viewing: ${Math.round(weeks/4)}m range`;
      case '1M':
        const months = timeRange;
        if (months <= 6) return "Viewing: 6m range";
        if (months <= 12) return "Viewing: 1y range";
        return `Viewing: ${months}m range`;
      default:
        return `Viewing: ${timeRange} ${timeframe} periods`;
    }
  };

  // Enhanced wheel handler with timeframe switching capability
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isHovering || !chartContainerRef.current) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const config = getTimeframeZoomConfig();
      const delta = e.deltaY;
      const isZoomIn = delta > 0; // Scroll down = zoom in
      
      // Check if we should switch timeframes instead of just zooming
      if (isZoomIn && zoomLevel >= config.MAX_ZOOM * 0.8 && config.CAN_ZOOM_DOWN) {
        // Switch to lower timeframe (more detailed)
        console.log(`🔄 Switching to ${config.NEXT_TIMEFRAME_DOWN} for more detail`);
        // Note: This would need to be handled by parent component
        // For now, just continue with current zoom
      } else if (!isZoomIn && zoomLevel <= config.MIN_ZOOM * 1.2 && config.CAN_ZOOM_UP) {
        // Switch to higher timeframe (less detailed) 
        console.log(`🔄 Switching to ${config.NEXT_TIMEFRAME_UP} for broader view`);
        // Note: This would need to be handled by parent component
        // For now, just continue with current zoom
      }
      
      const zoomDirection = isZoomIn ? 1 : -1;
      
      setZoomLevel(prevZoom => {
        const newZoom = prevZoom * (1 + (zoomDirection * config.ZOOM_SENSITIVITY));
        const clampedZoom = Math.max(config.MIN_ZOOM, Math.min(config.MAX_ZOOM, newZoom));
        
        // Calculate new viewport start to maintain center position
        const currentViewportSize = getViewportSize();
        const newViewportSize = Math.max(5, Math.floor(config.BASE_VIEWPORT_SIZE / clampedZoom));
        const centerPoint = viewportStart + currentViewportSize / 2;
        const newViewportStart = Math.max(0, centerPoint - newViewportSize / 2);
        
        setViewportStart(Math.floor(newViewportStart));
        setIsAutoScrolling(false);
        
        console.log(`🔍 Zoom: ${clampedZoom.toFixed(2)}x, Viewport: ${newViewportSize} ${timeframe} periods`);
        
        return clampedZoom;
      });
    };

    const chartElement = chartContainerRef.current;
    if (chartElement) {
      chartElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => chartElement.removeEventListener('wheel', handleWheel);
    }
  }, [isHovering, viewportStart, getViewportSize, timeframe, zoomLevel]);

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
    let chartData: PricePoint[] = [];
    
    // Prioritize historical data from API if available
    if (historicalData?.data && historicalData.data.length > 0) {
      chartData = historicalData.data.map((point: any) => {
        const date = new Date(point.timestamp || point.date);
        
        // Dynamic time labeling based on timeframe specifications
        let timeLabel = '';
        let timestampLabel = '';
        
        switch (timeframe) {
          case '1m':
          case '5m': 
            // HH:mm format for <= 5 minutes
            timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timestampLabel = date.toLocaleDateString() + ' ' + timeLabel;
            break;
          case '15m':
          case '30m':
            // HH:mm format for <= 30 minutes
            timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timestampLabel = date.toLocaleDateString() + ' ' + timeLabel;
            break;
          case '1H':
            // D MMM, HH:mm format for <= 1 hour
            const dayMonth = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
            const hourMin = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timeLabel = `${dayMonth}, ${hourMin}`;
            timestampLabel = date.toLocaleDateString() + ' ' + hourMin;
            break;
          case '4H':
          case '1D':
            // D MMM format for <= 4 hours or 1 day
            timeLabel = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
            timestampLabel = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            break;
          case '1W':
          case '1M':
            // MMM YYYY format for weekly/monthly
            timeLabel = date.toLocaleDateString([], { month: 'short', year: 'numeric' });
            timestampLabel = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            break;
          default:
            timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            timestampLabel = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
        
        return {
          timestamp: timestampLabel,
          time: timeLabel,
          price: point.close || point.price,
          open: point.open,
          high: point.high,
          low: point.low,
          close: point.close || point.price,
          volume: point.volume || 0,
        };
      });
      
      // Sort by timestamp for proper chronological order
      chartData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      console.log(`📊 Using historical API data: ${chartData.length} points for ${timeframe}`);
    } else {
      // Fallback to local generated data
      const tenMinuteData = getDataForMinutes(10);
      chartData = convertToChartData(tenMinuteData);
    }
    
    setDisplayData(prevData => {
      // Always update when we have new historical data or significant local data changes
      if (historicalData?.data || Math.abs(chartData.length - prevData.length) > 0) {
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
  }, [dataCount, getDataForMinutes, isAutoScrolling, zoomLevel, historicalData, timeframe]);

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
      {/* Enhanced zoom and timeframe indicator */}
      <div className="absolute top-2 right-2 z-10 bg-gray-800/90 px-3 py-1.5 rounded-lg text-xs text-gray-300 pointer-events-none border border-gray-600">
        <div className="flex items-center space-x-2">
          <span>{getZoomIndicator()}</span>
          <span className="text-gray-500">•</span>
          <span>Zoom: {zoomLevel.toFixed(1)}x</span>
          <span className="text-gray-500">•</span>
          <span className="text-blue-400">{timeframe}</span>
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5">
          Scroll to zoom • {timeframe === '1m' ? 'Min zoom' : 'Scroll up for broader view'} {timeframe === '1M' ? '' : '• Scroll down for detail'}
        </div>
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
                interval={Math.max(0, Math.floor(viewportData.length / 8))} // Adjusted for better spacing
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={10}
                tick={{ fill: '#9CA3AF' }}
                domain={[(dataMin: number) => {
                  const minPrice = Math.min(...viewportData.map(d => Math.min(d.low || d.price, d.high || d.price, d.open || d.price, d.close || d.price)));
                  return minPrice * 0.999;
                }, (dataMax: number) => {
                  const maxPrice = Math.max(...viewportData.map(d => Math.max(d.low || d.price, d.high || d.price, d.open || d.price, d.close || d.price)));
                  return maxPrice * 1.001;
                }]} // Auto-scale to visible OHLC range
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
                interval={Math.max(0, Math.floor(viewportData.length / 8))} // Adjusted for better spacing
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={10}
                tick={{ fill: '#9CA3AF' }}
                domain={[(dataMin: number) => dataMin * 0.998, (dataMax: number) => dataMax * 1.002]} // Auto-scale to visible range
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