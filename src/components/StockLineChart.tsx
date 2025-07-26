import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useHistoricalPrices } from '@/hooks/useHistoricalPrices';
import { useAlpacaStreamSingleton } from '@/hooks/useAlpacaStreamSingleton';
import { TrendingUp, TrendingDown, BarChart3, Calendar, Clock, RefreshCw } from 'lucide-react';
import { ComposedChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, ReferenceLine } from 'recharts';

interface StockLineChartProps {
  symbol: string;
  className?: string;
  currentPrice?: number;
  chartType?: 'line' | 'candles';
  timeframe?: string;
  historicalData?: any;
}

// Timeframe configurations with proper intervals for live updates
const timeframeOptions = [
  { value: '1Minute', label: '1M', description: '1 Minute', interval: 5 * 60 * 1000, tickCount: 12 },
  { value: '5Minute', label: '5M', description: '5 Minutes', interval: 15 * 60 * 1000, tickCount: 8 },
  { value: '15Minute', label: '15M', description: '15 Minutes', interval: 60 * 60 * 1000, tickCount: 6 },
  { value: '30Minute', label: '30M', description: '30 Minutes', interval: 2 * 60 * 60 * 1000, tickCount: 6 },
  { value: '1Hour', label: '1H', description: '1 Hour', interval: 4 * 60 * 60 * 1000, tickCount: 6 },
  { value: '1Day', label: '1D', description: '1 Day', interval: 24 * 60 * 60 * 1000, tickCount: 5 }
];

const StockLineChart: React.FC<StockLineChartProps> = ({ 
  symbol, 
  className = "",
  currentPrice: propCurrentPrice,
  chartType = 'candles',
  timeframe: propTimeframe,
  historicalData: propHistoricalData
}) => {
  const [timeframe, setTimeframe] = useState(propTimeframe || '1Minute');
  const [limit, setLimit] = useState(60);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  
  // Get timeframe config
  const currentTimeframeConfig = timeframeOptions.find(opt => opt.value === timeframe) || timeframeOptions[0];
  
  // Fetch historical data only if not provided as prop
  const { data: historicalData, isLoading, error, refetch } = useHistoricalPrices(
    symbol, 
    timeframe, 
    limit
  );
  
  // Get real-time updates
  const { streamData, isConnected } = useAlpacaStreamSingleton({ 
    symbols: [symbol], 
    enabled: true 
  });
  
  // Extract realtime data for this symbol
  const realtimeData = streamData[symbol];

  // Combine and process data
  const chartData = useMemo(() => {
    // Use prop data first, then fetched data
    const dataSource = propHistoricalData || historicalData;
    if (!dataSource?.data) return [];

    let data = dataSource.data.map((point, index) => {
      const timestamp = new Date(point.timestamp);
      
      return {
        timestamp: timestamp.getTime(),
        time: timestamp,
        open: Number(point.open),
        high: Number(point.high),
        low: Number(point.low),
        close: Number(point.close),
        volume: Number(point.volume),
        color: Number(point.close) >= Number(point.open) ? '#10b981' : '#ef4444',
        fill: Number(point.close) >= Number(point.open) ? 'url(#bullishGradient)' : 'url(#bearishGradient)',
        wickColor: Number(point.close) >= Number(point.open) ? '#065f46' : '#7f1d1d'
      };
    });

    // Add real-time data if available and matches timeframe
    if (realtimeData && timeframe === '1Minute') {
      const latestHistorical = data[data.length - 1];
      const realtimeTimestamp = new Date(realtimeData.timestamp).getTime();
      
      // Only add if it's newer than our latest historical data
      if (!latestHistorical || realtimeTimestamp > latestHistorical.timestamp) {
        const realtimePoint = {
          timestamp: realtimeTimestamp,
          time: new Date(realtimeData.timestamp),
          open: Number(realtimeData.price),
          high: Number(realtimeData.price),
          low: Number(realtimeData.price),
          close: Number(realtimeData.price),
          volume: Number(realtimeData.volume || 0),
          color: '#10b981', // Live data color
          fill: 'url(#liveGradient)',
          wickColor: '#065f46',
          isLive: true
        };
        data = [...data.slice(-59), realtimePoint]; // Keep last 59 + live point = 60 total
      }
    }

    // Sort by timestamp to ensure chronological order
    return data.sort((a, b) => a.timestamp - b.timestamp);
  }, [propHistoricalData, historicalData, realtimeData, timeframe]);

  // Auto-refresh based on timeframe (only if not using prop data)
  useEffect(() => {
    if (propHistoricalData) return; // Don't auto-refresh if using prop data
    
    const interval = setInterval(() => {
      refetch();
      setLastUpdateTime(new Date());
    }, currentTimeframeConfig.interval);

    return () => clearInterval(interval);
  }, [currentTimeframeConfig.interval, refetch, propHistoricalData]);

  // Calculate price range for locked Y-axis (based on 1-day view)
  const priceRange = useMemo(() => {
    if (!chartData.length) return { min: 0, max: 100 };
    
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const padding = (maxPrice - minPrice) * 0.1; // 10% padding
    
    return {
      min: Math.max(0, minPrice - padding),
      max: maxPrice + padding
    };
  }, [chartData]);

  // Format time labels based on timeframe
  const formatXAxisLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    
    switch (timeframe) {
      case '1Minute':
      case '5Minute':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '15Minute':
      case '30Minute':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '1Hour':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '1Day':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Generate chronological ticks for X-axis
  const generateXAxisTicks = () => {
    if (!chartData.length) return [];
    
    const startTime = chartData[0].timestamp;
    const endTime = chartData[chartData.length - 1].timestamp;
    const tickCount = currentTimeframeConfig.tickCount;
    
    const ticks = [];
    const actualInterval = (endTime - startTime) / (tickCount - 1);
    
    for (let i = 0; i < tickCount; i++) {
      ticks.push(startTime + (actualInterval * i));
    }
    
    return ticks;
  };

  // Custom candlestick renderer
  const CandlestickBar = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;
    
    const { open, close, high, low, color, wickColor } = payload;
    const isBullish = close >= open;
    
    // Calculate positions
    const centerX = x + width / 2;
    const bodyWidth = Math.max(2, Math.min(width * 0.8, 8));
    const bodyLeft = centerX - bodyWidth / 2;
    
    // Price range calculations
    const priceRange = high - low;
    if (priceRange === 0) return null;
    
    const pixelsPerPrice = height / priceRange;
    
    // Y positions (inverted because SVG y increases downward)
    const highY = y;
    const lowY = y + height;
    const openY = y + ((high - open) * pixelsPerPrice);
    const closeY = y + ((high - close) * pixelsPerPrice);
    
    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = Math.max(1, bodyBottom - bodyTop);
    
    return (
      <g>
        {/* High-Low Wick */}
        <line
          x1={centerX}
          y1={highY}
          x2={centerX}
          y2={lowY}
          stroke={wickColor}
          strokeWidth={1}
          opacity={0.8}
        />
        
        {/* Candle Body */}
        <rect
          x={bodyLeft}
          y={bodyTop}
          width={bodyWidth}
          height={bodyHeight}
          fill={isBullish ? 'none' : color}
          stroke={color}
          strokeWidth={1}
          rx={1}
          ry={1}
          opacity={0.9}
        />
        
        {/* Bullish fill */}
        {isBullish && bodyHeight > 2 && (
          <rect
            x={bodyLeft + 0.5}
            y={bodyTop + 0.5}
            width={Math.max(0, bodyWidth - 1)}
            height={Math.max(0, bodyHeight - 1)}
            fill={color}
            opacity={0.3}
            rx={0.5}
            ry={0.5}
          />
        )}
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    if (!data) return null;
    
    return (
      <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-lg">
        <p className="text-white font-medium mb-2">
          {data.time.toLocaleString()}
          {data.isLive && <span className="ml-2 text-green-400 text-xs">LIVE</span>}
        </p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Open:</span>
            <span className="text-white">${data.open.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">High:</span>
            <span className="text-green-400">${data.high.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Low:</span>
            <span className="text-red-400">${data.low.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Close:</span>
            <span className="text-white font-bold">${data.close.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Volume:</span>
            <span className="text-slate-200">{data.volume.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  const derivedCurrentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : (propCurrentPrice || 0);
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2].close : derivedCurrentPrice;
  const priceChange = derivedCurrentPrice - previousPrice;
  const priceChangePercent = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;

  if (error) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Failed to load chart data</p>
            <p className="text-xs mt-1 text-slate-400">Error: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {symbol} Chart
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Live Updates: {isConnected ? 'Connected' : 'Disconnected'}</span>
              <span>•</span>
              <span>Last Update: {lastUpdateTime.toLocaleTimeString()}</span>
              <span>•</span>
              <span>Auto-refresh: {Math.floor(currentTimeframeConfig.interval / 60000)}min</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!propHistoricalData && (
              <Button 
                onClick={() => refetch()} 
                disabled={isLoading}
                variant="outline" 
                size="sm"
                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
            )}
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-24 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeframeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Price Display */}
        <div className="flex items-center gap-4 mt-2">
          <div className="text-2xl font-bold text-white">
            ${derivedCurrentPrice.toFixed(2)}
          </div>
          <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-medium">
              {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Timeframe: {currentTimeframeConfig.description}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <defs>
                <linearGradient id="bullishGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="bearishGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="liveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              
              <XAxis 
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                ticks={generateXAxisTicks()}
                tickFormatter={formatXAxisLabel}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                height={30}
              />
              <YAxis 
                orientation="right"
                domain={[priceRange.min, priceRange.max]}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                width={80}
              />
              
              <Bar
                dataKey="close"
                shape={<CandlestickBar />}
                fill="#10b981"
              />
              
              <ReferenceLine 
                y={derivedCurrentPrice} 
                stroke="#06b6d4" 
                strokeDasharray="2 2" 
                opacity={0.6} 
              />
              
              <CustomTooltip />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockLineChart;