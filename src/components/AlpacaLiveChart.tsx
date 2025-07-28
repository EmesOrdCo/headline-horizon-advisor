import React, { useState, useEffect, useCallback } from 'react';
import { ChartCanvas } from '@/components/chart/ChartCanvas';
import { ChartControls } from '@/components/chart/ChartControls';
import { useAlpacaHistoricalData } from '@/hooks/useAlpacaHistoricalData';
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
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AlpacaLiveChart: React.FC<{ symbol?: string }> = ({ symbol = 'AAPL' }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1m');
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  
  // Get timeframe in Alpaca format
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

  const { chartData, isLoading } = useAlpacaHistoricalData(symbol, getAlpacaTimeframe(timeFrame));

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
      marginLeft: 80,
      marginRight: 20
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
    crosshair: { x: 0, y: 0, timestamp: 0, price: 0, visible: false },
    tooltip: { x: 0, y: 0, ohlc: { timestamp: 0, open: 0, high: 0, low: 0, close: 0, volume: 0 }, visible: false },
    timeFrame,
    isLoading,
    isDragging: false,
    isZooming: false
  });

  // Update chart state when data changes
  useEffect(() => {
    setChartState(prev => ({
      ...prev,
      data: chartData,
      isLoading,
      timeFrame
    }));
  }, [chartData, isLoading, timeFrame]);

  // Recalculate ranges when data or viewport changes
  useEffect(() => {
    if (chartData.data.length === 0) return;

    const { startIndex, endIndex } = calculateVisibleRange(
      chartState.viewport,
      chartState.dimensions.chartWidth,
      chartState.settings.candleWidth,
      chartState.settings.candleSpacing
    );

    const priceRange = calculatePriceRange(chartData.data, startIndex, endIndex);
    const timeRange = calculateTimeRange(chartData.data, startIndex, endIndex);

    setChartState(prev => ({
      ...prev,
      viewport: { ...prev.viewport, startIndex, endIndex },
      priceRange,
      timeRange
    }));
  }, [chartData, chartState.viewport.scale, chartState.viewport.translateX, chartState.dimensions, chartState.settings]);

  // Calculate price info
  const currentPrice = chartData.data.length > 0 
    ? chartData.data[chartData.data.length - 1].close
    : 0;
    
  const priceChange = chartData.data.length > 1 
    ? chartData.data[chartData.data.length - 1].close - chartData.data[chartData.data.length - 2].close
    : 0;
    
  const priceChangePercent = chartData.data.length > 1 
    ? (priceChange / chartData.data[chartData.data.length - 2].close) * 100
    : 0;

  // Event handlers
  const handleViewportChange = useCallback((viewport: ViewportState) => {
    setChartState(prev => ({ ...prev, viewport }));
  }, []);

  const handleCrosshairChange = useCallback((crosshair: CrosshairData) => {
    setChartState(prev => ({ ...prev, crosshair }));
  }, []);

  const handleTooltipChange = useCallback((tooltip: TooltipData) => {
    setChartState(prev => ({ ...prev, tooltip }));
  }, []);

  const handleTimeFrameChange = useCallback((newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
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

  const handleIndicatorAdd = useCallback((indicator: Omit<TechnicalIndicator, 'id'>) => {
    const newIndicator: TechnicalIndicator = {
      ...indicator,
      id: `${indicator.type}-${Date.now()}`
    };
    setIndicators(prev => [...prev, newIndicator]);
  }, []);

  const handleSettingsChange = useCallback((newSettings: Partial<ChartSettings>) => {
    setChartState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, []);

  // Place buy/sell order via Alpaca
  const placeOrder = async (side: 'buy' | 'sell') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to place orders');
        return;
      }

      const { data, error } = await supabase.functions.invoke('alpaca-place-order', {
        body: {
          symbol,
          qty: 1,
          side,
          type: 'market',
          time_in_force: 'gtc'
        }
      });

      if (error) throw error;

      toast.success(`${side.toUpperCase()} order placed via Alpaca for ${symbol}`);
    } catch (error: any) {
      console.error('Error placing Alpaca order:', error);
      toast.error(`Failed to place ${side} order: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading Alpaca chart data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="flex items-center space-x-2">
                <span>{symbol}</span>
                <Badge variant="outline">Alpaca</Badge>
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
            showGrid={chartState.settings.gridLines}
            onGridToggle={(show) => handleSettingsChange({ gridLines: show })}
            showVolume={chartState.settings.showVolume}
            onVolumeToggle={(show) => handleSettingsChange({ showVolume: show })}
            theme={chartState.settings.theme}
            onThemeToggle={() => handleSettingsChange({ theme: chartState.settings.theme === 'dark' ? 'light' : 'dark' })}
          />

          <div className="h-96">
            <ChartCanvas
              chartState={chartState}
              onViewportChange={handleViewportChange}
              onCrosshairChange={handleCrosshairChange}
              onTooltipChange={handleTooltipChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trading Controls */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-center text-white">Alpaca Paper Trading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-6">
            <Button
              onClick={() => placeOrder('buy')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
            >
              🟢 BUY {symbol}
            </Button>
            <Button
              onClick={() => placeOrder('sell')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
            >
              🔴 SELL {symbol}
            </Button>
          </div>
          <p className="text-center text-sm text-slate-400 mt-3">
            Market orders • 1 share • Paper Trading • Alpaca Historical Data
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlpacaLiveChart;