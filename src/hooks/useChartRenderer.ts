import { useRef, useCallback, useEffect } from 'react';
import { OHLCData, ChartState, ViewportState, ChartDimensions, TechnicalIndicator } from '@/types/chart';
import { 
  priceToY, 
  indexToX, 
  calculateSMA, 
  calculateRSI, 
  calculateBollingerBands,
  generateTimeLabels,
  generatePriceLabels,
  formatPrice
} from '@/utils/chartUtils';

export const useChartRenderer = (chartState: ChartState) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const drawCandle = useCallback((
    ctx: CanvasRenderingContext2D,
    candle: OHLCData,
    x: number,
    priceRange: any,
    chartHeight: number,
    marginTop: number,
    candleWidth: number,
    theme: 'light' | 'dark'
  ) => {
    const openY = priceToY(candle.open, priceRange, chartHeight, marginTop);
    const closeY = priceToY(candle.close, priceRange, chartHeight, marginTop);
    const highY = priceToY(candle.high, priceRange, chartHeight, marginTop);
    const lowY = priceToY(candle.low, priceRange, chartHeight, marginTop);

    const isGreen = candle.close > candle.open;
    const bodyHeight = Math.abs(closeY - openY);
    const bodyTop = Math.min(openY, closeY);

    // Colors based on theme
    const colors = {
      light: {
        green: '#00C851',
        red: '#ff4444',
        wick: '#666666',
        grid: '#e0e0e0',
        text: '#333333',
        background: '#ffffff'
      },
      dark: {
        green: '#00ff88',
        red: '#ff6b6b',
        wick: '#888888',
        grid: '#444444',
        text: '#ffffff',
        background: '#1a1a1a'
      }
    };

    const themeColors = colors[theme];

    // Draw wick
    ctx.strokeStyle = themeColors.wick;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();

    // Draw body
    ctx.fillStyle = isGreen ? themeColors.green : themeColors.red;
    ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, Math.max(bodyHeight, 1));

    // Draw body outline
    ctx.strokeStyle = isGreen ? themeColors.green : themeColors.red;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, Math.max(bodyHeight, 1));
  }, []);

  const drawIndicator = useCallback((
    ctx: CanvasRenderingContext2D,
    indicator: TechnicalIndicator,
    data: OHLCData[],
    viewport: ViewportState,
    priceRange: any,
    chartHeight: number,
    marginTop: number,
    candleWidth: number,
    candleSpacing: number,
    marginLeft: number
  ) => {
    if (!indicator.visible || data.length === 0) return;

    ctx.strokeStyle = indicator.color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let values: number[] = [];

    switch (indicator.type) {
      case 'MA':
        values = calculateSMA(data, indicator.params.period || 20);
        break;
      case 'RSI':
        values = calculateRSI(data, indicator.params.period || 14);
        // RSI needs different scaling (0-100)
        break;
      case 'BOLLINGER':
        const bands = calculateBollingerBands(data, indicator.params.period || 20, indicator.params.multiplier || 2);
        // Draw upper, middle, lower bands
        break;
    }

    if (indicator.type === 'MA') {
      let firstPoint = true;
      for (let i = viewport.startIndex; i <= viewport.endIndex && i < data.length; i++) {
        if (isNaN(values[i])) continue;
        
        const x = indexToX(i - viewport.startIndex, candleWidth, candleSpacing, marginLeft);
        const y = priceToY(values[i], priceRange, chartHeight, marginTop);
        
        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  }, []);

  const drawGrid = useCallback((
    ctx: CanvasRenderingContext2D,
    dimensions: ChartDimensions,
    priceRange: any,
    timeRange: any,
    theme: 'light' | 'dark'
  ) => {
    const gridColor = theme === 'dark' ? '#444444' : '#e0e0e0';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Draw horizontal grid lines
    const priceLabels = generatePriceLabels(priceRange, dimensions.chartHeight);
    priceLabels.forEach(({ y }) => {
      ctx.beginPath();
      ctx.moveTo(dimensions.marginLeft, dimensions.marginTop + y);
      ctx.lineTo(dimensions.marginLeft + dimensions.chartWidth, dimensions.marginTop + y);
      ctx.stroke();
    });

    // Draw vertical grid lines
    const timeLabels = generateTimeLabels(timeRange, dimensions.chartWidth);
    timeLabels.forEach(({ x }) => {
      ctx.beginPath();
      ctx.moveTo(dimensions.marginLeft + x, dimensions.marginTop);
      ctx.lineTo(dimensions.marginLeft + x, dimensions.marginTop + dimensions.chartHeight);
      ctx.stroke();
    });
  }, []);

  const drawAxes = useCallback((
    ctx: CanvasRenderingContext2D,
    dimensions: ChartDimensions,
    priceRange: any,
    timeRange: any,
    theme: 'light' | 'dark'
  ) => {
    const textColor = theme === 'dark' ? '#ffffff' : '#333333';
    ctx.fillStyle = textColor;
    ctx.font = '12px Arial';

    // Draw price labels
    const priceLabels = generatePriceLabels(priceRange, dimensions.chartHeight);
    priceLabels.forEach(({ price, label, y }) => {
      ctx.textAlign = 'right';
      ctx.fillText(label, dimensions.width - 5, dimensions.marginTop + y + 4);
    });

    // Draw time labels
    const timeLabels = generateTimeLabels(timeRange, dimensions.chartWidth);
    timeLabels.forEach(({ label, x }) => {
      ctx.textAlign = 'center';
      ctx.fillText(label, dimensions.marginLeft + x, dimensions.height - 5);
    });
  }, []);

  const drawCrosshair = useCallback((
    ctx: CanvasRenderingContext2D,
    crosshair: any,
    dimensions: ChartDimensions,
    theme: 'light' | 'dark'
  ) => {
    if (!crosshair.visible) return;

    const lineColor = theme === 'dark' ? '#888888' : '#666666';
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(crosshair.x, dimensions.marginTop);
    ctx.lineTo(crosshair.x, dimensions.marginTop + dimensions.chartHeight);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(dimensions.marginLeft, crosshair.y);
    ctx.lineTo(dimensions.marginLeft + dimensions.chartWidth, crosshair.y);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw price and time labels
    const textColor = theme === 'dark' ? '#ffffff' : '#333333';
    ctx.fillStyle = theme === 'dark' ? '#333333' : '#ffffff';
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;

    // Price label
    const priceText = formatPrice(crosshair.price);
    const priceMetrics = ctx.measureText(priceText);
    const priceLabelX = dimensions.width - 60;
    const priceLabelY = crosshair.y - 10;
    const priceLabelWidth = priceMetrics.width + 10;
    const priceLabelHeight = 20;

    ctx.fillRect(priceLabelX, priceLabelY, priceLabelWidth, priceLabelHeight);
    ctx.strokeRect(priceLabelX, priceLabelY, priceLabelWidth, priceLabelHeight);
    
    ctx.fillStyle = textColor;
    ctx.fillText(priceText, priceLabelX + 5, priceLabelY + 14);

    // Time label
    const timeText = new Date(crosshair.timestamp).toLocaleTimeString();
    const timeMetrics = ctx.measureText(timeText);
    const timeLabelX = crosshair.x - timeMetrics.width / 2 - 5;
    const timeLabelY = dimensions.height - 30;
    const timeLabelWidth = timeMetrics.width + 10;
    const timeLabelHeight = 20;

    ctx.fillStyle = theme === 'dark' ? '#333333' : '#ffffff';
    ctx.fillRect(timeLabelX, timeLabelY, timeLabelWidth, timeLabelHeight);
    ctx.strokeRect(timeLabelX, timeLabelY, timeLabelWidth, timeLabelHeight);
    
    ctx.fillStyle = textColor;
    ctx.fillText(timeText, timeLabelX + 5, timeLabelY + 14);
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    
    if (!ctx || !overlayCtx) return;

    const { data } = chartState.data;
    const { viewport, dimensions, priceRange, timeRange, settings, indicators, crosshair } = chartState;

    // Clear canvases
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    overlayCtx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Set background
    const bgColor = settings.theme === 'dark' ? '#1a1a1a' : '#ffffff';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    if (data.length === 0) return;

    // Draw grid
    if (settings.gridLines) {
      drawGrid(ctx, dimensions, priceRange, timeRange, settings.theme);
    }

    // Draw candles
    const visibleData = data.slice(viewport.startIndex, viewport.endIndex + 1);
    visibleData.forEach((candle, index) => {
      const x = indexToX(index, settings.candleWidth, settings.candleSpacing, dimensions.marginLeft);
      drawCandle(ctx, candle, x, priceRange, dimensions.chartHeight, dimensions.marginTop, settings.candleWidth, settings.theme);
    });

    // Draw indicators
    indicators.forEach(indicator => {
      drawIndicator(
        ctx, 
        indicator, 
        data, 
        viewport, 
        priceRange, 
        dimensions.chartHeight, 
        dimensions.marginTop,
        settings.candleWidth,
        settings.candleSpacing,
        dimensions.marginLeft
      );
    });

    // Draw axes
    drawAxes(ctx, dimensions, priceRange, timeRange, settings.theme);

    // Draw crosshair on overlay canvas
    drawCrosshair(overlayCtx, crosshair, dimensions, settings.theme);

  }, [chartState, drawCandle, drawIndicator, drawGrid, drawAxes, drawCrosshair]);

  const scheduleRender = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(render);
  }, [render]);

  useEffect(() => {
    scheduleRender();
  }, [scheduleRender]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    canvasRef,
    overlayCanvasRef,
    render: scheduleRender
  };
};