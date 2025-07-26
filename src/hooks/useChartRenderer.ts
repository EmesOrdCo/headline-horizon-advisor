import { useRef, useCallback, useEffect } from 'react';
import { OHLCData, ChartState, ViewportState, ChartDimensions, TechnicalIndicator, PriceRange } from '@/types/chart';
import { 
  priceToY, 
  indexToX, 
  calculateSMA, 
  calculateRSI, 
  calculateBollingerBands,
  generateTimeLabels,
  generatePriceLabels,
  formatPrice,
  calculatePriceRange
} from '@/utils/chartUtils';

export const useChartRenderer = (chartState: ChartState) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const drawCandle = useCallback((
    ctx: CanvasRenderingContext2D,
    candle: OHLCData,
    x: number,
    priceRange: PriceRange,
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
    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

    // Colors matching the reference images - bright green/red like TradingView
    const greenColor = '#22c55e';  // Bright green
    const redColor = '#ef4444';    // Bright red
    const wickColor = theme === 'dark' ? '#64748b' : '#94a3b8';

    // Draw thin wicks first (1px width like professional charts)
    ctx.strokeStyle = wickColor;
    ctx.lineWidth = 1;
    
    // Upper wick
    if (highY < bodyTop) {
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, bodyTop);
      ctx.stroke();
    }
    
    // Lower wick  
    if (lowY > bodyBottom) {
      ctx.beginPath();
      ctx.moveTo(x, bodyBottom);
      ctx.lineTo(x, lowY);
      ctx.stroke();
    }

    // Draw thick candlestick body like reference images
    const bodyWidth = Math.max(candleWidth * 0.8, 4); // Thick bodies like reference
    const halfBodyWidth = bodyWidth / 2;
    
    ctx.fillStyle = isGreen ? greenColor : redColor;
    ctx.strokeStyle = isGreen ? greenColor : redColor;
    ctx.lineWidth = 1;

    if (bodyHeight <= 1) {
      // Doji - draw as thin line
      ctx.beginPath();
      ctx.moveTo(x - halfBodyWidth, openY);
      ctx.lineTo(x + halfBodyWidth, openY);
      ctx.stroke();
    } else {
      // Normal candle body - filled rectangle like professional charts
      ctx.fillRect(
        x - halfBodyWidth,
        bodyTop,
        bodyWidth,
        bodyHeight
      );
    }
  }, []);

  const drawIndicator = useCallback((
    ctx: CanvasRenderingContext2D,
    indicator: TechnicalIndicator,
    data: OHLCData[],
    viewport: ViewportState,
    priceRange: PriceRange,
    chartHeight: number,
    marginTop: number,
    totalCandleSpace: number,
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
        break;
      case 'BOLLINGER':
        const bbData = calculateBollingerBands(data, indicator.params.period || 20, indicator.params.multiplier || 2);
        // Draw upper band
        ctx.beginPath();
        bbData.upper.forEach((value, index) => {
          if (value > 0) {
            const x = marginLeft + index * totalCandleSpace + totalCandleSpace / 2;
            const y = priceToY(value, priceRange, chartHeight, marginTop);
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        
        // Draw lower band
        ctx.beginPath();
        bbData.lower.forEach((value, index) => {
          if (value > 0) {
            const x = marginLeft + index * totalCandleSpace + totalCandleSpace / 2;
            const y = priceToY(value, priceRange, chartHeight, marginTop);
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        
        // Draw middle band (SMA)
        values = bbData.middle;
        break;
    }

    // Draw the main line for MA and RSI
    if (indicator.type === 'MA' || indicator.type === 'RSI') {
      values.forEach((value, index) => {
        if (value > 0) {
          const x = marginLeft + index * totalCandleSpace + totalCandleSpace / 2;
          const y = priceToY(value, priceRange, chartHeight, marginTop);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    
    if (!ctx || !overlayCtx) return;

    const { data, viewport, indicators, settings } = chartState;
    if (!data || !data.data || data.data.length === 0) return;

    const theme = settings.theme;

    // Calculate dimensions
    const marginLeft = 60;
    const marginRight = 80;
    const marginTop = 20;
    const marginBottom = 60;
    const chartWidth = canvas.width - marginLeft - marginRight;
    const chartHeight = canvas.height - marginTop - marginBottom;

    // Calculate visible data range
    const startIndex = Math.max(0, Math.floor(viewport.startIndex));
    const endIndex = Math.min(data.data.length, Math.ceil(viewport.endIndex));
    const visibleData = data.data.slice(startIndex, endIndex);

    if (visibleData.length === 0) return;

    // Calculate price range for visible data
    const priceRange = calculatePriceRange(data.data, startIndex, endIndex);

    // Dark background like professional trading platforms
    ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid with subtle lines like reference images
    ctx.strokeStyle = theme === 'dark' ? '#1e293b' : '#f1f5f9';
    ctx.lineWidth = 1;

    // Horizontal grid lines  
    const priceLabels = generatePriceLabels(priceRange, 8);
    priceLabels.forEach(label => {
      const y = priceToY(label.price, priceRange, chartHeight, marginTop);
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(canvas.width - marginRight, y);
      ctx.stroke();
    });

    // Vertical grid lines
    const timeRange = { start: visibleData[0]?.timestamp || 0, end: visibleData[visibleData.length - 1]?.timestamp || 0 };
    const timeLabels = generateTimeLabels(timeRange, chartWidth);
    timeLabels.forEach((label, index) => {
      const x = marginLeft + (index * chartWidth) / timeLabels.length;
      ctx.beginPath();
      ctx.moveTo(x, marginTop);
      ctx.lineTo(x, canvas.height - marginBottom);
      ctx.stroke();
    });

    // Draw candlesticks with improved spacing like reference
    const totalCandleSpace = chartWidth / visibleData.length;
    const candleWidth = Math.max(totalCandleSpace * 0.7, 3); // Wider candles like professional charts

    visibleData.forEach((candle, index) => {
      const x = marginLeft + index * totalCandleSpace + totalCandleSpace / 2;
      drawCandle(ctx, candle, x, priceRange, chartHeight, marginTop, candleWidth, theme);
    });

    // Draw technical indicators
    indicators.forEach(indicator => {
      drawIndicator(ctx, indicator, data.data, viewport, priceRange, chartHeight, marginTop, totalCandleSpace, marginLeft);
    });

    // Draw price labels on right side like reference images
    ctx.fillStyle = theme === 'dark' ? '#e2e8f0' : '#1e293b';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    priceLabels.forEach(label => {
      const y = priceToY(label.price, priceRange, chartHeight, marginTop);
      ctx.fillText(
        formatPrice(label.price), 
        canvas.width - marginRight + 8, 
        y + 4
      );
    });

    // Draw time labels at bottom
    ctx.textAlign = 'center';
    timeLabels.forEach((label, index) => {
      const x = marginLeft + (index * chartWidth) / timeLabels.length;
      ctx.fillText(
        label.label,
        x,
        canvas.height - marginBottom + 20
      );
    });

    // Clear overlay canvas for crosshair
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Draw crosshair if visible
    if (chartState.crosshair && chartState.crosshair.visible) {
      const { x, y } = chartState.crosshair;
      
      // Vertical line
      overlayCtx.strokeStyle = theme === 'dark' ? '#64748b' : '#94a3b8';
      overlayCtx.lineWidth = 1;
      overlayCtx.setLineDash([2, 2]);
      
      overlayCtx.beginPath();
      overlayCtx.moveTo(x, marginTop);
      overlayCtx.lineTo(x, canvas.height - marginBottom);
      overlayCtx.stroke();
      
      // Horizontal line
      overlayCtx.beginPath();
      overlayCtx.moveTo(marginLeft, y);
      overlayCtx.lineTo(canvas.width - marginRight, y);
      overlayCtx.stroke();
      
      overlayCtx.setLineDash([]);
    }
  }, [chartState, drawCandle, drawIndicator]);

  // Handle canvas resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const container = canvas?.parentElement;
    
    if (!canvas || !overlayCanvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    overlayCanvas.width = rect.width * dpr;
    overlayCanvas.height = rect.height * dpr;
    
    // Scale canvas for high DPI displays
    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    
    if (ctx && overlayCtx) {
      ctx.scale(dpr, dpr);
      overlayCtx.scale(dpr, dpr);
    }
    
    // Set CSS size
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    overlayCanvas.style.width = rect.width + 'px';
    overlayCanvas.style.height = rect.height + 'px';
    
    render();
  }, [render]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  // Handle resize
  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    const canvas = canvasRef.current;
    
    if (canvas?.parentElement) {
      resizeObserver.observe(canvas.parentElement);
      handleResize(); // Initial size
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  return {
    canvasRef,
    overlayCanvasRef,
    render
  };
};