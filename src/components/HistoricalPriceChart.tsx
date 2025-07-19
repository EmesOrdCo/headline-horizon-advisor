
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";

interface HistoricalPriceChartProps {
  symbol: string;
  timeframe?: string;
  limit?: number;
}

const HistoricalPriceChart = ({ symbol, timeframe = '1Day', limit = 30 }: HistoricalPriceChartProps) => {
  const { data: historicalData, isLoading, error } = useHistoricalPrices(symbol, timeframe, limit);

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
    }));
  }, [historicalData]);

  const chartConfig = {
    close: {
      label: "Close Price",
      color: "hsl(var(--chart-1))",
    },
  };

  if (isLoading) {
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

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {symbol} Historical Price Chart ({limit} days)
            </h3>
            <p className="text-sm text-slate-400">
              {chartData.length} data points
            </p>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${totalChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)} 
              ({totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%)
            </div>
            <div className="text-sm text-slate-400">
              Period change
            </div>
          </div>
        </div>
      </div>
      
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
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
              stroke="var(--color-close)" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-close)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default HistoricalPriceChart;
