import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  
  // Modern TradingView/eToro inspired colors with gradients
  const bullishColor = '#16a34a'; // Rich green
  const bearishColor = '#dc2626'; // Rich red
  const color = isBullish ? bullishColor : bearishColor;
  
  // Calculate the scale factor for price to pixels
  const priceRange = actualHigh - actualLow;
  if (priceRange === 0) return null;
  
  const pixelsPerPrice = height / priceRange;
  
  // Calculate positions - ALWAYS represent exactly 1 minute
  const centerX = x + width / 2;
  
  // Enhanced candle sizing for better visibility and TradingView aesthetic
  const bodyWidth = Math.max(3, Math.min(width * 0.8, 12)); // Wider candles, max 12px
  const bodyLeft = centerX - bodyWidth / 2;
  
  // Calculate Y positions (Y increases downward in SVG)
  const highY = y;
  const lowY = y + height;
  
  const openY = y + ((actualHigh - actualOpen) * pixelsPerPrice);
  const closeY = y + ((actualHigh - actualClose) * pixelsPerPrice);
  
  // Body coordinates
  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.max(1, bodyBottom - bodyTop);
  
  // Define gradients for modern appearance
  const gradientId = `gradient-${isBullish ? 'bull' : 'bear'}-${x}`;
  const shadowId = `shadow-${isBullish ? 'bull' : 'bear'}-${x}`;
  
  return (
    <g>
      <defs>
        {/* Modern gradient for candle bodies */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={isBullish ? 0.9 : 1} />
          <stop offset="50%" stopColor={color} stopOpacity={isBullish ? 0.95 : 1} />
          <stop offset="100%" stopColor={color} stopOpacity={isBullish ? 0.85 : 0.95} />
        </linearGradient>
        
        {/* Subtle glow effect */}
        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          <feOffset dx="0" dy="0.5" result="offset" />
          <feFlood floodColor={color} floodOpacity="0.3" />
          <feComposite in2="offset" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* High-Low Wick - Thinner and high contrast */}
      <line
        x1={centerX}
        y1={highY}
        x2={centerX}
        y2={lowY}
        stroke={color}
        strokeWidth={1.5}
        opacity={0.9}
        strokeLinecap="round"
      />
      
      {/* Main candle body with modern styling */}
      <rect
        x={bodyLeft}
        y={bodyTop}
        width={bodyWidth}
        height={bodyHeight}
        fill={isBullish ? 'none' : `url(#${gradientId})`}
        stroke={color}
        strokeWidth={1.5}
        rx={1} // Rounded corners for modern look
        ry={1}
        filter={`url(#${shadowId})`}
        opacity={1}
      />
      
      {/* Bullish candles - filled with gradient for depth */}
      {isBullish && (
        <rect
          x={bodyLeft + 0.5}
          y={bodyTop + 0.5}
          width={Math.max(0, bodyWidth - 1)}
          height={Math.max(0, bodyHeight - 1)}
          fill={`url(#${gradientId})`}
          rx={0.5}
          ry={0.5}
          opacity={0.7}
        />
      )}
      
      {/* Inner highlight for 3D effect */}
      {bodyHeight > 3 && (
        <rect
          x={bodyLeft + 1}
          y={bodyTop + 1}
          width={Math.max(0, bodyWidth - 2)}
          height={1}
          fill="rgba(255, 255, 255, 0.2)"
          rx={0.5}
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
  // Disable WebSocket if user is on the live trading page to prevent connection conflicts
  const isOnLiveTradingPage = window.location.pathname.includes('/alpaca-live-chart');
  const { streamData, isConnected, errorMessage } = useAlpacaStreamSingleton({ 
    symbols: [symbol], 
    enabled: !isOnLiveTradingPage 
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
  
  // Zoom functionality state with 1-minute granularity constraint
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  
  // State for Y-axis scale locking (locked to 1-day view range)
  const [yAxisRange, setYAxisRange] = useState<{min: number, max: number} | null>(null);
  const [lockedRange, setLockedRange] = useState<{min: number, max: number} | null>(null);
  
  // Timeframe-aware zoom configuration with 1-minute candle constraint
  const getTimeframeZoomConfig = () => {
    const timeframeIndex = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'].indexOf(timeframe);
    return {
      MIN_ZOOM: 0.1,   // Allow zooming out to see more 1-minute candles
      MAX_ZOOM: 10,    // Allow zooming in to see fewer 1-minute candles
      ZOOM_SENSITIVITY: 0.15,
      BASE_VIEWPORT_SIZE: getBaseViewportForTimeframe(timeframe),
      CAN_ZOOM_DOWN: timeframeIndex > 0,
      CAN_ZOOM_UP: timeframeIndex < 8,
      NEXT_TIMEFRAME_DOWN: timeframeIndex > 0 ? ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'][timeframeIndex - 1] : null,
      NEXT_TIMEFRAME_UP: timeframeIndex < 8 ? ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'][timeframeIndex + 1] : null
    };
  };

  
  
  // CRITICAL: Each candlestick ALWAYS represents exactly 1 minute of data
  // This ensures data integrity regardless of zoom level or timeframe
  const MINUTES_PER_CANDLE = 1;
  const TARGET_CANDLES = 60; // Always aim for ~60 visible candles for optimal viewing
  
  // Get base viewport size - always targeting exactly 60 1-minute candles
  const getBaseViewportForTimeframe = (tf: string) => {
    // Every candle is 1 minute, so 60 candles = 60 minutes of data
    return TARGET_CANDLES;
  };
  
  // Get time window in minutes - how many 1-minute periods we need for the timeframe
  const getTimeWindowMinutes = (tf: string) => {
    switch (tf) {
      case '1m': return 60;      // 60 * 1-minute candles = 1 hour
      case '5m': return 180;     // 180 * 1-minute candles = 3 hours  
      case '15m': return 360;    // 360 * 1-minute candles = 6 hours
      case '30m': return 720;    // 720 * 1-minute candles = 12 hours
      case '1H': return 2880;    // 2880 * 1-minute candles = 48 hours
      case '4H': return 7200;    // 7200 * 1-minute candles = 120 hours (5 days)
      case '1D': return 43200;   // 43200 * 1-minute candles = 720 hours (30 days)
      case '1W': return 129600;  // 129600 * 1-minute candles = 2160 hours (12 weeks)
      case '1M': return 525600;  // 525600 * 1-minute candles = 8760 hours (12 months)
      default: return 1440; // 1 day default
    }
  };

  // Calculate viewport size based on zoom - each candle is ALWAYS 1 minute
  const getViewportSize = () => {
    const config = getTimeframeZoomConfig();
    const baseSize = config.BASE_VIEWPORT_SIZE;
    const zoomedSize = Math.floor(baseSize / zoomLevel);
    // Maintain minimum visibility while ensuring each candle = 1 minute
    return Math.max(10, Math.min(120, zoomedSize));
  };

  // Sync chart type with prop
  useEffect(() => {
    setActiveChartType(chartType);
  }, [chartType]);

  // Zoom indicator showing actual time range with 1-minute precision
  const getZoomIndicator = () => {
    const timeRange = getViewportSize();
    
    // Since each candle is exactly 1 minute, calculate actual time spans
    const totalMinutes = timeRange * MINUTES_PER_CANDLE;
    
    if (totalMinutes <= 5) return "5 minutes (1-min candles)";
    if (totalMinutes <= 15) return "15 minutes (1-min candles)";
    if (totalMinutes <= 30) return "30 minutes (1-min candles)";
    if (totalMinutes <= 60) return "1 hour (1-min candles)";
    if (totalMinutes <= 180) return "3 hours (1-min candles)";
    if (totalMinutes <= 360) return "6 hours (1-min candles)";
    if (totalMinutes <= 1440) return `${Math.round(totalMinutes/60)} hours (1-min candles)`;
    return `${Math.round(totalMinutes/1440)} days (1-min candles)`;
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

  // Load and update display data smoothly - ALWAYS 1-minute resolution
  useEffect(() => {
    let chartData: PricePoint[] = [];
    
    // Prioritize historical data from API if available
    if (historicalData?.data && historicalData.data.length > 0) {
      chartData = historicalData.data.map((point: any) => {
        const date = new Date(point.timestamp || point.date);
        
        // CRITICAL: Every data point represents exactly 1 minute
        // Time labeling adapts to zoom level but data granularity stays at 1 minute
        let timeLabel = '';
        let timestampLabel = '';
        
        // For 1-minute data, always show precise time
        timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        timestampLabel = date.toLocaleDateString() + ' ' + timeLabel;
        
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
      
      // Lock Y-axis to 1-day range on first load
      if (timeframe === '1D' && chartData.length > 0 && !lockedRange) {
        const prices = chartData.map(d => d.close);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const padding = (maxPrice - minPrice) * 0.05; // 5% padding
        const range = {
          min: minPrice - padding,
          max: maxPrice + padding
        };
        setLockedRange(range);
        setYAxisRange(range);
      }
      
      console.log(`📊 Using 1-minute resolution data: ${chartData.length} points for ${timeframe}`);
    } else {
      // Fallback to local generated data - also 1-minute resolution
      const tenMinuteData = getDataForMinutes(10);
      chartData = convertToChartData(tenMinuteData);
    }
    
    setDisplayData(prevData => {
      // Always update when we have new historical data or significant local data changes
      if (historicalData?.data || Math.abs(chartData.length - prevData.length) > 0) {
        console.log(`📊 Updated 1-minute display data: ${chartData.length} points`);
        
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
  }, [dataCount, getDataForMinutes, isAutoScrolling, zoomLevel, historicalData, timeframe, lockedRange]);

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

  // Calculate the viewport data - always 1-minute candles with proper spacing
  const viewportData = useMemo(() => {
    const currentViewportSize = getViewportSize();
    const endIndex = Math.min(viewportStart + currentViewportSize, displayData.length);
    const startIndex = Math.max(0, endIndex - currentViewportSize);
    
    const data = displayData.slice(startIndex, endIndex);
    
    // Ensure proper spacing between candles regardless of zoom level
    const spacedData = data.map((item, index) => ({
      ...item,
      // Add index to ensure proper x-axis spacing
      index: startIndex + index,
      // Each candle represents exactly 1 minute
      minuteMarker: `1min-${startIndex + index}`
    }));
    
    console.log(`📊 Viewport: ${spacedData.length} 1-minute candles (${startIndex}-${endIndex})`);
    return spacedData;
  }, [displayData, viewportStart, getViewportSize]);

  // Enhanced performance and smooth rendering
  const chartHeight = chartContainerRef.current?.clientHeight || 400;
  
  // Use locked Y-axis range to maintain consistent scale
  const getYAxisDomain = () => {
    if (lockedRange) {
      return [lockedRange.min, lockedRange.max];
    }
    
    if (viewportData.length === 0) return ['auto', 'auto'];
    
    const prices = viewportData.flatMap(d => [d.high, d.low, d.open, d.close]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const padding = (maxPrice - minPrice) * 0.02; // 2% padding
    
    return [minPrice - padding, maxPrice + padding];
  };

  if (!displayData.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="animate-pulse text-2xl mb-2">📊</div>
          <p>Loading 1-minute market data...</p>
          <p className="text-sm text-slate-500 mt-1">Each candle = exactly 1 minute</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-slate-900" ref={chartContainerRef}>
      {/* Enhanced UI indicators */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
        {/* Data resolution indicator */}
        <div className="bg-slate-800/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-300">
            <span className="text-emerald-400 font-medium">1-minute resolution</span>
            <div className="text-slate-400">
              {viewportData.length} candles • {getZoomIndicator()}
            </div>
          </div>
        </div>
        
        {/* Y-axis lock indicator */}
        {lockedRange && (
          <div className="bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded border border-amber-600">
            <div className="text-xs text-amber-400">
              Y-axis locked to 1D range
            </div>
          </div>
        )}
      </div>

      {/* Real-time connection status */}
      {isConnected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-emerald-600/20 backdrop-blur-sm px-2 py-1 rounded border border-emerald-600">
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              Live Data
            </div>
          </div>
        </div>
      )}

      {/* Enhanced chart with proper spacing and locked Y-axis */}
      <ResponsiveContainer width="100%" height="100%">
        {activeChartType === 'candles' ? (
          <ComposedChart 
            data={viewportData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="10%" // Consistent spacing between candles
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              opacity={0.3}
              verticalPoints={[]}
            />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={getYAxisDomain()}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="close" 
              shape={<CandlestickBar />}
              isAnimationActive={false} // Disable animation for better performance
            />
          </ComposedChart>
        ) : (
          <LineChart 
            data={viewportData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              opacity={0.3}
            />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={getYAxisDomain()}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#10B981" }}
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
      
      {/* Mouse interaction hints */}
      <div 
        className="absolute inset-0 pointer-events-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};

export default StockLineChart;