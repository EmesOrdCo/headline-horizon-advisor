
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface PricePoint {
  timestamp: string;
  price: number;
  symbol: string;
}

interface RealTimePriceChartProps {
  data: PricePoint[];
  symbol: string;
}

const RealTimePriceChart = ({ data, symbol }: RealTimePriceChartProps) => {
  const chartData = useMemo(() => {
    return data.map(point => ({
      time: new Date(point.timestamp).toLocaleTimeString(),
      price: point.price,
      fullTime: point.timestamp
    }));
  }, [data]);

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--chart-1))",
    },
  };

  // Check if market is likely closed based on current time
  const isMarketClosed = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    // Weekend or outside market hours (9:30 AM - 4 PM ET, roughly 14:30 - 21:00 UTC)
    const isWeekend = currentDay === 0 || currentDay === 6;
    const isAfterHours = currentHour < 14 || currentHour > 21;
    
    return isWeekend || isAfterHours;
  }, []);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <p className="mb-2">No price data available for {symbol}</p>
          {isMarketClosed && (
            <p className="text-sm text-slate-500">Market is currently closed</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">
          {symbol} {isMarketClosed ? 'Close Performance' : 'Live Performance'}
        </h3>
        <p className="text-sm text-slate-400">
          {data.length} data points {isMarketClosed && '(until market close)'}
        </p>
      </div>
      
      <ChartContainer config={chartConfig} className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              domain={['dataMin - 0.01', 'dataMax + 0.01']}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              labelFormatter={(value, payload) => {
                if (payload && payload[0]) {
                  return new Date(payload[0].payload.fullTime).toLocaleString();
                }
                return value;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="var(--color-price)" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-price)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default RealTimePriceChart;
