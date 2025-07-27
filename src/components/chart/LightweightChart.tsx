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

interface LightweightChartProps {
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
    sma: boolean;
    ema: boolean;
    bollinger: boolean;
    rsi: boolean;
    macd: boolean;
    volume: boolean;
  };
}

export const LightweightChart: React.FC<LightweightChartProps> = ({
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
  const candlestickSeries = useRef<any>(null);
  const volumeSeries = useRef<any>(null);
  const lineSeries = useRef<any>(null);
  const areaSeries = useRef<any>(null);
  
  const [chartState, setChartState] = useState<ChartState>({
    chartType: 'candlestick',
    timeframe: '1h',
    indicators: {
      sma: false,
      ema: false,
      bollinger: false,
      rsi: false,
      macd: false,
      volume: true
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  // Generate demo data for demonstration
  const generateDemoData = useCallback((): { candlestickData: CandlestickData[], volumeData: HistogramData[] } => {
    const candlestickData: CandlestickData[] = [];
    const volumeData: HistogramData[] = [];
    const basePrice = 150;
    const baseVolume = 1000000;
    
    // Generate 100 days of data
    for (let i = 0; i < 100; i++) {
      const time = (Math.floor(Date.now() / 1000) - (100 - i) * 24 * 60 * 60) as UTCTimestamp;
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

    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: theme === 'dark' ? '#1e1e1e' : '#ffffff' },
        textColor: theme === 'dark' ? '#d1d4dc' : '#191919',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#2b2b43' : '#e1e3e6' },
        horzLines: { color: theme === 'dark' ? '#2b2b43' : '#e1e3e6' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#2b2b43' : '#cccccc',
        scaleMargins: {
          top: 0.1,
          bottom: chartState.indicators.volume ? 0.3 : 0.1,
        },
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#2b2b43' : '#cccccc',
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
      width: chartContainerRef.current.clientWidth,
      height: height,
    };

    chart.current = createChart(chartContainerRef.current, chartOptions);

    // Initialize series based on chart type
    if (chartState.chartType === 'candlestick') {
      candlestickSeries.current = (chart.current as any).addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
    } else if (chartState.chartType === 'line') {
      lineSeries.current = (chart.current as any).addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
      });
    } else if (chartState.chartType === 'area') {
      areaSeries.current = (chart.current as any).addAreaSeries({
        lineColor: '#2196F3',
        topColor: 'rgba(33, 150, 243, 0.4)',
        bottomColor: 'rgba(33, 150, 243, 0.1)',
        lineWidth: 2,
      });
    }

    // Add volume series if enabled
    if (chartState.indicators.volume) {
      volumeSeries.current = (chart.current as any).addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });
    }

    // Load data (demo or real)
    const chartData = isDemo ? generateDemoData() : { candlestickData: data, volumeData };
    
    if (candlestickSeries.current && chartData.candlestickData.length > 0) {
      candlestickSeries.current.setData(chartData.candlestickData);
      if (chartData.candlestickData.length > 0) {
        setCurrentPrice(chartData.candlestickData[chartData.candlestickData.length - 1].close);
      }
    }

    if (lineSeries.current && chartData.candlestickData.length > 0) {
      const lineData: LineData[] = chartData.candlestickData.map(item => ({
        time: item.time,
        value: item.close
      }));
      lineSeries.current.setData(lineData);
    }

    if (areaSeries.current && chartData.candlestickData.length > 0) {
      const areaData: LineData[] = chartData.candlestickData.map(item => ({
        time: item.time,
        value: item.close
      }));
      areaSeries.current.setData(areaData);
    }

    if (volumeSeries.current && chartData.volumeData.length > 0) {
      volumeSeries.current.setData(chartData.volumeData);
    }

    // Fit content
    setTimeout(() => {
      chart.current?.timeScale().fitContent();
      setIsLoading(false);
    }, 100);

    // Handle resize
    const handleResize = () => {
      if (chart.current && chartContainerRef.current) {
        chart.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: height,
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
  }, [theme, height, chartState.chartType, chartState.indicators.volume, symbol, isDemo, generateDemoData, data, volumeData]);

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
      chart.current.timeScale().fitContent();
    }
  }, []);

  return (
    <div className={`trading-chart-container ${className}`}>
      {/* Chart Controls */}
      <div className="chart-controls mb-4 flex flex-wrap gap-2 p-4 bg-background border rounded-lg">
        {/* Chart Type */}
        <div className="flex gap-1 border rounded-md p-1">
          {(['candlestick', 'line', 'area'] as const).map((type) => (
            <button
              key={type}
              onClick={() => changeChartType(type)}
              className={`px-3 py-1 text-xs rounded capitalize ${
                chartState.chartType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Timeframe */}
        <div className="flex gap-1 border rounded-md p-1">
          {(['1m', '5m', '15m', '1h', '4h', '1d', '1w'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => changeTimeframe(tf)}
              className={`px-3 py-1 text-xs rounded ${
                chartState.timeframe === tf
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Indicators */}
        <div className="flex gap-1 border rounded-md p-1">
          {(Object.keys(chartState.indicators) as Array<keyof ChartState['indicators']>).map((indicator) => (
            <button
              key={indicator}
              onClick={() => toggleIndicator(indicator)}
              className={`px-3 py-1 text-xs rounded uppercase ${
                chartState.indicators[indicator]
                  ? 'bg-green-600 text-white'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {indicator}
            </button>
          ))}
        </div>

        {/* Chart Actions */}
        <div className="flex gap-1 border rounded-md p-1">
          <button
            onClick={resetChart}
            className="px-3 py-1 text-xs rounded hover:bg-accent hover:text-accent-foreground"
          >
            Reset Zoom
          </button>
        </div>

        {/* Current Price Display */}
        {currentPrice && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-accent rounded-md">
            <span className="text-xs font-medium">{symbol}</span>
            <span className="text-sm font-bold text-green-600">
              ${currentPrice.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        <div
          ref={chartContainerRef}
          className="w-full rounded-lg border overflow-hidden"
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
        <div className="p-3 bg-background border rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Chart Type</div>
          <div className="font-medium capitalize">{chartState.chartType}</div>
        </div>
        
        <div className="p-3 bg-background border rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Timeframe</div>
          <div className="font-medium">{chartState.timeframe}</div>
        </div>
        
        <div className="p-3 bg-background border rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Active Indicators</div>
          <div className="font-medium">
            {Object.entries(chartState.indicators)
              .filter(([, enabled]) => enabled)
              .map(([name]) => name.toUpperCase())
              .join(', ') || 'None'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightweightChart;