import { useState, useCallback, useRef } from 'react';
import { IChartApi } from 'lightweight-charts';

export interface DrawingState {
  isDrawing: boolean;
  startPoint: { x: number; y: number; time: number; price: number } | null;
  currentDrawings: DrawingObject[];
  selectedColor: string;
}

export interface DrawingObject {
  id: string;
  type: 'line' | 'trend' | 'circle' | 'rectangle' | 'text' | 'triangle';
  startPoint: { x: number; y: number; time: number; price: number };
  endPoint?: { x: number; y: number; time: number; price: number };
  color: string;
  visible: boolean;
  text?: string;
}

export const useChartDrawing = (chartRef: React.RefObject<IChartApi>) => {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startPoint: null,
    currentDrawings: [],
    selectedColor: '#ffffff'
  });

  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const startDrawing = useCallback((point: { x: number; y: number; time: number; price: number }) => {
    setDrawingState(prev => ({
      ...prev,
      isDrawing: true,
      startPoint: point
    }));
  }, []);

  const updateDrawing = useCallback((point: { x: number; y: number; time: number; price: number }) => {
    if (!drawingState.isDrawing || !drawingState.startPoint) return;

    // Update preview drawing on canvas
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
        ctx.strokeStyle = drawingState.selectedColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(drawingState.startPoint.x, drawingState.startPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    }
  }, [drawingState.isDrawing, drawingState.startPoint, drawingState.selectedColor]);

  const finishDrawing = useCallback((
    endPoint: { x: number; y: number; time: number; price: number },
    type: DrawingObject['type']
  ) => {
    if (!drawingState.startPoint) return;

    const newDrawing: DrawingObject = {
      id: `${type}-${Date.now()}`,
      type,
      startPoint: drawingState.startPoint,
      endPoint,
      color: drawingState.selectedColor,
      visible: true
    };

    setDrawingState(prev => ({
      ...prev,
      isDrawing: false,
      startPoint: null,
      currentDrawings: [...prev.currentDrawings, newDrawing]
    }));

    // Clear preview canvas
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
      }
    }
  }, [drawingState.startPoint, drawingState.selectedColor]);

  const clearAllDrawings = useCallback(() => {
    setDrawingState(prev => ({
      ...prev,
      currentDrawings: [],
      isDrawing: false,
      startPoint: null
    }));

    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
      }
    }
  }, []);

  const toggleDrawingsVisibility = useCallback(() => {
    setDrawingState(prev => ({
      ...prev,
      currentDrawings: prev.currentDrawings.map(drawing => ({
        ...drawing,
        visible: !drawing.visible
      }))
    }));
  }, []);

  const setSelectedColor = useCallback((color: string) => {
    setDrawingState(prev => ({
      ...prev,
      selectedColor: color
    }));
  }, []);

  const getCoordinatesFromEvent = useCallback((event: MouseEvent, chartContainer: HTMLElement) => {
    const rect = chartContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to chart time/price coordinates
    // This is a simplified conversion - in a real implementation you'd use the chart's API
    const time = Date.now(); // Placeholder
    const price = 100; // Placeholder
    
    return { x, y, time, price };
  }, []);

  return {
    drawingState,
    startDrawing,
    updateDrawing,
    finishDrawing,
    clearAllDrawings,
    toggleDrawingsVisibility,
    setSelectedColor,
    getCoordinatesFromEvent,
    drawingCanvasRef
  };
};