import React, { useState, useEffect } from 'react';
import { ChartControls } from './ChartControls';
import { useAlpacaHistoricalData } from '@/hooks/useAlpacaHistoricalData';
import { LiveTradingViewChart } from './LiveTradingViewChart';
import { TimeFrame, TechnicalIndicator } from '@/types/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface AlpacaTradingChartProps {
  symbol: string;
  initialTimeFrame?: TimeFrame;
  className?: string;
}

export const AlpacaTradingChart: React.FC<AlpacaTradingChartProps> = ({
  symbol,
  initialTimeFrame = '1m',
  className = ''
}) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(initialTimeFrame);
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Map timeframe to Alpaca format
  const getAlpacaTimeframe = (tf: TimeFrame): string => {
    const mapping: Record<TimeFrame, string> = {
      '1m': '1Min',
      '5m': '5Min',
      '15m': '15Min',
      '1h': '1Hour',
      '4h': '4Hour',
      '1d': '1Day',
      '1w': '1Week'
    };
    return mapping[tf] || '1Min';
  };

  const { chartData, isLoading, currentPrice, error } = useAlpacaHistoricalData(symbol, getAlpacaTimeframe(timeFrame));

  // Calculate price change
  const priceChange = chartData.data.length > 1 
    ? chartData.data[chartData.data.length - 1].close - chartData.data[chartData.data.length - 2].close
    : 0;
    
  const priceChangePercent = chartData.data.length > 1 
    ? (priceChange / chartData.data[chartData.data.length - 2].close) * 100
    : 0;

  // Event handlers
  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
  };

  const handleIndicatorToggle = (indicatorId: string) => {
    setIndicators(prev => 
      prev.map(indicator => 
        indicator.id === indicatorId 
          ? { ...indicator, visible: !indicator.visible }
          : indicator
      )
    );
  };

  const handleIndicatorAdd = (indicator: Omit<TechnicalIndicator, 'id'>) => {
    const newIndicator: TechnicalIndicator = {
      ...indicator,
      id: `${indicator.type}-${Date.now()}`
    };
    setIndicators(prev => [...prev, newIndicator]);
  };

  const handleGridToggle = (show: boolean) => {
    setShowGrid(show);
  };

  const handleVolumeToggle = (show: boolean) => {
    setShowVolume(show);
  };

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading Alpaca chart data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 mb-2">Failed to load chart data</div>
            <div className="text-sm text-slate-400">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="flex items-center space-x-2">
              <span>{symbol}</span>
              <Badge variant="outline" className="bg-blue-600 text-white border-blue-600">
                Alpaca
              </Badge>
            </CardTitle>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${currentPrice.toFixed(2)}
              </div>
              <div className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ChartControls
          timeFrame={timeFrame}
          onTimeFrameChange={handleTimeFrameChange}
          indicators={indicators}
          onIndicatorToggle={handleIndicatorToggle}
          onIndicatorAdd={handleIndicatorAdd}
          showGrid={showGrid}
          onGridToggle={handleGridToggle}
          showVolume={showVolume}
          onVolumeToggle={handleVolumeToggle}
          theme={theme}
          onThemeToggle={handleThemeToggle}
        />

        <div className="h-96">
          <LiveTradingViewChart
            symbol={symbol}
            theme={theme}
            height={400}
            isDemo={false}
            className="w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};