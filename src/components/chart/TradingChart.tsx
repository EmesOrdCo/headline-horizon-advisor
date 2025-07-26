import React, { useState, useEffect, useCallback } from 'react';
import { ChartCanvas } from './ChartCanvas';
import { ChartControls } from './ChartControls';
import { useChartData } from '@/hooks/useChartData';
import { 
  ChartState, 
  TimeFrame, 
  TechnicalIndicator, 
  ViewportState, 
  ChartDimensions,
  CrosshairData,
  TooltipData,
  ChartSettings
} from '@/types/chart';
import { calculatePriceRange, calculateTimeRange, calculateVisibleRange } from '@/utils/chartUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface TradingChartProps {
  symbol: string;
  initialTimeFrame?: TimeFrame;
  className?: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  initialTimeFrame = '1h',
  className = ''
}) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(initialTimeFrame);
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const { chartData, isLoading } = useChartData(symbol, timeFrame);

  const [chartState, setChartState] = useState<ChartState>({
    data: chartData,
    viewport: {
      scale: 1,
      translateX: 0,
      translateY: 0,
      startIndex: 0,
      endIndex: 100
    },
    dimensions: {
      width: 800,
      height: 600,
      chartWidth: 720,
      chartHeight: 480,
      marginTop: 20,
      marginBottom: 60,
      marginLeft: 60,
      marginRight: 80
    },
    priceRange: { min: 0, max: 100, range: 100 },
    timeRange: { start: Date.now() - 86400000, end: Date.now() },
    settings: {
      candleWidth: 8,
      candleSpacing: 2,
      gridLines: true,
      showVolume: true,
      theme: 'dark'
    },
    indicators,
    crosshair: {
      x: 0,
      y: 0,
      timestamp: 0,
      price: 0,
      visible: false
    },
    tooltip: {
      x: 0,
      y: 0,
      ohlc: { timestamp: 0, open: 0, high: 0, low: 0, close: 0, volume: 0 },
      visible: false
    },
    timeFrame,
    isLoading,
    isDragging: false,
    isZooming: false
  });

  // Update chart data when it changes
  useEffect(() => {
    setChartState(prev => ({
      ...prev,
      data: chartData,
      isLoading
    }));
  }, [chartData, isLoading]);

  // Recalculate visible range and price range when viewport or data changes
  useEffect(() => {
    if (chartData.data.length === 0) return;

    const visibleRange = calculateVisibleRange(
      chartState.viewport,
      chartState.dimensions.chartWidth,
      chartState.settings.candleWidth,
      chartState.settings.candleSpacing
    );

    const priceRange = calculatePriceRange(
      chartData.data,
      visibleRange.startIndex,
      visibleRange.endIndex
    );

    const timeRange = calculateTimeRange(
      chartData.data,
      visibleRange.startIndex,
      visibleRange.endIndex
    );

    setChartState(prev => ({
      ...prev,
      viewport: {
        ...prev.viewport,
        startIndex: visibleRange.startIndex,
        endIndex: visibleRange.endIndex
      },
      priceRange,
      timeRange
    }));
  }, [chartData.data, chartState.viewport.translateX, chartState.viewport.scale, chartState.dimensions, chartState.settings]);

  const handleViewportChange = useCallback((newViewport: Partial<ViewportState>) => {
    setChartState(prev => ({
      ...prev,
      viewport: { ...prev.viewport, ...newViewport }
    }));
  }, []);

  const handleCrosshairChange = useCallback((crosshair: CrosshairData) => {
    setChartState(prev => ({
      ...prev,
      crosshair
    }));
  }, []);

  const handleTooltipChange = useCallback((tooltip: TooltipData) => {
    setChartState(prev => ({
      ...prev,
      tooltip
    }));
  }, []);

  const handleTimeFrameChange = useCallback((newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
    setChartState(prev => ({
      ...prev,
      timeFrame: newTimeFrame
    }));
  }, []);

  const handleIndicatorToggle = useCallback((indicatorId: string) => {
    setIndicators(prev => 
      prev.map(indicator => 
        indicator.id === indicatorId 
          ? { ...indicator, visible: !indicator.visible }
          : indicator
      )
    );
  }, []);

  const handleIndicatorAdd = useCallback((newIndicator: Omit<TechnicalIndicator, 'id'>) => {
    const id = `${newIndicator.type}-${Date.now()}`;
    setIndicators(prev => [...prev, { ...newIndicator, id }]);
  }, []);

  const handleSettingsChange = useCallback((newSettings: Partial<ChartSettings>) => {
    setChartState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, []);

  // Update indicators in chart state
  useEffect(() => {
    setChartState(prev => ({
      ...prev,
      indicators
    }));
  }, [indicators]);

  const currentPrice = chartData.data.length > 0 ? chartData.data[chartData.data.length - 1].close : 0;
  const prevPrice = chartData.data.length > 1 ? chartData.data[chartData.data.length - 2].close : 0;
  const priceChange = currentPrice - prevPrice;
  const priceChangePercent = prevPrice !== 0 ? (priceChange / prevPrice) * 100 : 0;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading chart data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-2xl font-bold">{symbol}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono">{currentPrice.toFixed(4)}</span>
              <Badge variant={priceChange >= 0 ? "default" : "destructive"} className="text-sm">
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(4)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date(chartData.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ChartControls
          timeFrame={timeFrame}
          onTimeFrameChange={handleTimeFrameChange}
          indicators={indicators}
          onIndicatorToggle={handleIndicatorToggle}
          onIndicatorAdd={handleIndicatorAdd}
          showGrid={chartState.settings.gridLines}
          onGridToggle={(show) => handleSettingsChange({ gridLines: show })}
          showVolume={chartState.settings.showVolume}
          onVolumeToggle={(show) => handleSettingsChange({ showVolume: show })}
          theme={chartState.settings.theme}
          onThemeToggle={() => handleSettingsChange({ 
            theme: chartState.settings.theme === 'dark' ? 'light' : 'dark' 
          })}
        />
        
        <div className="relative h-96 border rounded-lg overflow-hidden">
          <ChartCanvas
            chartState={chartState}
            onViewportChange={handleViewportChange}
            onCrosshairChange={handleCrosshairChange}
            onTooltipChange={handleTooltipChange}
          />
        </div>
        
        {chartData.data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-muted-foreground">No chart data available</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};