import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  createChart, 
  ColorType, 
  CrosshairMode,
  CandlestickData,
  HistogramData,
  LineData,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  Time
} from 'lightweight-charts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Volume2, 
  RotateCcw,
  Activity,
  Pause,
  Play
} from 'lucide-react';
import { useChartData } from '@/hooks/useChartData';

interface LiveTradingViewChartProps {
  symbol: string;
  theme?: 'dark' | 'light';
  width?: number;
  height?: number;
  isDemo?: boolean;
  className?: string;
}

interface ChartState {
  chartType: 'candlestick' | 'line' | 'area';
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  showVolume: boolean;
  autoScroll: boolean;
}

export const LiveTradingViewChart: React.FC<LiveTradingViewChartProps> = ({
  symbol,
  theme = 'dark',
  width = 800,
  height = 600,
  isDemo = false,
  className = ''
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const mainSeries = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | ISeriesApi<'Area'> | null>(null);
  const volumeSeries = useRef<ISeriesApi<'Histogram'> | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const isInitialized = useRef(false);
  
  const [chartState, setChartState] = useState<ChartState>({
    chartType: 'candlestick',
    timeframe: '1h',
    showVolume: true,
    autoScroll: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

  // Use chart data hook for live data
  const {
    candlestickData,
    volumeData,
    currentPrice: hookPrice,
    priceChange: hookChange,
    priceChangePercent: hookChangePercent,
    isLoading: dataLoading,
    isConnected
  } = useChartData({
    symbol,
    timeframe: chartState.timeframe,
    isDemo
  });

  // Initialize chart following TradingView documentation
  const initializeChart = useCallback(() => {
    if (!chartContainerRef.current || isInitialized.current) return;

    console.log('🚀 Initializing TradingView Lightweight Chart for', symbol);

    // Chart configuration following TradingView best practices
    const chartOptions = {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: theme === 'dark' ? '#0f172a' : '#ffffff' 
        },
        textColor: theme === 'dark' ? '#e2e8f0' : '#1e293b',
        fontSize: 12,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      grid: {
        vertLines: { 
          color: theme === 'dark' ? '#1e293b' : '#f1f5f9',
          style: 1,
          visible: true
        },
        horzLines: { 
          color: theme === 'dark' ? '#1e293b' : '#f1f5f9',
          style: 1,
          visible: true
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: theme === 'dark' ? '#64748b' : '#94a3b8',
          width: 1 as any,
          style: 3 as any,
          visible: true,
          labelVisible: true
        },
        horzLine: {
          color: theme === 'dark' ? '#64748b' : '#94a3b8',
          width: 1 as any,
          style: 3 as any,
          visible: true,
          labelVisible: true
        }
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
        scaleMargins: {
          top: 0.1,
          bottom: chartState.showVolume ? 0.25 : 0.1,
        },
        visible: true
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 8,
        minBarSpacing: 2,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: true
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
      kineticScroll: {
        mouse: false,
        touch: true
      },
      trackingMode: {
        exitMode: 1
      },
      // Minimum chart size as per TradingView best practices
      width: Math.max(width, 500),
      height: Math.max(height, 500),
      // Attribution as required by Apache-2.0 license
      watermark: {
        visible: true,
        fontSize: 12,
        horzAlign: 'right',
        vertAlign: 'bottom',
        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        text: 'TradingView Lightweight Charts™'
      }
    };

    try {
      chart.current = createChart(chartContainerRef.current, chartOptions);
      console.log('✅ Chart created successfully');
      isInitialized.current = true;

      // Create appropriate series based on chart type
      createSeries();

      // Handle resize
      const resizeObserver = new ResizeObserver(entries => {
        if (chart.current && entries.length > 0) {
          const { width, height } = entries[0].contentRect;
          chart.current.applyOptions({
            width: Math.max(width, 500),
            height: Math.max(height, 500)
          });
        }
      });

      if (chartContainerRef.current) {
        resizeObserver.observe(chartContainerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };

    } catch (error) {
      console.error('❌ Error creating chart:', error);
      setIsLoading(false);
    }
  }, [theme, width, height, chartState.showVolume, symbol]);

  // Create series based on chart type
  const createSeries = useCallback(() => {
    if (!chart.current) return;

    console.log(`📊 Creating ${chartState.chartType} series`);

    // Remove existing series
    if (mainSeries.current) {
      chart.current.removeSeries(mainSeries.current);
      mainSeries.current = null;
    }
    if (volumeSeries.current) {
      chart.current.removeSeries(volumeSeries.current);
      volumeSeries.current = null;
    }

    try {
      // Create main price series using correct API methods
      if (chartState.chartType === 'candlestick') {
        mainSeries.current = (chart.current as any).addCandlestickSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
          priceScaleId: 'right'
        });
      } else if (chartState.chartType === 'line') {
        mainSeries.current = (chart.current as any).addLineSeries({
          color: '#3b82f6',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          crosshairMarkerBorderColor: '#3b82f6',
          crosshairMarkerBackgroundColor: '#ffffff',
          priceScaleId: 'right'
        });
      } else if (chartState.chartType === 'area') {
        mainSeries.current = (chart.current as any).addAreaSeries({
          lineColor: '#3b82f6',
          topColor: 'rgba(59, 130, 246, 0.4)',
          bottomColor: 'rgba(59, 130, 246, 0.1)',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          priceScaleId: 'right'
        });
      }

      // Create volume series if enabled
      if (chartState.showVolume && chart.current) {
        volumeSeries.current = (chart.current as any).addHistogramSeries({
          color: '#64748b',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: 'volume',
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });

        // Create separate price scale for volume
        try {
          (chart.current as any).priceScale('volume').applyOptions({
            scaleMargins: {
              top: 0.8,
              bottom: 0,
            },
          });
        } catch (e) {
          console.warn('Could not configure volume price scale:', e);
        }
      }

      console.log('✅ Series created successfully');
    } catch (error) {
      console.error('❌ Error creating series:', error);
    }
  }, [chartState.chartType, chartState.showVolume]);

  // Load historical data using setData (TradingView best practice)
  const loadHistoricalData = useCallback(() => {
    if (!mainSeries.current || candlestickData.length === 0) return;

    console.log(`📈 Loading ${candlestickData.length} historical data points for ${symbol}`);

    try {
      if (chartState.chartType === 'candlestick') {
        // Use setData for initial historical data load
        mainSeries.current.setData(candlestickData);
      } else {
        // Convert to line data for line/area charts
        const lineData: LineData[] = candlestickData.map(item => ({
          time: item.time,
          value: item.close
        }));
        mainSeries.current.setData(lineData);
      }

      // Load volume data
      if (volumeSeries.current && volumeData.length > 0) {
        volumeSeries.current.setData(volumeData);
      }

      // Update current price from latest data
      if (candlestickData.length > 0) {
        const latestData = candlestickData[candlestickData.length - 1];
        setCurrentPrice(latestData.close);
      }

      // Fit content to show all data
      setTimeout(() => {
        if (chart.current) {
          chart.current.timeScale().fitContent();
          setIsLoading(false);
        }
      }, 100);

      console.log('✅ Historical data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading historical data:', error);
      setIsLoading(false);
    }
  }, [candlestickData, volumeData, chartState.chartType, symbol]);

  // Real-time updates using update() method (TradingView best practice)
  useEffect(() => {
    if (!mainSeries.current || !hookPrice || isDemo) return;
    
    const now = Date.now();
    
    // Throttle updates to prevent performance issues
    if (now - lastUpdateTime.current < 100) return;
    lastUpdateTime.current = now;

    console.log(`📊 Real-time update: ${symbol} = $${hookPrice}`);

    try {
      const updateTime = Math.floor(now / 1000) as UTCTimestamp;
      
      if (chartState.chartType === 'candlestick') {
        // Update the last candlestick with new price
        const lastCandle = candlestickData[candlestickData.length - 1];
        if (lastCandle) {
          const updatedCandle: CandlestickData = {
            time: lastCandle.time,
            open: lastCandle.open,
            high: Math.max(lastCandle.high, hookPrice),
            low: Math.min(lastCandle.low, hookPrice),
            close: hookPrice
          };
          
          // Use update() for real-time data (TradingView best practice)
          mainSeries.current.update(updatedCandle);
        }
      } else {
        // For line/area charts
        const lineUpdate: LineData = {
          time: updateTime,
          value: hookPrice
        };
        mainSeries.current.update(lineUpdate);
      }

      setCurrentPrice(hookPrice);
      setPriceChange(hookChange);
      setPriceChangePercent(hookChangePercent);

      // Auto-scroll to latest data if enabled
      if (chartState.autoScroll && chart.current) {
        chart.current.timeScale().scrollToRealTime();
      }

    } catch (error) {
      console.error('❌ Error updating real-time data:', error);
    }
  }, [hookPrice, hookChange, hookChangePercent, candlestickData, chartState, symbol, isDemo]);

  // Initialize chart
  useEffect(() => {
    initializeChart();
    
    return () => {
      if (chart.current) {
        chart.current.remove();
        chart.current = null;
        isInitialized.current = false;
      }
    };
  }, [initializeChart]);

  // Create series when chart type changes
  useEffect(() => {
    if (isInitialized.current) {
      createSeries();
    }
  }, [createSeries]);

  // Load data when available
  useEffect(() => {
    if (!dataLoading && candlestickData.length > 0) {
      loadHistoricalData();
    }
  }, [dataLoading, loadHistoricalData]);

  // Chart control handlers
  const handleChartTypeChange = useCallback((type: ChartState['chartType']) => {
    setChartState(prev => ({ ...prev, chartType: type }));
  }, []);

  const handleTimeframeChange = useCallback((timeframe: ChartState['timeframe']) => {
    setChartState(prev => ({ ...prev, timeframe }));
  }, []);

  const handleVolumeToggle = useCallback(() => {
    setChartState(prev => ({ ...prev, showVolume: !prev.showVolume }));
  }, []);

  const handleAutoScrollToggle = useCallback(() => {
    setChartState(prev => ({ ...prev, autoScroll: !prev.autoScroll }));
  }, []);

  const goToRealtime = useCallback(() => {
    if (chart.current) {
      chart.current.timeScale().scrollToRealTime();
    }
  }, []);

  const resetChart = useCallback(() => {
    if (chart.current) {
      chart.current.timeScale().fitContent();
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
              onClick={() => handleChartTypeChange(type)}
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
          {(['1m', '5m', '15m', '1h', '4h', '1d'] as const).map((tf) => (
            <Button
              key={tf}
              variant="ghost"
              size="sm"
              onClick={() => handleTimeframeChange(tf)}
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
        <Button
          onClick={handleVolumeToggle}
          className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
            chartState.showVolume
              ? 'bg-green-600 text-white'
              : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-600'
          }`}
        >
          <Volume2 className="w-3 h-3" />
          Volume
        </Button>

        {/* Auto-scroll Toggle */}
        <Button
          onClick={handleAutoScrollToggle}
          className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
            chartState.autoScroll
              ? 'bg-green-600 text-white'
              : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-600'
          }`}
        >
          {chartState.autoScroll ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          Auto-scroll
        </Button>

        {/* Chart Actions */}
        <div className="flex gap-1">
          <Button
            onClick={goToRealtime}
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-xs rounded text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-600"
          >
            Go to Realtime
          </Button>
          <Button
            onClick={resetChart}
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-xs rounded text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-600"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>

        {/* Connection Status */}
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <span className="text-xs text-slate-300">
            {isDemo ? 'Demo Mode' : isConnected ? 'Live Data' : 'Disconnected'}
          </span>
        </div>

        {/* Current Price Display */}
        {currentPrice && (
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-700 rounded-md">
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
          style={{ height: `${Math.max(height, 500)}px` }}
        />
        
        {isDemo && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium">
            DEMO DATA
          </div>
        )}
      </div>

      {/* Attribution Footer - Required by Apache-2.0 License */}
      <div className="mt-2 text-xs text-slate-400 text-center">
        Powered by{' '}
        <a 
          href="https://www.tradingview.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          TradingView Lightweight Charts™
        </a>
      </div>
    </div>
  );
};