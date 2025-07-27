import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  createChart, 
  ColorType, 
  CrosshairMode,
  CandlestickData,
  HistogramData,
  LineData,
  IChartApi,
  UTCTimestamp,
  ISeriesApi
} from 'lightweight-charts';
import { useChartData } from '@/hooks/useChartData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Volume2, 
  BarChart3, 
  LineChart,
  Activity,
  Target,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface AdvancedTradingChartProps {
  symbol: string;
  theme?: 'dark' | 'light';
  height?: number;
  className?: string;
}

type ChartType = 'candlestick' | 'line' | 'area' | 'bars';
type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

interface TechnicalIndicator {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
  series?: ISeriesApi<any>;
}

export const AdvancedTradingChart: React.FC<AdvancedTradingChartProps> = ({
  symbol,
  theme = 'dark',
  height = 600,
  className
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candlestickSeries = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeries = useRef<ISeriesApi<'Histogram'> | null>(null);
  const lineSeries = useRef<ISeriesApi<'Line'> | null>(null);
  const areaSeries = useRef<ISeriesApi<'Area'> | null>(null);
  
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1h');
  const [showVolume, setShowVolume] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([
    { id: 'sma20', name: 'SMA 20', enabled: false, color: '#2196F3' },
    { id: 'sma50', name: 'SMA 50', enabled: false, color: '#FF9800' },
    { id: 'ema20', name: 'EMA 20', enabled: false, color: '#9C27B0' },
    { id: 'bb', name: 'Bollinger Bands', enabled: false, color: '#4CAF50' }
  ]);

  const { 
    candlestickData, 
    volumeData, 
    currentPrice, 
    priceChange, 
    priceChangePercent, 
    isLoading 
  } = useChartData({ 
    symbol, 
    timeframe: timeFrame 
  });

  // TradingView color schemes
  const chartColors = {
    dark: {
      background: '#131722',
      grid: '#1e222d',
      text: '#d1d4dc',
      border: '#2a2e39',
      upColor: '#26a69a',
      downColor: '#ef5350',
      volumeUp: '#26a69a4d',
      volumeDown: '#ef53504d'
    },
    light: {
      background: '#ffffff',
      grid: '#f0f3fa',
      text: '#131722',
      border: '#e0e3eb',
      upColor: '#089981',
      downColor: '#f23645',
      volumeUp: '#0899814d',
      volumeDown: '#f236454d'
    }
  };

  const colors = chartColors[theme];

  // Calculate technical indicators
  const calculateSMA = (data: CandlestickData[], period: number): LineData[] => {
    const smaData: LineData[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, curr) => acc + curr.close, 0);
      const avg = sum / period;
      smaData.push({
        time: data[i].time,
        value: avg
      });
    }
    return smaData;
  };

  const calculateEMA = (data: CandlestickData[], period: number): LineData[] => {
    if (data.length === 0) return [];
    
    const emaData: LineData[] = [];
    const multiplier = 2 / (period + 1);
    let ema = data[0].close;
    
    emaData.push({
      time: data[0].time,
      value: ema
    });
    
    for (let i = 1; i < data.length; i++) {
      ema = (data[i].close - ema) * multiplier + ema;
      emaData.push({
        time: data[i].time,
        value: ema
      });
    }
    
    return emaData;
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, sans-serif',
      },
      grid: {
        vertLines: { 
          color: colors.grid,
          style: 0 as any,
          visible: true,
        },
        horzLines: { 
          color: colors.grid,
          style: 0 as any,
          visible: true,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: colors.text,
          width: 1 as any,
          style: 3 as any,
          labelBackgroundColor: colors.border,
        },
        horzLine: {
          color: colors.text,
          width: 1 as any,
          style: 3 as any,
          labelBackgroundColor: colors.border,
        },
      },
      rightPriceScale: {
        borderColor: colors.border,
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.25 : 0.1,
        },
        drawTicks: false,
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 8,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      kineticScroll: {
        touch: true,
        mouse: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 100 : height,
    };

    try {
      chart.current = createChart(chartContainerRef.current, chartOptions);
      
      // Verify chart was created successfully
      if (!chart.current) {
        console.error('Failed to create chart');
        return;
      }

      console.log('Chart created successfully', chart.current);
    } catch (error) {
      console.error('Error creating chart:', error);
      return;
    }

    // Handle resize
    const handleResize = () => {
      if (chart.current && chartContainerRef.current) {
        chart.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 100 : height,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart.current) {
        chart.current.remove();
        chart.current = null;
      }
    };
  }, [theme, height, showVolume, isFullscreen, colors]);

  // Update chart data
  useEffect(() => {
    if (!chart.current || candlestickData.length === 0) {
      console.log('Chart not ready or no data:', { 
        chartExists: !!chart.current, 
        dataLength: candlestickData.length 
      });
      return;
    }

    console.log('Updating chart with data:', candlestickData.length, 'candles');

    try {
      // Clear existing series
      if (candlestickSeries.current) {
        chart.current.removeSeries(candlestickSeries.current);
        candlestickSeries.current = null;
      }
      if (lineSeries.current) {
        chart.current.removeSeries(lineSeries.current);
        lineSeries.current = null;
      }
      if (areaSeries.current) {
        chart.current.removeSeries(areaSeries.current);
        areaSeries.current = null;
      }
      if (volumeSeries.current) {
        chart.current.removeSeries(volumeSeries.current);
        volumeSeries.current = null;
      }

      // Create main price series based on chart type
      if (chartType === 'candlestick') {
        candlestickSeries.current = (chart.current as any).addCandlestickSeries({
          upColor: colors.upColor,
          downColor: colors.downColor,
          borderVisible: false,
          wickUpColor: colors.upColor,
          wickDownColor: colors.downColor,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
        candlestickSeries.current.setData(candlestickData);
      } else if (chartType === 'line') {
        lineSeries.current = (chart.current as any).addLineSeries({
          color: colors.upColor,
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
        const lineData: LineData[] = candlestickData.map(item => ({
          time: item.time,
          value: item.close
        }));
        lineSeries.current.setData(lineData);
      } else if (chartType === 'area') {
        areaSeries.current = (chart.current as any).addAreaSeries({
          lineColor: colors.upColor,
          topColor: `${colors.upColor}40`,
          bottomColor: `${colors.upColor}00`,
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
        const areaData: LineData[] = candlestickData.map(item => ({
          time: item.time,
          value: item.close
        }));
        areaSeries.current.setData(areaData);
      }

      // Add volume series if enabled
      if (showVolume && volumeData.length > 0) {
        volumeSeries.current = (chart.current as any).addHistogramSeries({
          color: colors.volumeUp,
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: 'volume',
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });
        volumeSeries.current.setData(volumeData);
      }

      // Add technical indicators
      indicators.forEach(indicator => {
        if (indicator.enabled) {
          if (indicator.id === 'sma20') {
            const smaData = calculateSMA(candlestickData, 20);
            if (smaData.length > 0) {
              const smaSeries = (chart.current as any).addLineSeries({
                color: indicator.color,
                lineWidth: 1,
                title: indicator.name,
              });
              smaSeries.setData(smaData);
              indicator.series = smaSeries;
            }
          } else if (indicator.id === 'sma50') {
            const smaData = calculateSMA(candlestickData, 50);
            if (smaData.length > 0) {
              const smaSeries = (chart.current as any).addLineSeries({
                color: indicator.color,
                lineWidth: 1,
                title: indicator.name,
              });
              smaSeries.setData(smaData);
              indicator.series = smaSeries;
            }
          } else if (indicator.id === 'ema20') {
            const emaData = calculateEMA(candlestickData, 20);
            if (emaData.length > 0) {
              const emaSeries = (chart.current as any).addLineSeries({
                color: indicator.color,
                lineWidth: 1,
                title: indicator.name,
              });
              emaSeries.setData(emaData);
              indicator.series = emaSeries;
            }
          }
        }
      });

      // Fit content
      setTimeout(() => {
        chart.current?.timeScale().fitContent();
      }, 100);

    } catch (error) {
      console.error('Error updating chart data:', error);
    }

  }, [candlestickData, volumeData, chartType, showVolume, indicators, colors]);

  const toggleIndicator = useCallback((indicatorId: string) => {
    setIndicators(prev => prev.map(indicator => 
      indicator.id === indicatorId 
        ? { ...indicator, enabled: !indicator.enabled }
        : indicator
    ));
  }, []);

  const timeFrames: { value: TimeFrame; label: string }[] = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '30m', label: '30m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1M', label: '1M' },
  ];

  const chartTypes: { value: ChartType; label: string; icon: React.ReactNode }[] = [
    { value: 'candlestick', label: 'Candles', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'line', label: 'Line', icon: <LineChart className="w-4 h-4" /> },
    { value: 'area', label: 'Area', icon: <Activity className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)} style={{ backgroundColor: colors.background }}>
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold" style={{ color: colors.text }}>
            {symbol}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono" style={{ color: colors.text }}>
              ${currentPrice?.toFixed(2) || '0.00'}
            </span>
            <Badge 
              variant={priceChange >= 0 ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {priceChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center gap-4 p-4 border-b" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
        {/* Chart Type */}
        <div className="flex items-center gap-1 border rounded-md p-1" style={{ borderColor: colors.border }}>
          {chartTypes.map((type) => (
            <Button
              key={type.value}
              variant="ghost"
              size="sm"
              onClick={() => setChartType(type.value)}
              className={cn(
                "flex items-center gap-1 h-8 px-2",
                chartType === type.value && "bg-primary text-primary-foreground"
              )}
            >
              {type.icon}
              <span className="text-xs">{type.label}</span>
            </Button>
          ))}
        </div>

        {/* Timeframe */}
        <div className="flex items-center gap-1 border rounded-md p-1" style={{ borderColor: colors.border }}>
          {timeFrames.map((tf) => (
            <Button
              key={tf.value}
              variant="ghost"
              size="sm"
              onClick={() => setTimeFrame(tf.value)}
              className={cn(
                "h-8 px-2 text-xs",
                timeFrame === tf.value && "bg-primary text-primary-foreground"
              )}
            >
              {tf.label}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Volume Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowVolume(!showVolume)}
          className={cn(
            "flex items-center gap-1 h-8 px-2",
            showVolume && "bg-primary text-primary-foreground"
          )}
        >
          <Volume2 className="w-4 h-4" />
          <span className="text-xs">Volume</span>
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Indicators */}
        <div className="flex items-center gap-1">
          {indicators.map((indicator) => (
            <Button
              key={indicator.id}
              variant="ghost"
              size="sm"
              onClick={() => toggleIndicator(indicator.id)}
              className={cn(
                "h-8 px-2 text-xs",
                indicator.enabled && "bg-primary text-primary-foreground"
              )}
            >
              {indicator.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        <div
          ref={chartContainerRef}
          className="w-full"
          style={{ 
            height: isFullscreen ? window.innerHeight - 200 : height,
            backgroundColor: colors.background 
          }}
        />
      </div>
    </Card>
  );
};