import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  createChart, 
  ColorType, 
  CrosshairMode,
  CandlestickData,
  HistogramData,
  LineData,
  IChartApi,
  UTCTimestamp
} from 'lightweight-charts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Volume2, 
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useChartData } from '@/hooks/useChartData';

interface SimpleLightweightChartProps {
  symbol: string;
  theme?: 'dark' | 'light';
  width?: number;
  height?: number;
  data?: CandlestickData[];
  volumeData?: HistogramData[];
  className?: string;
  isDemo?: boolean;
}

interface ChartState {
  chartType: 'candlestick' | 'line' | 'area';
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  indicators: {
    sma20: boolean;
    sma50: boolean;
    ema12: boolean;
    ema26: boolean;
    bollinger: boolean;
    rsi: boolean;
    macd: boolean;
    volume: boolean;
  };
}

export const SimpleLightweightChart: React.FC<SimpleLightweightChartProps> = ({
  symbol,
  theme = 'dark',
  width = 800,
  height = 600,
  data = [],
  volumeData = [],
  className = '',
  isDemo = false
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const mainSeries = useRef<any>(null);
  const volumeSeries = useRef<any>(null);
  const lastUpdateTime = useRef<number>(0);
  
  const [chartState, setChartState] = useState<ChartState>({
    chartType: 'candlestick',
    timeframe: '1h',
    indicators: {
      sma20: false,
      sma50: false,
      ema12: false,
      ema26: false,
      bollinger: false,
      rsi: false,
      macd: false,
      volume: true
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

  // Use chart data hook for live data
  const chartDataHook = useChartData({
    symbol,
    timeframe: chartState.timeframe,
    isDemo
  });

  // Generate demo data fallback
  const generateDemoData = useCallback((): { candlestickData: CandlestickData[], volumeData: HistogramData[] } => {
    const candlestickData: CandlestickData[] = [];
    const volumeData: HistogramData[] = [];
    const basePrice = 150;
    const baseVolume = 1000000;
    
    for (let i = 0; i < 100; i++) {
      const time = (Math.floor(Date.now() / 1000) - (100 - i) * 3600) as UTCTimestamp;
      const randomChange = (Math.random() - 0.5) * 10;
      const open = basePrice + randomChange;
      const close = open + (Math.random() - 0.5) * 5;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      
      candlestickData.push({
        time,
        open,
        high,
        low,
        close
      });

      volumeData.push({
        time,
        value: baseVolume + (Math.random() - 0.5) * baseVolume * 0.5,
        color: close > open ? '#26a69a' : '#ef5350'
      });
    }
    
    return { candlestickData, volumeData };
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up any existing chart first
    if (chart.current) {
      try {
        chart.current.remove();
        chart.current = null;
      } catch (error) {
        console.error('Error removing existing chart:', error);
      }
    }

    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: theme === 'dark' ? '#0f172a' : '#ffffff' },
        textColor: theme === 'dark' ? '#e2e8f0' : '#1e293b',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' },
        horzLines: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
        scaleMargins: {
          top: 0.1,
          bottom: chartState.indicators.volume ? 0.25 : 0.1,
        },
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      width: chartContainerRef.current.clientWidth || 800,
      height: height,
    };

    try {
      chart.current = createChart(chartContainerRef.current, chartOptions);
    } catch (error) {
      console.error('Error creating chart:', error);
      setIsLoading(false);
      return;
    }

    // Try different API approaches
    try {
      // Initialize main chart series using the simplest approach
      if (chartState.chartType === 'candlestick') {
        // Try the direct method first
        if (typeof (chart.current as any).addCandlestickSeries === 'function') {
          mainSeries.current = (chart.current as any).addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
          });
        } else {
          console.error('addCandlestickSeries method not found');
          // Fallback - just show loading
          setIsLoading(false);
          return;
        }
      } else if (chartState.chartType === 'line') {
        if (typeof (chart.current as any).addLineSeries === 'function') {
          mainSeries.current = (chart.current as any).addLineSeries({
            color: '#3b82f6',
            lineWidth: 2,
          });
        }
      } else if (chartState.chartType === 'area') {
        if (typeof (chart.current as any).addAreaSeries === 'function') {
          mainSeries.current = (chart.current as any).addAreaSeries({
            lineColor: '#3b82f6',
            topColor: 'rgba(59, 130, 246, 0.4)',
            bottomColor: 'rgba(59, 130, 246, 0.1)',
            lineWidth: 2,
          });
        }
      }

      // Add volume series if enabled
      if (chartState.indicators.volume) {
        if (typeof (chart.current as any).addHistogramSeries === 'function') {
          volumeSeries.current = (chart.current as any).addHistogramSeries({
            color: '#64748b',
            priceFormat: {
              type: 'volume',
            },
            priceScaleId: 'volume',
            scaleMargins: {
              top: 0.75,
              bottom: 0,
            },
          });
        }
      }

      // Load data from hook or fallback
      const chartData = chartDataHook?.candlestickData?.length > 0 
        ? { 
            candlestickData: chartDataHook.candlestickData, 
            volumeData: chartDataHook.volumeData 
          }
        : isDemo 
          ? generateDemoData() 
          : { candlestickData: data, volumeData };
      
      // Set main chart data
      if (mainSeries.current && chartData.candlestickData.length > 0) {
        if (chartState.chartType === 'candlestick') {
          mainSeries.current.setData(chartData.candlestickData);
          const lastCandle = chartData.candlestickData[chartData.candlestickData.length - 1];
          const hookPrice = chartDataHook?.currentPrice;
          setCurrentPrice(hookPrice || lastCandle.close);
          
          if (chartDataHook?.priceChange !== undefined && chartDataHook?.priceChangePercent !== undefined) {
            setPriceChange(chartDataHook.priceChange);
            setPriceChangePercent(chartDataHook.priceChangePercent);
          } else if (chartData.candlestickData.length > 1) {
            const prevCandle = chartData.candlestickData[chartData.candlestickData.length - 2];
            const change = lastCandle.close - prevCandle.close;
            const changePercent = (change / prevCandle.close) * 100;
            setPriceChange(change);
            setPriceChangePercent(changePercent);
          }
        } else {
          // For line and area charts, convert to line data
          const lineData: LineData[] = chartData.candlestickData.map(item => ({
            time: item.time,
            value: item.close
          }));
          mainSeries.current.setData(lineData);
          const hookPrice = chartDataHook?.currentPrice;
          setCurrentPrice(hookPrice || lineData[lineData.length - 1]?.value || 0);
        }
      }

      // Set volume data
      if (volumeSeries.current && chartData.volumeData.length > 0) {
        volumeSeries.current.setData(chartData.volumeData);
      }

    } catch (error) {
      console.error('Error setting up chart:', error);
      setIsLoading(false);
      return;
    }

    // Fit content and finish loading
    setTimeout(() => {
      try {
        chart.current?.timeScale().fitContent();
        setIsLoading(chartDataHook?.isLoading ?? false);
      } catch (error) {
        console.error('Error fitting content:', error);
        setIsLoading(false);
      }
    }, 200);

    // Handle resize
    const handleResize = () => {
      if (chart.current && chartContainerRef.current) {
        try {
          chart.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: height,
          });
        } catch (error) {
          console.error('Error resizing chart:', error);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart.current) {
        try {
          chart.current.remove();
          chart.current = null;
        } catch (error) {
          console.error('Error removing chart:', error);
        }
      }
    };
  }, [theme, height, chartState, symbol, isDemo, generateDemoData, data, volumeData]);

  // Chart controls
  const changeChartType = useCallback((type: ChartState['chartType']) => {
    setChartState(prev => ({ ...prev, chartType: type }));
  }, []);

  const changeTimeframe = useCallback((timeframe: ChartState['timeframe']) => {
    setChartState(prev => ({ ...prev, timeframe }));
  }, []);

  const toggleIndicator = useCallback((indicator: keyof ChartState['indicators']) => {
    setChartState(prev => ({
      ...prev,
      indicators: {
        ...prev.indicators,
        [indicator]: !prev.indicators[indicator]
      }
    }));
  }, []);

  const resetChart = useCallback(() => {
    if (chart.current) {
      try {
        chart.current.timeScale().fitContent();
      } catch (error) {
        console.error('Error resetting chart:', error);
      }
    }
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className={`trading-chart-container ${className}`}>
      {/* Chart Controls */}
      <div className="chart-controls mb-4 flex flex-wrap gap-3 p-4 bg-slate-800 border border-slate-700 rounded-lg">
        {/* Chart Type */}
        <div className="flex gap-1 border border-slate-600 rounded-md p-1">
          {(['candlestick', 'line', 'area'] as const).map((type) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              onClick={() => changeChartType(type)}
              className={`px-3 py-1 text-xs rounded capitalize ${
                chartState.chartType === type
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Timeframe */}
        <div className="flex gap-1 border border-slate-600 rounded-md p-1">
          {(['1m', '5m', '15m', '1h', '4h', '1d', '1w'] as const).map((tf) => (
            <Button
              key={tf}
              variant="ghost"
              size="sm"
              onClick={() => changeTimeframe(tf)}
              className={`px-2 py-1 text-xs rounded ${
                chartState.timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tf}
            </Button>
          ))}
        </div>

        {/* Volume Toggle */}
        <div className="flex gap-1 border border-slate-600 rounded-md p-1">
          <Button
            onClick={() => toggleIndicator('volume')}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
              chartState.indicators.volume
                ? 'bg-green-600 text-white'
                : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Volume2 className="w-3 h-3" />
            Volume
          </Button>
        </div>

        {/* Chart Actions */}
        <div className="flex gap-1 border border-slate-600 rounded-md p-1">
          <Button
            onClick={resetChart}
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-xs rounded text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>

        {/* Current Price Display */}
        {currentPrice && (
          <div className="ml-auto flex items-center gap-3 px-4 py-2 bg-slate-700 rounded-md">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300">{symbol}</span>
              <span className="text-lg font-bold text-white">
                {formatPrice(currentPrice)}
              </span>
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              priceChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp className={`w-4 h-4 ${priceChange < 0 ? 'rotate-180' : ''}`} />
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 z-10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-white">Loading TradingView chart...</span>
            </div>
          </div>
        )}
        
        <div
          ref={chartContainerRef}
          className="w-full rounded-lg border border-slate-700 overflow-hidden bg-slate-900"
          style={{ height: `${height}px` }}
        />
        
        {isDemo && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium">
            DEMO DATA
          </div>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Chart Type</div>
          <div className="font-medium text-white capitalize">{chartState.chartType}</div>
        </div>
        
        <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Timeframe</div>
          <div className="font-medium text-white">{chartState.timeframe}</div>
        </div>
        
        <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Data Source</div>
          <div className="font-medium text-white flex items-center gap-2">
            {isDemo ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Demo Mode
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Data
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLightweightChart;