import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  RotateCcw,
  Crosshair,
  Move,
  Pencil,
  Type,
  Circle,
  Square,
  Triangle,
  Trash2,
  Eye,
  Settings,
  MoreHorizontal,
  Star,
  Activity,
  Zap
} from "lucide-react";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useAlpacaStreamSingleton } from "@/hooks/useAlpacaStreamSingleton";

interface TradingViewProps {
  isDemo?: boolean;
}

const TradingView: React.FC<TradingViewProps> = ({ isDemo = false }) => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedIndicators, setSelectedIndicators] = useState('Add...');
  const [showGrid, setShowGrid] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  
  // Use AAPL as default symbol like in the image
  const activeSymbol = symbol || 'AAPL';
  
  // Fetch real-time data
  const { data: stockPrices } = useStockPrices([activeSymbol]);
  
  // Watchlist symbols from the image
  const watchlistSymbols = ['SPY', 'QQQ', 'GLD', 'TLT', 'EEM', 'IWM', 'XLF'];
  const { data: watchlistPrices } = useStockPrices(watchlistSymbols);
  
  // WebSocket connection for live data
  const { streamData, isConnected } = useAlpacaStreamSingleton({
    symbols: [activeSymbol, ...watchlistSymbols],
    enabled: !isDemo
  });
  
  const leftSidebarTools = [
    { icon: Crosshair, label: 'Cursor' },
    { icon: Move, label: 'Hand' },
    { icon: Pencil, label: 'Draw' },
    { icon: TrendingUp, label: 'Trend Line' },
    { icon: Type, label: 'Text' },
    { icon: Circle, label: 'Circle' },
    { icon: Square, label: 'Rectangle' },
    { icon: Triangle, label: 'Triangle' },
    { icon: Trash2, label: 'Remove' },
    { icon: Eye, label: 'Hide' },
    { icon: Settings, label: 'Settings' }
  ];

  // Mock candlestick data for the chart
  const candlestickData = [
    { x: 50, open: 200, high: 210, low: 195, close: 205, bullish: true },
    { x: 100, open: 205, high: 215, low: 200, close: 210, bullish: true },
    { x: 150, open: 210, high: 220, low: 205, close: 208, bullish: false },
    { x: 200, open: 208, high: 225, low: 205, close: 220, bullish: true },
    { x: 250, open: 220, high: 235, low: 215, close: 230, bullish: true },
    { x: 300, open: 230, high: 240, low: 220, close: 225, bullish: false },
    { x: 350, open: 225, high: 235, low: 210, close: 215, bullish: false },
    { x: 400, open: 215, high: 225, low: 200, close: 220, bullish: true },
    { x: 450, open: 220, high: 230, low: 215, close: 218, bullish: false },
    { x: 500, open: 218, high: 225, low: 210, close: 215, bullish: false },
    { x: 550, open: 215, high: 230, low: 210, close: 225, bullish: true },
    { x: 600, open: 225, high: 235, low: 220, close: 230, bullish: true },
    { x: 650, open: 230, high: 240, low: 225, close: 235, bullish: true },
    { x: 700, open: 235, high: 245, low: 230, close: 240, bullish: true },
    { x: 750, open: 240, high: 250, low: 235, close: 245, bullish: true },
    { x: 800, open: 245, high: 255, low: 240, close: 250, bullish: true },
    { x: 850, open: 250, high: 260, low: 245, close: 255, bullish: true },
    { x: 900, open: 255, high: 265, low: 250, close: 260, bullish: true },
  ];

  // Watchlist data matching the image exactly
  const watchlistStocks = [
    { symbol: 'SPY', price: '636.95', change: '+0.00', changePercent: '+0.00%', positive: true },
    { symbol: 'QQQ', price: '566.85', change: '+0.00', changePercent: '+0.00%', positive: true },
    { symbol: 'GLD', price: '307.34', change: '+0.00', changePercent: '+0.00%', positive: true },
    { symbol: 'TLT', price: '86.39', change: '+0.00', changePercent: '+0.00%', positive: true },
    { symbol: 'EEM', price: '49.48', change: '+0.00', changePercent: '+0.00%', positive: true },
    { symbol: 'IWM', price: '224.28', change: '+0.00', changePercent: '+0.00%', positive: true },
    { symbol: 'XLF', price: '53.43', change: '+0.00', changePercent: '+0.00%', positive: true },
  ];

  const drawCandlestick = (candle: any, chartHeight: number) => {
    const scale = chartHeight / 100; // Simple scaling
    const bodyHeight = Math.abs(candle.close - candle.open) * scale;
    const wickTop = candle.high * scale;
    const wickBottom = candle.low * scale;
    const bodyTop = Math.max(candle.open, candle.close) * scale;
    const bodyBottom = Math.min(candle.open, candle.close) * scale;
    
    return (
      <g key={candle.x}>
        {/* Wick */}
        <line
          x1={candle.x}
          y1={chartHeight - wickTop}
          x2={candle.x}
          y2={chartHeight - wickBottom}
          stroke={candle.bullish ? '#22c55e' : '#ef4444'}
          strokeWidth="1"
        />
        {/* Body */}
        <rect
          x={candle.x - 8}
          y={chartHeight - bodyTop}
          width="16"
          height={bodyHeight}
          fill={candle.bullish ? '#22c55e' : '#ef4444'}
        />
      </g>
    );
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Top Navigation Bar - Exact replica */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-4">
          {/* Stock Symbol with Icon */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-lg">AAPL</span>
              <span className="text-slate-400 text-sm">1D</span>
              <span className="text-slate-400 text-sm">NASDAQ</span>
              <span className="text-slate-400 text-sm">•</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart Type Buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm px-3 py-1 h-8 rounded bg-green-600 text-white"
            >
              Line
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm px-3 py-1 h-8 rounded text-slate-300 hover:text-white hover:bg-slate-700"
            >
              Candles
            </Button>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center space-x-1">
            {['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M'].map((timeframe) => (
              <Button
                key={timeframe}
                variant="ghost"
                size="sm"
                className={`text-sm px-2 py-1 h-8 rounded ${
                  timeframe === selectedTimeframe 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          {/* Action Buttons */}
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-sm">
            <BarChart3 className="w-4 h-4 mr-1" />
            Indicators
          </Button>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Alert
          </Button>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-sm">
            <RotateCcw className="w-4 h-4 mr-1" />
            Replay
          </Button>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm px-3 py-1 bg-blue-600 text-white"
            >
              Trading View
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm px-3 py-1 text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => navigate(`/stock-analysis/${activeSymbol}`)}
            >
              Analysis
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm px-3 py-1 text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => navigate(`/stock-data/${activeSymbol}`)}
            >
              Data
            </Button>
          </div>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          {/* Live/Demo Toggle - EXACT as in image */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={`text-sm px-3 py-1 h-8 rounded ${
                !isDemo 
                  ? 'bg-green-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => navigate('/trading-view/AAPL')}
            >
              <Activity className="w-4 h-4 mr-1" />
              Live
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`text-sm px-3 py-1 h-8 rounded ${
                isDemo 
                  ? 'bg-orange-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => navigate('/trading-view-demo/AAPL')}
            >
              <Zap className="w-4 h-4 mr-1" />
              Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Price Header - EXACT replica */}
      <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <span className="text-white text-2xl font-bold">214.28</span>
              <Badge className="bg-green-600 text-white px-2 py-1 text-sm">
                +0.32 (+0.15%)
              </Badge>
            </div>
            <div className="flex space-x-6 text-sm">
              <div className="text-slate-400">O <span className="text-white">209.22</span></div>
              <div className="text-slate-400">H <span className="text-white">214.95</span></div>
              <div className="text-slate-400">L <span className="text-white">208.92</span></div>
              <div className="text-slate-400">C <span className="text-white">214.28</span></div>
              <div className="text-slate-400">Vol <span className="text-blue-400">148.39M</span></div>
            </div>
            {isDemo && (
              <Badge variant="outline" className="text-orange-400 border-orange-400">
                <Zap className="w-3 h-3 mr-1" />
                Demo Mode
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Drawing Tools */}
        <div className="w-12 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 space-y-2 flex-shrink-0">
          {leftSidebarTools.map((tool, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chart Container */}
          <div className="flex-1 bg-slate-900 relative min-h-0">
            {/* Chart Content */}
            <div className="absolute inset-0 p-4">
              <div className="w-full h-full bg-slate-800 rounded-lg border border-slate-700 relative overflow-hidden">
                {/* Chart Overlay - EXACT replica from image */}
                <div className="absolute top-4 left-4 right-4 z-10">
                  {/* Y-axis locked indicator */}
                  <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded mb-4 inline-block">
                    Y-axis locked to 1D range
                  </div>
                  
                  {/* Chart symbol and price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-white text-xl font-bold">AAPL 150.2424</div>
                      <Badge className="bg-red-600 text-white px-2 py-1">
                        -0.4228 (-0.28%)
                      </Badge>
                    </div>
                    <div className="text-slate-400 text-sm">
                      Last updated: 14:03:32
                    </div>
                  </div>

                  {/* Chart Controls - EXACT replica */}
                  <div className="bg-slate-800/90 backdrop-blur rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center justify-between">
                      {/* Timeframe */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-400 text-sm">Timeframe:</span>
                          <div className="flex space-x-1">
                            {['1M', '5M', '15M', '1H', '4H', '1D', '1W'].map((tf) => (
                              <Button
                                key={tf}
                                variant="ghost"
                                size="sm"
                                className={`text-xs px-2 py-1 h-6 ${
                                  tf === '1M' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                {tf}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Indicators */}
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-400 text-sm">Indicators:</span>
                          <Select value={selectedIndicators} onValueChange={setSelectedIndicators}>
                            <SelectTrigger className="w-24 h-6 text-xs bg-slate-700 border-slate-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Add...">Add...</SelectItem>
                              <SelectItem value="MA">Moving Average</SelectItem>
                              <SelectItem value="RSI">RSI</SelectItem>
                              <SelectItem value="MACD">MACD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Settings */}
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-sm">Grid</span>
                          <Switch checked={showGrid} onCheckedChange={setShowGrid} className="scale-75" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-sm">Volume</span>
                          <Switch checked={showVolume} onCheckedChange={setShowVolume} className="scale-75" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-sm">Theme</span>
                          <Switch checked={darkTheme} onCheckedChange={setDarkTheme} className="scale-75" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candlestick Chart - EXACT replica */}
                <div className="absolute inset-0 pt-32">
                  <svg width="100%" height="100%" viewBox="0 0 1000 400" className="overflow-visible">
                    {/* Grid lines */}
                    {showGrid && (
                      <g stroke="#374151" strokeWidth="0.5">
                        {[0, 100, 200, 300, 400].map(y => (
                          <line key={y} x1="0" y1={y} x2="1000" y2={y} />
                        ))}
                        {[0, 200, 400, 600, 800, 1000].map(x => (
                          <line key={x} x1={x} y1="0" x2={x} y2="400" />
                        ))}
                      </g>
                    )}
                    
                    {/* Candlesticks - EXACT pattern from image */}
                    {candlestickData.map(candle => drawCandlestick(candle, 400))}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Watchlist & Info - EXACT replica */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          {/* Watchlist Section */}
          <div className="border-b border-slate-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Watchlist</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-slate-400 hover:text-white">
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-slate-400 hover:text-white">
                    <Settings className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-slate-400 hover:text-white">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400 border-b border-slate-600 pb-2 mb-2">
                <span className="flex-1">Symbol</span>
                <span className="w-16 text-right">Last</span>
                <span className="w-16 text-right">Chg</span>
                <span className="w-16 text-right">Chg%</span>
              </div>

              <div className="space-y-1">
                {watchlistStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center space-x-2 py-1 hover:bg-slate-700/50 cursor-pointer text-xs rounded"
                  >
                    <span className="flex-1 text-white font-medium">{stock.symbol}</span>
                    <span className="w-16 text-right text-white">{stock.price}</span>
                    <span className="w-16 text-right text-green-400">{stock.change}</span>
                    <span className="w-16 text-right text-green-400">{stock.changePercent}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buy/Sell Spread - EXACT replica */}
          <div className="border-b border-slate-700 p-4">
            <h3 className="text-white font-medium mb-3">Buy/Sell Spread</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-medium">BID (Sell)</span>
                <span className="text-green-400 font-bold text-lg">$214.23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400 font-medium">ASK (Buy)</span>
                <span className="text-red-400 font-bold text-lg">$214.33</span>
              </div>
              <div className="border-t border-slate-600 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Spread</span>
                  <span className="text-white">$0.1000</span>
                </div>
                <div className="text-xs text-slate-500 text-right">0.047%</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Real-time bid/ask prices for AAPL
            </div>
          </div>

          {/* Stock Details - EXACT replica */}
          <div className="flex-1 p-4">
            <h3 className="text-white font-medium mb-3">Apple Inc.</h3>
            <div className="text-sm text-slate-400 mb-3">NASDAQ • Real-time • Live</div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Market Cap</span>
                <span className="text-white">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">P/E Ratio</span>
                <span className="text-white">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">52W High</span>
                <span className="text-white">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">52W Low</span>
                <span className="text-white">N/A</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-white">214.28</span>
                <span className="text-green-400">+0.32 +0.15%</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Last update: 13:58:16</div>
            </div>

            <div className="mt-4 space-y-1 text-xs text-slate-500">
              <div>Key stats</div>
              <div>Market Cap: N/A</div>
              <div>P/E Ratio: N/A</div>
              <div>52W High: N/A</div>
              <div>52W Low: N/A</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingView;