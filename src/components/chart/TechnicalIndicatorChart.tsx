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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Volume2, 
  Eye, 
  EyeOff,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface TechnicalIndicatorProps {
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
    support: boolean;
    resistance: boolean;
  };
}

export const TechnicalIndicatorChart: React.FC<TechnicalIndicatorProps> = ({
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
  const sma20Series = useRef<any>(null);
  const sma50Series = useRef<any>(null);
  const ema12Series = useRef<any>(null);
  const ema26Series = useRef<any>(null);
  
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
      volume: true,
      support: false,
      resistance: false
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

  // Generate sophisticated demo data for demonstration
  const generateAdvancedDemoData = useCallback((): { 
    candlestickData: CandlestickData[], 
    volumeData: HistogramData[],
    sma20Data: LineData[],
    sma50Data: LineData[],
    ema12Data: LineData[],
    ema26Data: LineData[]
  } => {
    const candlestickData: CandlestickData[] = [];
    const volumeData: HistogramData[] = [];
    const sma20Data: LineData[] = [];
    const sma50Data: LineData[] = [];
    const ema12Data: LineData[] = [];
    const ema26Data: LineData[] = [];
    
    const basePrice = 150;
    const baseVolume = 1000000;
    const dataPoints = 200; // More data points for better indicators
    
    // Generate price data with realistic trends
    let prices: number[] = [];
    for (let i = 0; i < dataPoints; i++) {
      const trend = Math.sin(i / 20) * 5; // Add trend component
      const volatility = (Math.random() - 0.5) * 8; // Random volatility
      const price = basePrice + trend + volatility + (i * 0.1); // Slight upward drift
      prices.push(price);
    }
    
    // Generate OHLC data
    for (let i = 0; i < dataPoints; i++) {
      const time = (Math.floor(Date.now() / 1000) - (dataPoints - i) * 3600) as UTCTimestamp; // Hourly data
      const basePrice = prices[i];
      const open = i > 0 ? candlestickData[i - 1].close : basePrice;
      const volatilityRange = Math.random() * 4 + 1;
      const high = basePrice + Math.random() * volatilityRange;
      const low = basePrice - Math.random() * volatilityRange;
      const close = basePrice + (Math.random() - 0.5) * 2;
      
      candlestickData.push({
        time,
        open,
        high,
        low,
        close
      });

      // Volume with realistic correlation to price movements
      const priceMove = Math.abs(close - open);
      const volumeMultiplier = 1 + (priceMove / basePrice) * 5; // Higher volume on bigger moves
      const volume = baseVolume * (0.5 + Math.random() * volumeMultiplier);
      
      volumeData.push({
        time,
        value: volume,
        color: close > open ? '#26a69a' : '#ef5350'
      });
    }
    
    // Calculate technical indicators
    // Simple Moving Averages
    for (let i = 19; i < candlestickData.length; i++) {
      // SMA 20
      const sma20Sum = candlestickData.slice(i - 19, i + 1).reduce((sum, candle) => sum + candle.close, 0);
      sma20Data.push({
        time: candlestickData[i].time,
        value: sma20Sum / 20
      });
      
      // SMA 50 (only if we have enough data)
      if (i >= 49) {
        const sma50Sum = candlestickData.slice(i - 49, i + 1).reduce((sum, candle) => sum + candle.close, 0);
        sma50Data.push({
          time: candlestickData[i].time,
          value: sma50Sum / 50
        });
      }
    }
    
    // Exponential Moving Averages
    const ema12Multiplier = 2 / (12 + 1);
    const ema26Multiplier = 2 / (26 + 1);
    let ema12Value = candlestickData[0].close;
    let ema26Value = candlestickData[0].close;
    
    for (let i = 1; i < candlestickData.length; i++) {
      ema12Value = (candlestickData[i].close * ema12Multiplier) + (ema12Value * (1 - ema12Multiplier));
      ema26Value = (candlestickData[i].close * ema26Multiplier) + (ema26Value * (1 - ema26Multiplier));
      
      if (i >= 11) { // Start after sufficient data
        ema12Data.push({
          time: candlestickData[i].time,
          value: ema12Value
        });
      }
      
      if (i >= 25) { // Start after sufficient data
        ema26Data.push({
          time: candlestickData[i].time,
          value: ema26Value
        });
      }
    }
    
    return { candlestickData, volumeData, sma20Data, sma50Data, ema12Data, ema26Data };
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

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
      width: chartContainerRef.current.clientWidth,
      height: height,
    };

    chart.current = createChart(chartContainerRef.current, chartOptions);

    // Initialize main chart series
    if (chartState.chartType === 'candlestick') {
      candlestickSeries.current = (chart.current as any).addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
    } else if (chartState.chartType === 'line') {
      lineSeries.current = (chart.current as any).addLineSeries({
        color: '#3b82f6',
        lineWidth: 2,
      });
    } else if (chartState.chartType === 'area') {
      areaSeries.current = (chart.current as any).addAreaSeries({
        lineColor: '#3b82f6',
        topColor: 'rgba(59, 130, 246, 0.4)',
        bottomColor: 'rgba(59, 130, 246, 0.1)',
        lineWidth: 2,
      });
    }

    // Add volume series if enabled
    if (chartState.indicators.volume) {
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

    // Add technical indicator series
    if (chartState.indicators.sma20) {
      sma20Series.current = (chart.current as any).addLineSeries({
        color: '#f59e0b',
        lineWidth: 2,
        title: 'SMA 20',
      });
    }

    if (chartState.indicators.sma50) {
      sma50Series.current = (chart.current as any).addLineSeries({
        color: '#8b5cf6',
        lineWidth: 2,
        title: 'SMA 50',
      });
    }

    if (chartState.indicators.ema12) {
      ema12Series.current = (chart.current as any).addLineSeries({
        color: '#06d6a0',
        lineWidth: 2,
        title: 'EMA 12',
      });
    }

    if (chartState.indicators.ema26) {
      ema26Series.current = (chart.current as any).addLineSeries({
        color: '#f72585',
        lineWidth: 2,
        title: 'EMA 26',
      });
    }

    // Load data
    const chartData = isDemo ? generateAdvancedDemoData() : { 
      candlestickData: data, 
      volumeData,
      sma20Data: [],
      sma50Data: [],
      ema12Data: [],
      ema26Data: []
    };
    
    // Set main chart data
    if (candlestickSeries.current && chartData.candlestickData.length > 0) {
      candlestickSeries.current.setData(chartData.candlestickData);
      const lastCandle = chartData.candlestickData[chartData.candlestickData.length - 1];
      setCurrentPrice(lastCandle.close);
      if (chartData.candlestickData.length > 1) {
        const prevCandle = chartData.candlestickData[chartData.candlestickData.length - 2];
        const change = lastCandle.close - prevCandle.close;
        const changePercent = (change / prevCandle.close) * 100;
        setPriceChange(change);
        setPriceChangePercent(changePercent);
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

    // Set indicator data
    if (volumeSeries.current && chartData.volumeData.length > 0) {
      volumeSeries.current.setData(chartData.volumeData);
    }

    if (sma20Series.current && chartData.sma20Data.length > 0) {
      sma20Series.current.setData(chartData.sma20Data);
    }

    if (sma50Series.current && chartData.sma50Data.length > 0) {
      sma50Series.current.setData(chartData.sma50Data);
    }

    if (ema12Series.current && chartData.ema12Data.length > 0) {
      ema12Series.current.setData(chartData.ema12Data);
    }

    if (ema26Series.current && chartData.ema26Data.length > 0) {
      ema26Series.current.setData(chartData.ema26Data);
    }

    // Fit content and finish loading
    setTimeout(() => {
      chart.current?.timeScale().fitContent();
      setIsLoading(false);
    }, 200);

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
  }, [theme, height, chartState, symbol, isDemo, generateAdvancedDemoData, data, volumeData]);

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

  const zoomIn = useCallback(() => {
    if (chart.current) {
      const timeScale = chart.current.timeScale();
      const range = timeScale.getVisibleLogicalRange();
      if (range) {
        const center = (range.from + range.to) / 2;
        const newRange = (range.to - range.from) * 0.8; // Zoom in by 20%
        timeScale.setVisibleLogicalRange({
          from: center - newRange / 2,
          to: center + newRange / 2
        });
      }
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (chart.current) {
      const timeScale = chart.current.timeScale();
      const range = timeScale.getVisibleLogicalRange();
      if (range) {
        const center = (range.from + range.to) / 2;
        const newRange = (range.to - range.from) * 1.25; // Zoom out by 25%
        timeScale.setVisibleLogicalRange({
          from: center - newRange / 2,
          to: center + newRange / 2
        });
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

  const activeIndicatorsList = Object.entries(chartState.indicators)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name.toUpperCase());

  return (
    <div className={`trading-chart-container ${className}`}>
      {/* Enhanced Chart Controls */}
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

        {/* Technical Indicators */}
        <div className="flex gap-1 border border-slate-600 rounded-md p-1">
          <Button
            onClick={() => toggleIndicator('sma20')}
            className={`px-2 py-1 text-xs rounded ${
              chartState.indicators.sma20
                ? 'bg-yellow-600 text-white'
                : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            SMA20
          </Button>
          <Button
            onClick={() => toggleIndicator('sma50')}
            className={`px-2 py-1 text-xs rounded ${
              chartState.indicators.sma50
                ? 'bg-purple-600 text-white'
                : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            SMA50
          </Button>
          <Button
            onClick={() => toggleIndicator('ema12')}
            className={`px-2 py-1 text-xs rounded ${
              chartState.indicators.ema12
                ? 'bg-emerald-600 text-white'
                : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            EMA12
          </Button>
          <Button
            onClick={() => toggleIndicator('ema26')}
            className={`px-2 py-1 text-xs rounded ${
              chartState.indicators.ema26
                ? 'bg-pink-600 text-white'
                : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            EMA26
          </Button>
        </div>

        {/* Volume & Other Indicators */}
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
          <Button
            onClick={() => toggleIndicator('bollinger')}
            className={`px-2 py-1 text-xs rounded ${
              chartState.indicators.bollinger
                ? 'bg-orange-600 text-white'
                : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            BB
          </Button>
          <Button
            onClick={() => toggleIndicator('rsi')}
            className={`px-2 py-1 text-xs rounded ${
              chartState.indicators.rsi
                ? 'bg-indigo-600 text-white'
                : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            RSI
          </Button>
        </div>

        {/* Chart Actions */}
        <div className="flex gap-1 border border-slate-600 rounded-md p-1">
          <Button
            onClick={zoomIn}
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-xs rounded text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <ZoomIn className="w-3 h-3" />
          </Button>
          <Button
            onClick={zoomOut}
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-xs rounded text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <ZoomOut className="w-3 h-3" />
          </Button>
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
              <span className="text-white">Loading advanced chart...</span>
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

      {/* Enhanced Chart Info */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Chart Type</div>
          <div className="font-medium text-white capitalize">{chartState.chartType}</div>
        </div>
        
        <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Timeframe</div>
          <div className="font-medium text-white">{chartState.timeframe}</div>
        </div>
        
        <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Active Indicators</div>
          <div className="font-medium text-white">
            {activeIndicatorsList.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {activeIndicatorsList.slice(0, 3).map((indicator) => (
                  <Badge key={indicator} variant="secondary" className="text-xs">
                    {indicator}
                  </Badge>
                ))}
                {activeIndicatorsList.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{activeIndicatorsList.length - 3}
                  </Badge>
                )}
              </div>
            ) : (
              'None'
            )}
          </div>
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

export default TechnicalIndicatorChart;