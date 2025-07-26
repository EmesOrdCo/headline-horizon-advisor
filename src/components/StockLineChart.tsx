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
  symbol?: string;
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
  
  const { open, close, high, low } = payload;
  const isGreen = close >= open;
  const color = isGreen ? '#10B981' : '#EF4444';
  
  const bodyHeight = Math.abs(close - open) * (height / (payload.high - payload.low));
  const bodyY = y + (Math.max(high - Math.max(open, close)) * (height / (high - low)));
  
  return (
    <g>
      {/* Wick */}
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x + width * 0.2}
        y={bodyY}
        width={width * 0.6}
        height={Math.max(bodyHeight, 1)}
        fill={color}
        stroke={color}
      />
    </g>
  );
};

const StockLineChart: React.FC<StockLineChartProps> = ({ 
  currentPrice: parentPrice = 214.73, 
  symbol = 'AAPL' 
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
  const [chartType, setChartType] = useState<'line' | 'candles'>('line');
  const lastDataPointRef = useRef<number>(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

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

  // Add new data points from WebSocket or simulate them - INSTANT UPDATES
  useEffect(() => {
    const interval = setInterval(() => {
      const streamPrice = streamData[symbol];
      const now = Date.now();
      
      // Much faster updates for real-time feel - every 1 second
      if (now - lastDataPointRef.current < 1000) return;
      lastDataPointRef.current = now;
      
      if (streamPrice?.price) {
        // Use real WebSocket data
        addDataPoint(streamPrice.price, {
          open: streamPrice.open || streamPrice.price,
          high: streamPrice.high || streamPrice.price + Math.random() * 0.05,
          low: streamPrice.low || streamPrice.price - Math.random() * 0.05,
          close: streamPrice.close || streamPrice.price,
          volume: streamPrice.volume || Math.floor(Math.random() * 10000),
        });
        console.log(`📡 INSTANT: Real WebSocket data: $${streamPrice.price}`);
      } else {
        // Generate realistic price movement based on current price
        const variation = (Math.random() - 0.5) * 0.25;
        const newPrice = parentPrice + variation;
        const openPrice = parentPrice + (Math.random() - 0.5) * 0.1;
        
        addDataPoint(newPrice, {
          open: openPrice,
          high: Math.max(newPrice, openPrice) + Math.random() * 0.1,
          low: Math.min(newPrice, openPrice) - Math.random() * 0.1,
          close: newPrice,
          volume: Math.floor(Math.random() * 50000 + 10000),
        });
        console.log(`🎲 INSTANT: Simulated data: $${newPrice.toFixed(2)}`);
      }
    }, 1000); // INSTANT updates every 1 second

    return () => clearInterval(interval);
  }, [streamData, symbol, parentPrice, addDataPoint]);

  // Get viewport data for smooth scrolling
  const viewportData = displayData.slice(viewportStart, viewportStart + VIEWPORT_SIZE);
  
  const currentPrice = parentPrice;
  const firstPrice = displayData[0]?.price || currentPrice;
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

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
    <div className="w-full h-[400px] bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">AAPL Stock Chart</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xl font-bold text-white">
                ${currentPrice.toFixed(2)}
              </span>
              <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-400">
              {isConnected ? 'Live' : 'Sim'}
            </span>
            <span className="text-xs text-gray-400">
              {dataCount}pts
            </span>
            {isAutoScrolling && (
              <span className="text-xs text-blue-400">Auto</span>
            )}
          </div>
        </div>
        
        {/* Chart Type and Scroll Controls */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-1 text-xs rounded ${
                chartType === 'line' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('candles')}
              className={`px-2 py-1 text-xs rounded ${
                chartType === 'candles' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Candles
            </button>
          </div>
          <div className="border-l border-gray-600 h-4"></div>
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded disabled:opacity-50"
          >
            ← Earlier
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Later →
          </button>
          <button
            onClick={scrollToLatest}
            className={`px-2 py-1 text-xs rounded ${
              isAutoScrolling 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-white'
            }`}
          >
            Latest {isAutoScrolling ? '●' : '○'}
          </button>
          <span className="text-xs text-gray-400">
            {viewportStart + 1}-{Math.min(viewportStart + VIEWPORT_SIZE, displayData.length)} of {displayData.length}
          </span>
        </div>
      </div>
      
      <div ref={chartContainerRef} className="h-[300px] p-2 w-full">
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
                domain={['dataMin - 0.2', 'dataMax + 0.2']}
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