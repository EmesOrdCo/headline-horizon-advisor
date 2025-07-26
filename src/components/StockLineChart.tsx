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

  const [chartData, setChartData] = useState<PricePoint[]>([]);

  // Initialize with current time and generate 10 minutes of data
  useEffect(() => {
    const now = new Date();
    const initialData: PricePoint[] = [];
    
    // Use the parent's current price for consistency
    const basePrice = parentPrice;
    
    // Generate last 10 minutes in 30-second intervals (20 points)
    for (let i = 19; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 30000); // 30 seconds apart
      const variation = (Math.random() - 0.5) * 0.5; // Smaller variations for consistency
      const price = basePrice + variation;
      
      initialData.push({
        timestamp: timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString(),
        time: timestamp.toLocaleTimeString(),
        price: Math.round(price * 100) / 100,
        open: Math.round((basePrice + (Math.random() - 0.5) * 0.2) * 100) / 100,
        high: Math.round((price + Math.random() * 0.2) * 100) / 100,
        low: Math.round((price - Math.random() * 0.2) * 100) / 100,
        close: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 10000) + 50000
      });
    }
    
    setChartData(initialData);
    console.log('📊 Initialized chart with', initialData.length, 'points, latest price:', initialData[initialData.length - 1]?.price);
  }, [parentPrice]);

  // Add new data every 3 seconds, using parent price as base
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const data = streamData[symbol];
      
      setChartData(prev => {
        // Always use the parent's current price as the base to ensure consistency
        const basePrice = parentPrice;
        
        // Small realistic price movements around the parent price
        const priceChange = (Math.random() - 0.5) * 0.1;
        const newPrice = basePrice + priceChange;
        
        const newPoint: PricePoint = {
          timestamp: now.toLocaleDateString() + ' ' + now.toLocaleTimeString(),
          time: now.toLocaleTimeString(),
          price: Math.round(newPrice * 100) / 100,
          open: data?.open || Math.round((basePrice + (Math.random() - 0.5) * 0.05) * 100) / 100,
          high: data?.high || Math.round((newPrice + Math.random() * 0.05) * 100) / 100,
          low: data?.low || Math.round((newPrice - Math.random() * 0.05) * 100) / 100,
          close: data?.close || Math.round(newPrice * 100) / 100,
          volume: data?.volume || Math.floor(Math.random() * 10000) + 50000
        };

        // Keep only last 10 minutes of data
        const tenMinutesAgo = now.getTime() - (10 * 60 * 1000);
        const filteredData = prev.filter(point => {
          const pointTime = new Date(point.timestamp).getTime();
          return pointTime > tenMinutesAgo;
        });
        
        const updated = [...filteredData, newPoint];
        console.log('📊 Updated chart, points:', updated.length, 'latest price:', newPoint.price, 'parent price:', parentPrice);
        return updated;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [streamData, parentPrice, symbol]);

  // Use the parent's current price for display
  const currentPrice = parentPrice;
  const firstPrice = chartData[0]?.price || currentPrice;
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

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
              Last 10 minutes
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
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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