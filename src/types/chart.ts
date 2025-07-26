export interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartData {
  symbol: string;
  data: OHLCData[];
  lastUpdate: number;
}

export interface ViewportState {
  scale: number;
  translateX: number;
  translateY: number;
  startIndex: number;
  endIndex: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  chartWidth: number;
  chartHeight: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export interface PriceRange {
  min: number;
  max: number;
  range: number;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface ChartSettings {
  candleWidth: number;
  candleSpacing: number;
  gridLines: boolean;
  showVolume: boolean;
  theme: 'light' | 'dark';
}

export interface TechnicalIndicator {
  id: string;
  name: string;
  type: 'MA' | 'RSI' | 'BOLLINGER' | 'MACD';
  params: Record<string, number>;
  visible: boolean;
  color: string;
}

export interface CrosshairData {
  x: number;
  y: number;
  timestamp: number;
  price: number;
  visible: boolean;
}

export interface TooltipData {
  x: number;
  y: number;
  ohlc: OHLCData;
  visible: boolean;
}

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

export interface ChartState {
  data: ChartData;
  viewport: ViewportState;
  dimensions: ChartDimensions;
  priceRange: PriceRange;
  timeRange: TimeRange;
  settings: ChartSettings;
  indicators: TechnicalIndicator[];
  crosshair: CrosshairData;
  tooltip: TooltipData;
  timeFrame: TimeFrame;
  isLoading: boolean;
  isDragging: boolean;
  isZooming: boolean;
}