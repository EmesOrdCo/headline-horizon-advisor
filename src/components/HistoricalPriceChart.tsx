import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ComposedChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { BarChart3, TrendingUp } from "lucide-react";

interface HistoricalPriceChartProps {
  symbol: string;
  timeframe?: string;
  limit?: number;
  height?: number;
  showMiniChart?: boolean;
  fullHeight?: boolean; // New prop for TradingView modal
}

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y';

const TIME_PERIODS: { label: string; value: TimePeriod; days: number }[] = [
  { label: '1D', value: '1D', days: 1 },
  { label: '1W', value: '1W', days: 7 },
  { label: '1M', value: '1M', days: 30 },
  { label: '3M', value: '3M', days: 90 },
  { label: '1Y', value: '1Y', days: 365 },
];

// Custom Candlestick component for Recharts
const Candlestick = (props: any) => {
  const { payload, x, y, width, height } = props;
  if (!payload) return null;
  
  const { open, high, low, close } = payload;
  const isGreen = close >= open;
  const color = isGreen ? '#10b981' : '#ef4444';
  const bodyHeight = Math.abs(close - open);
  const bodyY = Math.min(close, open);
  
  // Calculate positions relative to the chart scale
  const candleWidth = Math.max(width * 0.6, 2);
  const wickWidth = 1;
  const centerX = x + width / 2;
  
  // Scale values to chart coordinates (this is a simplified approach)
  const scale = height / (high - low);
  const highY = y;
  const lowY = y + height;
  const bodyTop = y + (high - Math.max(open, close)) * scale;
  const bodyBottom = y + (high - Math.min(open, close)) * scale;
  
  return (
    <g>
      {/* High-Low wick */}
      <line
        x1={centerX}
        y1={highY}
        x2={centerX}
        y2={lowY}
        stroke={color}
        strokeWidth={wickWidth}
      />
      {/* Open-Close body */}
      <rect
        x={centerX - candleWidth / 2}
        y={bodyTop}
        width={candleWidth}
        height={Math.max(bodyBottom - bodyTop, 1)}
        fill={isGreen ? color : 'transparent'}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

const HistoricalPriceChart = ({ symbol, timeframe = '1Day', limit = 30, height, showMiniChart = false, fullHeight = false }: HistoricalPriceChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1M');
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');

  // For mini charts, use the passed limit prop. For full charts, use the selected period
  const currentLimit = showMiniChart ? limit : (TIME_PERIODS.find(p => p.value === selectedPeriod)?.days || 30);
  
  const { data: historicalData, isLoading, error } = useHistoricalPrices(symbol, timeframe, currentLimit);

  const chartData = useMemo(() => {
    if (!historicalData?.data) return [];
    
    return historicalData.data.map(point => ({
      date: new Date(point.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fullDate: point.date,
      close: point.close,
      open: point.open,
      high: point.high,
      low: point.low,
      volume: point.volume,
      isGreen: point.close >= point.open,
      bodyHeight: Math.abs(point.close - point.open),
    }));
  }, [historicalData]);

  const chartConfig = {
    close: {
      label: "Close Price",
      color: "#10b981",
    },
  };

  if (isLoading) {
    if (showMiniChart) {
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="animate-pulse bg-slate-700 w-full h-full rounded"></div>
        </div>
      );
    }
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto mb-2"></div>
          <p>Loading historical data for {symbol}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    if (showMiniChart) {
      return (
        <div className="w-full h-12 flex items-center justify-center text-red-400 text-xs">
          Error
        </div>
      );
    }
    return (
      <div className="h-64 flex items-center justify-center text-red-400">
        <div className="text-center">
          <p className="mb-2">Failed to load historical data</p>
          <p className="text-sm text-slate-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    if (showMiniChart) {
      return (
        <div className="w-full h-12 flex items-center justify-center text-slate-400 text-xs">
          No data
        </div>
      );
    }
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <p>No historical data available for {symbol}</p>
        </div>
      </div>
    );
  }

  // Calculate price change for the period
  const firstPrice = chartData[0]?.close || 0;
  const lastPrice = chartData[chartData.length - 1]?.close || 0;
  const totalChange = lastPrice - firstPrice;
  const totalChangePercent = firstPrice !== 0 ? ((totalChange / firstPrice) * 100) : 0;

  // If this is a mini chart, render simplified version with proper scaling
  if (showMiniChart) {
    // Calculate the price range for proper Y-axis scaling
    const prices = chartData.map(d => d.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Add some padding to the range (5% on each side) to make variations more visible
    const padding = priceRange * 0.05;
    const yAxisMin = minPrice - padding;
    const yAxisMax = maxPrice + padding;

    return (
      <div className="w-full" style={{ height: height || 48 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <YAxis 
              domain={[yAxisMin, yAxisMax]}
              hide={true}
            />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke={totalChange >= 0 ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Custom candlestick rendering function
  const renderCandlestick = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload || !payload.length) return null;
    
    const data = payload[0].payload;
    const { open, high, low, close } = data;
    const isGreen = close >= open;
    const color = isGreen ? '#10b981' : '#ef4444';
    
    const candleWidth = Math.max(width * 0.6, 2);
    const centerX = x + width / 2;
    
    // Find the y-scale range
    const yScale = props.yAxisMap?.[payload[0].dataKey]?.scale || ((val: number) => val);
    
    const highY = yScale(high);
    const lowY = yScale(low);
    const openY = yScale(open);
    const closeY = yScale(close);
    
    return (
      <g key={`candlestick-${x}`}>
        {/* High-Low wick */}
        <line
          x1={centerX}
          y1={highY}
          x2={centerX}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />
        {/* Open-Close body */}
        <rect
          x={centerX - candleWidth / 2}
          y={Math.min(openY, closeY)}
          width={candleWidth}
          height={Math.max(Math.abs(closeY - openY), 1)}
          fill={isGreen ? color : 'transparent'}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  };

  return (
    <div className={fullHeight ? "w-full h-full flex flex-col" : "w-full"}>
      {!fullHeight && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {symbol} Live Performance
              </h3>
              <p className="text-sm text-slate-400">
                {chartData.length} data points
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Time Period Buttons */}
              <div className="flex gap-1">
                {TIME_PERIODS.map((period) => (
                  <Button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    variant={selectedPeriod === period.value ? 'default' : 'outline'}
                    size="sm"
                    className={selectedPeriod === period.value 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                    }
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
              
              {/* Chart Type Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setChartType('line')}
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  className={chartType === 'line' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Line
                </Button>
                <Button
                  onClick={() => setChartType('candlestick')}
                  variant={chartType === 'candlestick' ? 'default' : 'outline'}
                  size="sm"
                  className={chartType === 'candlestick' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Candles
                </Button>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-semibold ${totalChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)} 
                  ({totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%)
                </div>
                <div className="text-sm text-slate-400">
                  {selectedPeriod} change
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ChartContainer config={chartConfig} className={fullHeight ? "flex-1 w-full" : "h-64 w-full"}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                      <p className="text-white font-medium mb-2">{data.fullDate}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Close:</span>
                          <span className="text-white font-medium">${data.close}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Open:</span>
                          <span className="text-slate-300">${data.open}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">High:</span>
                          <span className="text-emerald-400">${data.high}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Low:</span>
                          <span className="text-red-400">${data.low}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Volume:</span>
                          <span className="text-slate-300">{data.volume.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#10b981" }}
              />
            </LineChart>
          ) : (
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  
                  const data = payload[0].payload;
                  const change = data.close - data.open;
                  const changePercent = data.open !== 0 ? ((change / data.open) * 100) : 0;
                  
                  return (
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                      <p className="text-white font-medium mb-2">{data.fullDate}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Open:</span>
                          <span className="text-slate-300">${data.open.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">High:</span>
                          <span className="text-emerald-400">${data.high.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Low:</span>
                          <span className="text-red-400">${data.low.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Close:</span>
                          <span className="text-white font-medium">${data.close.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Change:</span>
                          <span className={`font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Volume:</span>
                          <span className="text-slate-300">{data.volume.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              {/* Render candlesticks using Bar with custom shape */}
              <Bar 
                dataKey="close" 
                shape={(props: any) => {
                  const { payload, x, y, width, height } = props;
                  if (!payload) return null;
                  
                  const { open, high, low, close } = payload;
                  const isGreen = close >= open;
                  const color = isGreen ? '#10b981' : '#ef4444';
                  
                  const candleWidth = Math.max(width * 0.6, 2);
                  const centerX = x + width / 2;
                  
                  // Calculate positions for OHLC
                  const chartHeight = height;
                  const dataRange = Math.max(...chartData.map(d => d.high)) - Math.min(...chartData.map(d => d.low));
                  const scale = chartHeight / dataRange;
                  const minValue = Math.min(...chartData.map(d => d.low));
                  
                  const highY = y + chartHeight - ((high - minValue) * scale);
                  const lowY = y + chartHeight - ((low - minValue) * scale);
                  const openY = y + chartHeight - ((open - minValue) * scale);
                  const closeY = y + chartHeight - ((close - minValue) * scale);
                  
                  return (
                    <g key={`candlestick-${x}`}>
                      {/* High-Low wick */}
                      <line
                        x1={centerX}
                        y1={highY}
                        x2={centerX}
                        y2={lowY}
                        stroke={color}
                        strokeWidth={1}
                      />
                      {/* Open-Close body */}
                      <rect
                        x={centerX - candleWidth / 2}
                        y={Math.min(openY, closeY)}
                        width={candleWidth}
                        height={Math.max(Math.abs(closeY - openY), 1)}
                        fill={isGreen ? color : 'transparent'}
                        stroke={color}
                        strokeWidth={1}
                      />
                    </g>
                  );
                }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default HistoricalPriceChart;
