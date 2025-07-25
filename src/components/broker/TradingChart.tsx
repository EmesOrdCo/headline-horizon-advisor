import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StockPrice {
  symbol: string;
  price: number;
  askPrice: number;
  bidPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
}

interface TradingChartProps {
  symbol: string;
  quantity: string;
}

const TradingChart = ({ symbol, quantity }: TradingChartProps) => {
  const [stockData, setStockData] = useState<StockPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<{ time: string; price: number }[]>([]);

  const fetchStockPrice = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('stock-price', {
        body: { symbol }
      });

      if (error) throw error;
      
      setStockData(data);
      
      // Add to price history for mini chart
      const now = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      setPriceHistory(prev => {
        const newHistory = [...prev, { time: now, price: data.price }];
        // Keep only last 20 data points
        return newHistory.slice(-20);
      });
      
    } catch (err) {
      console.error('Error fetching stock price:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock price');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchStockPrice();
      // Refresh every 30 seconds
      const interval = setInterval(fetchStockPrice, 30000);
      return () => clearInterval(interval);
    }
  }, [symbol]);

  const spread = stockData ? (stockData.askPrice - stockData.bidPrice) : 0;
  const spreadPercent = stockData ? ((spread / stockData.askPrice) * 100) : 0;
  const estimatedCost = stockData ? (stockData.askPrice * parseFloat(quantity || '0')) : 0;

  if (loading && !stockData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Information</CardTitle>
          <CardDescription>Loading price data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Information</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stockData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Information</CardTitle>
          <CardDescription>Select a symbol to view price data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{stockData.symbol}</span>
          {loading && <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>}
        </CardTitle>
        <CardDescription>Real-time market data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">${stockData.price}</p>
            <div className="flex items-center space-x-2">
              <Badge variant={stockData.change >= 0 ? 'default' : 'destructive'} className="flex items-center space-x-1">
                {stockData.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>${Math.abs(stockData.change)} ({Math.abs(stockData.changePercent)}%)</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Bid/Ask Spread */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Bid</p>
            <p className="font-semibold text-green-600">${stockData.bidPrice}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ask</p>
            <p className="font-semibold text-red-600">${stockData.askPrice}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Spread</p>
            <p className="font-medium">${spread.toFixed(2)} ({spreadPercent.toFixed(2)}%)</p>
          </div>
          <div>
            <p className="text-muted-foreground">Previous Close</p>
            <p className="font-medium">${stockData.previousClose}</p>
          </div>
        </div>

        {/* Estimated Cost */}
        {quantity && parseFloat(quantity) > 0 && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Estimated Cost ({quantity} shares)</p>
            <p className="text-lg font-bold">${estimatedCost.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Based on current ask price</p>
          </div>
        )}

        {/* Mini Price Chart */}
        {priceHistory.length > 1 && (
          <div className="h-32">
            <p className="text-sm text-muted-foreground mb-2">Price Movement</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={['dataMin - 0.1', 'dataMax + 0.1']}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value}`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingChart;
