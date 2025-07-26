import React, { useState, useEffect } from 'react';
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

const StockLineChart: React.FC = () => {
  const { streamData, isConnected, errorMessage } = useAlpacaStreamSingleton({ 
    symbols: ['AAPL'], 
    enabled: true 
  });

  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [fallbackData, setFallbackData] = useState<PricePoint[]>([]);

  // Generate initial fallback data
  useEffect(() => {
    if (chartData.length === 0 && fallbackData.length === 0) {
      const now = Date.now();
      const initialData: PricePoint[] = [];
      
      for (let i = 29; i >= 0; i--) {
        const timestamp = new Date(now - i * 30000); // 30 seconds apart
        const basePrice = 213.95;
        const variation = (Math.random() - 0.5) * 4;
        const price = basePrice + variation;
        
        initialData.push({
          timestamp: timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString(),
          time: timestamp.toLocaleTimeString(),
          price: Math.round(price * 100) / 100,
          open: Math.round((basePrice + (Math.random() - 0.5) * 2) * 100) / 100,
          high: Math.round((price + Math.random() * 1) * 100) / 100,
          low: Math.round((price - Math.random() * 1) * 100) / 100,
          close: Math.round(price * 100) / 100,
          volume: Math.floor(Math.random() * 50000) + 30000
        });
      }
      
      setFallbackData(initialData);
      console.log('📈 Generated initial chart data with', initialData.length, 'points');
    }
  }, [chartData.length, fallbackData.length]);

  // Update chart data when stream data changes
  useEffect(() => {
    const data = streamData['AAPL'];
    if (data?.price && data?.timestamp) {
      const newPoint: PricePoint = {
        timestamp: new Date(data.timestamp).toLocaleDateString() + ' ' + new Date(data.timestamp).toLocaleTimeString(),
        time: new Date(data.timestamp).toLocaleTimeString(),
        price: data.price,
        open: data.open || data.price,
        high: data.high || data.price,
        low: data.low || data.price,
        close: data.close || data.price,
        volume: data.volume || 0
      };

      setChartData(prev => {
        const updated = [...prev, newPoint].slice(-50); // Keep last 50 points
        return updated;
      });
      
      // Clear fallback data when real data starts coming in
      if (fallbackData.length > 0) {
        setFallbackData([]);
      }
      
      console.log('📊 Added real WebSocket data point:', newPoint);
    }
  }, [streamData, fallbackData.length]);

  // Generate live updates for fallback data
  useEffect(() => {
    if (fallbackData.length > 0 && chartData.length === 0) {
      const interval = setInterval(() => {
        const lastPoint = fallbackData[fallbackData.length - 1];
        const now = new Date();
        const basePrice = 213.95;
        const variation = (Math.random() - 0.5) * 2;
        const newPrice = basePrice + variation;
        
        const newPoint: PricePoint = {
          timestamp: now.toLocaleDateString() + ' ' + now.toLocaleTimeString(),
          time: now.toLocaleTimeString(),
          price: Math.round(newPrice * 100) / 100,
          open: lastPoint?.close || newPrice,
          high: Math.round((newPrice + Math.random() * 0.5) * 100) / 100,
          low: Math.round((newPrice - Math.random() * 0.5) * 100) / 100,
          close: Math.round(newPrice * 100) / 100,
          volume: Math.floor(Math.random() * 50000) + 30000
        };

        setFallbackData(prev => [...prev, newPoint].slice(-50));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [fallbackData, chartData.length]);

  const displayData = chartData.length > 0 ? chartData : fallbackData;
  const currentPrice = displayData[displayData.length - 1]?.price || 0;
  const previousPrice = displayData[displayData.length - 2]?.price || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

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
              {isConnected ? 'Live Data' : 'Demo Data'}
            </span>
            {errorMessage && (
              <span className="text-xs text-red-400 ml-2">
                {errorMessage}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="h-[540px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF" 
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockLineChart;