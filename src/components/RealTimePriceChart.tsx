
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

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <p>No price data available for {symbol}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{symbol} Live Price Chart</h3>
        <p className="text-sm text-slate-400">{data.length} data points</p>
      </div>
      
      <ChartContainer config={chartConfig} className="h-64 w-full">
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
