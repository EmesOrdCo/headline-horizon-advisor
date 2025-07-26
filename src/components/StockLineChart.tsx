import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  const lastDataPointRef = useRef<number>(0);

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

  // Load and update display data
  useEffect(() => {
    const tenMinuteData = getDataForMinutes(10);
    const chartData = convertToChartData(tenMinuteData);
    
    setDisplayData(chartData);
    
    // Auto-scroll to show the latest data
    if (chartData.length > 20) {
      setViewportStart(Math.max(0, chartData.length - 20));
    }
    
    console.log(`📊 Updated display data: ${chartData.length} points (showing last 10 minutes)`);
  }, [dataCount, getDataForMinutes]);

  // Add new data points from WebSocket or simulate them
  useEffect(() => {
    const interval = setInterval(() => {
      const streamPrice = streamData[symbol];
      const now = Date.now();
      
      // Don't add duplicate data points
      if (now - lastDataPointRef.current < 2000) return;
      lastDataPointRef.current = now;
      
      if (streamPrice?.price) {
        // Use real WebSocket data
        addDataPoint(streamPrice.price, {
          open: streamPrice.open,
          high: streamPrice.high,
          low: streamPrice.low,
          close: streamPrice.close,
          volume: streamPrice.volume,
        });
        console.log(`📡 Added real WebSocket data: $${streamPrice.price}`);
      } else {
        // Generate realistic price movement based on current price
        const variation = (Math.random() - 0.5) * 0.2;
        const newPrice = parentPrice + variation;
        
        addDataPoint(newPrice, {
          open: parentPrice + (Math.random() - 0.5) * 0.1,
          high: newPrice + Math.random() * 0.1,
          low: newPrice - Math.random() * 0.1,
          close: newPrice,
        });
        console.log(`🎲 Added simulated data: $${newPrice.toFixed(2)}`);
      }
    }, 3000); // Add new data every 3 seconds

    return () => clearInterval(interval);
  }, [streamData, symbol, parentPrice, addDataPoint]);

  // Get viewport data for smooth scrolling
  const viewportData = displayData.slice(viewportStart, viewportStart + 20);
  
  const currentPrice = parentPrice;
  const firstPrice = displayData[0]?.price || currentPrice;
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

  // Scroll controls
  const canScrollLeft = viewportStart > 0;
  const canScrollRight = viewportStart + 20 < displayData.length;

  const scrollLeft = () => {
    setViewportStart(Math.max(0, viewportStart - 5));
  };

  const scrollRight = () => {
    setViewportStart(Math.min(displayData.length - 20, viewportStart + 5));
  };

  const scrollToLatest = () => {
    setViewportStart(Math.max(0, displayData.length - 20));
  };

  return (
    <div className="w-full h-[600px] bg-gray-900 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">AAPL Stock Chart</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-2xl font-bold text-white">
                ${currentPrice.toFixed(2)}
              </span>
              <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-400">
              {isConnected ? 'Live Data' : 'Simulated Data'}
            </span>
            <span className="text-sm text-gray-400">
              {dataCount} total points
            </span>
            {errorMessage && (
              <span className="text-xs text-red-400 ml-2">
                {errorMessage}
              </span>
            )}
          </div>
        </div>
        
        {/* Scroll Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="px-3 py-1 text-xs bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            ← Earlier
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="px-3 py-1 text-xs bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Later →
          </button>
          <button
            onClick={scrollToLatest}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Latest
          </button>
          <span className="text-xs text-gray-400">
            Showing {viewportStart + 1}-{Math.min(viewportStart + 20, displayData.length)} of {displayData.length}
          </span>
        </div>
      </div>
      
      <div className="h-[500px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={viewportData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF" 
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
              domain={['dataMin - 0.1', 'dataMax + 0.1']}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#10B981' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockLineChart;