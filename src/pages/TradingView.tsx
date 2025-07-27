import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { TradingChart } from '@/components/chart/TradingChart';
import { WebSocketMonitor } from '@/components/WebSocketMonitor';
import { useStockPrices } from "@/hooks/useStockPrices";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { useAlpacaStreamSingleton } from "@/hooks/useAlpacaStreamSingleton";

interface TradingViewProps {
  isDemo?: boolean;
}

const TradingView: React.FC<TradingViewProps> = ({ isDemo = false }) => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [chartType, setChartType] = useState<'line' | 'candles'>('line');
  
  // Use AAPL as default symbol like in the image
  const activeSymbol = symbol || 'AAPL';
  
  // Fetch real-time data
  const { data: stockPrices } = useStockPrices([activeSymbol]);
  const { data: historicalData } = useHistoricalPrices(activeSymbol, '1Day', 30);
  
  // Watchlist symbols from the image
  const watchlistSymbols = ['SPY', 'QQQ', 'GLD', 'TLT', 'EEM', 'IWM', 'XLF'];
  const { data: watchlistPrices } = useStockPrices(watchlistSymbols);
  
  // WebSocket connection for live data
  const { streamData, isConnected } = useAlpacaStreamSingleton({
    symbols: [activeSymbol, ...watchlistSymbols],
    enabled: !isDemo // Disable WebSocket for demo mode
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

  // Get current stock data
  const currentStock = stockPrices?.find(s => s.symbol === activeSymbol);
  const streamPrice = streamData?.[activeSymbol];
  
  const currentPrice = streamPrice?.price || currentStock?.price || 214.28;
  const change = currentStock?.change || 0.32;
  const changePercent = currentStock?.changePercent || 0.15;
  const volume = streamPrice?.volume || 148390000;
  
  // OHLC data
  const openPrice = streamPrice?.open || historicalData?.data?.[0]?.open || 209.22;
  const highPrice = streamPrice?.high || historicalData?.data?.[0]?.high || 214.95;
  const lowPrice = streamPrice?.low || historicalData?.data?.[0]?.low || 208.92;
  const closePrice = streamPrice?.close || historicalData?.data?.[0]?.close || 214.28;
  
  // Format volume
  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`;
    return vol.toString();
  };

  // Watchlist data
  const watchlistStocks = watchlistSymbols.map(sym => {
    const price = watchlistPrices?.find(p => p.symbol === sym);
    const streamPrice = streamData?.[sym];
    
    const currentPrice = streamPrice?.price || price?.price || 0;
    const change = price?.change || 0;
    const changePercent = price?.changePercent || 0;
    
    const displayNames: { [key: string]: string } = {
      'SPY': 'SPDR S&P 500 ETF Trust',
      'QQQ': 'Invesco QQQ Trust ETF',
      'GLD': 'SPDR Gold Trust',
      'TLT': 'iShares 20+ Year Treasury Bond ETF',
      'EEM': 'iShares MSCI Emerging Markets ETF',
      'IWM': 'iShares Russell 2000 ETF',
      'XLF': 'Financial Select Sector SPDR Fund'
    };
    
    return {
      symbol: sym,
      name: displayNames[sym] || sym,
      price: currentPrice > 0 ? currentPrice.toFixed(2) : '0.00',
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      positive: change >= 0
    };
  });

  // Bid/Ask spread
  const bidPrice = 214.23;
  const askPrice = 214.33;
  const spread = askPrice - bidPrice;

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-4">
          {/* Stock Symbol with Icon */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold text-lg">AAPL</span>
                <span className="text-slate-400 text-sm">1D</span>
                <span className="text-slate-400 text-sm">NASDAQ</span>
                <span className="text-slate-400 text-sm">•</span>
              </div>
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
                chartType === 'line' 
                  ? 'bg-green-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`text-sm px-3 py-1 h-8 rounded ${
                chartType === 'candles' 
                  ? 'bg-green-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => setChartType('candles')}
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

          {/* Live/Demo Toggle */}
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
          {/* Price Header */}
          <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <span className="text-white text-2xl font-bold">{currentPrice.toFixed(2)}</span>
                <Badge 
                  variant={change >= 0 ? "default" : "destructive"} 
                  className={`text-sm px-2 py-1 ${change >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                >
                  {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </Badge>
              </div>
              <div className="flex space-x-6 text-sm">
                <div className="text-slate-400">O <span className="text-white">{openPrice.toFixed(2)}</span></div>
                <div className="text-slate-400">H <span className="text-white">{highPrice.toFixed(2)}</span></div>
                <div className="text-slate-400">L <span className="text-white">{lowPrice.toFixed(2)}</span></div>
                <div className="text-slate-400">C <span className="text-white">{closePrice.toFixed(2)}</span></div>
                <div className="text-slate-400">Vol <span className="text-blue-400">{formatVolume(volume)}</span></div>
              </div>
              {!isDemo && isConnected && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    <Zap className="w-3 h-3 mr-1" />
                    Live Data
                  </Badge>
                </div>
              )}
              {isDemo && (
                <Badge variant="outline" className="text-orange-400 border-orange-400">
                  <Activity className="w-3 h-3 mr-1" />
                  Demo Mode
                </Badge>
              )}
            </div>
          </div>

          {/* Chart Container */}
          <div className="flex-1 bg-slate-900 relative min-h-0">
            <div className="absolute inset-0 p-4">
              <TradingChart 
                symbol={activeSymbol} 
                initialTimeFrame="1h"
                className="h-full border border-slate-700 rounded-lg"
              />
            </div>
            
            {/* Y-axis locked indicator */}
            <div className="absolute top-20 left-4 z-10">
              <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                Y-axis locked to 1D range
              </div>
            </div>

            {/* WebSocket Monitor */}
            {!isDemo && (
              <div className="absolute bottom-4 right-4 z-10">
                <WebSocketMonitor />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Watchlist & Info */}
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
                    <span className={`w-16 text-right ${stock.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.positive ? '+' : ''}{stock.change}
                    </span>
                    <span className={`w-16 text-right ${stock.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.positive ? '+' : ''}{stock.changePercent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buy/Sell Spread */}
          <div className="border-b border-slate-700 p-4">
            <h3 className="text-white font-medium mb-3">Buy/Sell Spread</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-medium">BID (Sell)</span>
                <span className="text-green-400 font-bold text-lg">${bidPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400 font-medium">ASK (Buy)</span>
                <span className="text-red-400 font-bold text-lg">${askPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-600 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Spread</span>
                  <span className="text-white">${spread.toFixed(4)}</span>
                </div>
                <div className="text-xs text-slate-500 text-right">0.047%</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Real-time bid/ask prices for AAPL
            </div>
          </div>

          {/* Stock Details */}
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