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
  TrendingDown,
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
  Zap,
  Clock
} from "lucide-react";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useAlpacaStreamSingleton } from "@/hooks/useAlpacaStreamSingleton";
import { useTheme } from "@/contexts/ThemeContext";
import { LiveTradingViewChart } from "@/components/chart/LiveTradingViewChart";
import CompanyLogo from "@/components/CompanyLogo";
import { AlpacaTradingModal } from "@/components/AlpacaTradingModal";
import { PendingOrdersModal } from "@/components/PendingOrdersModal";
import { usePendingOrders } from "@/hooks/usePendingOrders";
import { StockPendingOrders } from "@/components/StockPendingOrders";

interface TradingViewProps {
  isDemo?: boolean;
}

const TradingView: React.FC<TradingViewProps> = ({ isDemo = false }) => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedIndicators, setSelectedIndicators] = useState('Add...');
  const [showGrid, setShowGrid] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [activeIndicators, setActiveIndicators] = useState({
    sma: false,
    ema: false,
    bollinger: false,
    rsi: false,
    macd: false,
    volume: true
  });
  
  // Use AAPL as default symbol like in the image
  const activeSymbol = symbol || 'AAPL';
  
  // Hook for pending orders data
  const { buyOrders, sellOrders, totalValue: pendingValue, isLoading: pendingLoading } = usePendingOrders();
  
  // Fetch real-time data
  const { data: stockPrices } = useStockPrices([activeSymbol]);
  
  // Watchlist symbols from the image
  const watchlistSymbols = ['SPY', 'QQQ', 'GLD', 'TLT', 'EEM', 'IWM', 'XLF'];
  const { data: watchlistPrices } = useStockPrices(watchlistSymbols);
  
  // Enable WebSocket streaming for real-time updates
  // Disable WebSocket if user is on the live trading page to prevent connection conflicts
  const isOnLiveTradingPage = window.location.pathname.includes('/alpaca-live-chart');
  const { streamData, isConnected } = useAlpacaStreamSingleton({
    symbols: [activeSymbol, ...watchlistSymbols],
    enabled: !isDemo && !isOnLiveTradingPage
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
      {/* GIANT PENDING ORDERS BUTTON AT THE TOP - IMPOSSIBLE TO MISS */}
      <div className="w-full p-3 bg-red-600 border-b-4 border-red-500 flex-shrink-0">
        <PendingOrdersModal>
          <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 text-lg">
            <Clock className="w-5 h-5 mr-2" />
            🚨 MANAGE ALL PENDING ORDERS 🚨
          </Button>
        </PendingOrdersModal>
      </div>

      {/* Top Navigation Bar - Exact replica */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-4">
          {/* Go Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white"
            onClick={() => navigate('/watchlist')}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Watchlist
          </Button>

          {/* Stock Symbol with Real Logo */}
          <div className="flex items-center space-x-2">
            <CompanyLogo symbol={activeSymbol} size="md" />
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-lg">{activeSymbol}</span>
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
              className={`text-sm px-3 py-1 h-8 rounded ${
                chartType === 'line' ? 'bg-green-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`text-sm px-3 py-1 h-8 rounded ${
                chartType === 'candlestick' ? 'bg-green-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => setChartType('candlestick')}
            >
              Candles
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`text-sm px-3 py-1 h-8 rounded ${
                chartType === 'area' ? 'bg-green-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => setChartType('area')}
            >
              Area
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

          {/* Indicators Dropdown */}
          <Select>
            <SelectTrigger className="w-40 h-8 text-sm bg-slate-700 border-slate-600 text-slate-300">
              <SelectValue placeholder="Indicators" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="sma" onClick={() => setActiveIndicators(prev => ({ ...prev, sma: !prev.sma }))}>
                SMA (Simple Moving Average)
              </SelectItem>
              <SelectItem value="ema" onClick={() => setActiveIndicators(prev => ({ ...prev, ema: !prev.ema }))}>
                EMA (Exponential Moving Average)
              </SelectItem>
              <SelectItem value="bollinger" onClick={() => setActiveIndicators(prev => ({ ...prev, bollinger: !prev.bollinger }))}>
                Bollinger Bands
              </SelectItem>
              <SelectItem value="rsi" onClick={() => setActiveIndicators(prev => ({ ...prev, rsi: !prev.rsi }))}>
                RSI (Relative Strength Index)
              </SelectItem>
              <SelectItem value="macd" onClick={() => setActiveIndicators(prev => ({ ...prev, macd: !prev.macd }))}>
                MACD
              </SelectItem>
            </SelectContent>
          </Select>

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

          {/* Pending Orders & Buy/Sell Buttons */}
          <div className="flex items-center space-x-2">
            <PendingOrdersModal>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm px-3 py-1 text-blue-400 hover:text-blue-300 hover:bg-slate-700 border border-blue-400/30"
              >
                <Clock className="w-4 h-4 mr-1" />
                Pending Orders
              </Button>
            </PendingOrdersModal>
            
            <AlpacaTradingModal symbol={activeSymbol} currentPrice={214.28} initialMode="sell">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <TrendingDown className="w-4 h-4 mr-1" />
                Sell
              </Button>
            </AlpacaTradingModal>
            
            <AlpacaTradingModal symbol={activeSymbol} currentPrice={214.28} initialMode="buy">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Buy
              </Button>
            </AlpacaTradingModal>
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
          {/* Large Pending Orders Button - Same as Portfolio Page */}
          <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
            <PendingOrdersModal>
              <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600">
                <Clock className="w-4 h-4 mr-2" />
                Manage All Pending Orders
              </Button>
            </PendingOrdersModal>
          </div>
          
          {/* Professional TradingView Chart */}
          <div className="flex-1 bg-slate-900 relative min-h-0 p-4">
            <LiveTradingViewChart
              symbol={activeSymbol}
              theme={isDarkMode ? 'dark' : 'light'}
              height={650}
              isDemo={isDemo}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Right Sidebar - Watchlist, Pending Orders & Info - EXACT replica */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          {/* Pending Orders Section - Always Visible */}
          <div className="border-b border-slate-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Pending Orders
                </h3>
                <PendingOrdersModal>
                  <Button variant="ghost" size="sm" className="text-xs px-2 py-1 text-blue-400 hover:text-blue-300 border border-blue-400/30">
                    View All
                  </Button>
                </PendingOrdersModal>
              </div>
              
              {/* Quick Pending Orders Summary with Real Data */}
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-blue-400 font-medium">
                      {pendingLoading ? "..." : buyOrders}
                    </div>
                    <div className="text-slate-400">Buy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400 font-medium">
                      {pendingLoading ? "..." : sellOrders}
                    </div>
                    <div className="text-slate-400">Sell</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-medium">
                      {pendingLoading ? "$..." : `$${pendingValue.toFixed(0)}`}
                    </div>
                    <div className="text-slate-400">Value</div>
                  </div>
                </div>
                <PendingOrdersModal>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-left justify-start bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <Clock className="w-3 h-3 mr-2 text-blue-400" />
                    Manage Pending Orders
                  </Button>
                </PendingOrdersModal>
              </div>
            </div>
          </div>

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