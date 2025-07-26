import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChartState, CrosshairData, TooltipData } from '@/types/chart';
import { useChartRenderer } from '@/hooks/useChartRenderer';
import { xToIndex, yToPrice, indexToX, priceToY, calculateVisibleRange } from '@/utils/chartUtils';

interface ChartCanvasProps {
  chartState: ChartState;
  onViewportChange: (viewport: Partial<ChartState['viewport']>) => void;
  onCrosshairChange: (crosshair: CrosshairData) => void;
  onTooltipChange: (tooltip: TooltipData) => void;
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  chartState,
  onViewportChange,
  onCrosshairChange,
  onTooltipChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { canvasRef, overlayCanvasRef } = useChartRenderer(chartState);
  
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [dragStartViewport, setDragStartViewport] = useState(chartState.viewport);

  const updateCanvasSize = useCallback(() => {
    if (!containerRef.current || !canvasRef.current || !overlayCanvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    const width = rect.width;
    const height = rect.height;

    // Set canvas size
    canvasRef.current.width = width * dpr;
    canvasRef.current.height = height * dpr;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;

    overlayCanvasRef.current.width = width * dpr;
    overlayCanvasRef.current.height = height * dpr;
    overlayCanvasRef.current.style.width = `${width}px`;
    overlayCanvasRef.current.style.height = `${height}px`;

    // Scale context for high DPI
    const ctx = canvasRef.current.getContext('2d');
    const overlayCtx = overlayCanvasRef.current.getContext('2d');
    
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    if (overlayCtx) {
      overlayCtx.scale(dpr, dpr);
    }

    // Update dimensions in chart state
    onViewportChange({
      ...chartState.viewport
    });
  }, [chartState.viewport, onViewportChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      const deltaX = x - lastMousePos.x;
      const candlePixelWidth = chartState.settings.candleWidth + chartState.settings.candleSpacing;
      const candleDelta = deltaX / candlePixelWidth;
      
      const newTranslateX = dragStartViewport.translateX - candleDelta;
      const maxTranslateX = Math.max(0, chartState.data.data.length - chartState.dimensions.chartWidth / candlePixelWidth);
      
      onViewportChange({
        translateX: Math.max(0, Math.min(maxTranslateX, newTranslateX))
      });
    } else {
      // Update crosshair
      const index = xToIndex(x, chartState.settings.candleWidth, chartState.settings.candleSpacing, chartState.dimensions.marginLeft);
      const adjustedIndex = Math.max(0, Math.min(chartState.data.data.length - 1, index + chartState.viewport.startIndex));
      const candle = chartState.data.data[adjustedIndex];
      
      if (candle && x >= chartState.dimensions.marginLeft && x <= chartState.dimensions.marginLeft + chartState.dimensions.chartWidth &&
          y >= chartState.dimensions.marginTop && y <= chartState.dimensions.marginTop + chartState.dimensions.chartHeight) {
        
        const price = yToPrice(y, chartState.priceRange, chartState.dimensions.chartHeight, chartState.dimensions.marginTop);
        
        onCrosshairChange({
          x,
          y,
          timestamp: candle.timestamp,
          price,
          visible: true
        });

        onTooltipChange({
          x: x + 10,
          y: y - 10,
          ohlc: candle,
          visible: true
        });
      } else {
        onCrosshairChange({
          x: 0,
          y: 0,
          timestamp: 0,
          price: 0,
          visible: false
        });

        onTooltipChange({
          x: 0,
          y: 0,
          ohlc: chartState.data.data[0] || { timestamp: 0, open: 0, high: 0, low: 0, close: 0, volume: 0 },
          visible: false
        });
      }
    }
  }, [isDragging, lastMousePos, dragStartViewport, chartState, onViewportChange, onCrosshairChange, onTooltipChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setLastMousePos({ x, y });
    setDragStartViewport(chartState.viewport);
  }, [chartState.viewport]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    onCrosshairChange({
      x: 0,
      y: 0,
      timestamp: 0,
      price: 0,
      visible: false
    });
    onTooltipChange({
      x: 0,
      y: 0,
      ohlc: chartState.data.data[0] || { timestamp: 0, open: 0, high: 0, low: 0, close: 0, volume: 0 },
      visible: false
    });
  }, [onCrosshairChange, onTooltipChange, chartState.data.data]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(10, chartState.viewport.scale * zoomFactor));
    
    onViewportChange({
      scale: newScale
    });
  }, [chartState.viewport.scale, onViewportChange]);

  useEffect(() => {
    const handleResize = () => updateCanvasSize();
    window.addEventListener('resize', handleResize);
    updateCanvasSize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCanvasSize]);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2 }}
      />
      
      {/* Tooltip */}
      {chartState.tooltip.visible && (
        <div
          className="absolute bg-background border border-border rounded-lg p-3 text-sm shadow-lg pointer-events-none z-10"
          style={{
            left: Math.min(chartState.tooltip.x, chartState.dimensions.width - 200),
            top: Math.max(10, chartState.tooltip.y - 100)
          }}
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Open:</span>
              <span className="ml-1 font-mono">{chartState.tooltip.ohlc.open.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">High:</span>
              <span className="ml-1 font-mono text-green-500">{chartState.tooltip.ohlc.high.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Low:</span>
              <span className="ml-1 font-mono text-red-500">{chartState.tooltip.ohlc.low.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Close:</span>
              <span className="ml-1 font-mono">{chartState.tooltip.ohlc.close.toFixed(4)}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Volume:</span>
              <span className="ml-1 font-mono">{chartState.tooltip.ohlc.volume.toLocaleString()}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Time:</span>
              <span className="ml-1 font-mono">{new Date(chartState.tooltip.ohlc.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};