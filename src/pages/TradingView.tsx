import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  RotateCcw,
  Save,
  Share,
  Camera,
  Settings,
  Crosshair,
  Move,
  Pencil,
  Type,
  Circle,
  Square,
  Triangle,
  Trash2,
  Eye,
  Star,
  MoreHorizontal,
  ArrowLeft
} from "lucide-react";
import HistoricalPriceChart from "@/components/HistoricalPriceChart";

const TradingView = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  
  const timeframes = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'];
  
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

  const watchlistStocks = [
    { symbol: 'SPX', name: 'S&P 500', price: '6,363.36', change: '+4.46', changePercent: '+0.07%', positive: true },
    { symbol: 'NDQ', name: 'NASDAQ', price: '23,219.88', change: '+57.46', changePercent: '+0.25%', positive: true },
    { symbol: 'DJI', name: 'Dow Jones', price: '44,693.95', change: '-316.38', changePercent: '-0.70%', positive: false },
    { symbol: 'VIX', name: 'Volatility Index', price: '15.24', change: '-0.15', changePercent: '-0.97%', positive: false },
    { symbol: 'AAPL', name: 'Apple Inc.', price: '213.76', change: '-0.39', changePercent: '-0.18%', positive: false },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '305.30', change: '-27.26', changePercent: '-8.20%', positive: false },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: '1,180.76', change: '+3.98', changePercent: '+0.34%', positive: true }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{symbol?.slice(0, 1)}</span>
            </div>
            <span className="text-white font-medium">{symbol}</span>
            <span className="text-slate-400">1D</span>
            <span className="text-slate-400">NASDAQ</span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={() => navigate('/watchlist')}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Watchlist
          </Button>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Timeframe Buttons */}
          <div className="flex items-center space-x-1">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={selectedTimeframe === tf ? "default" : "ghost"}
                size="sm"
                className={`h-7 px-2 text-xs ${
                  selectedTimeframe === tf 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                onClick={() => setSelectedTimeframe(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>

          {/* View Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Trading View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => navigate(`/stock/${symbol}/analysis`)}
            >
              AI Qualitative Analysis
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => navigate(`/stock/${symbol}/data`)}
            >
              All Data
            </Button>
          </div>
        </div>
      </div>

      {/* Main Trading View Layout */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Sidebar - Tools */}
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
        <div className="flex-1 flex flex-col">
          {/* Stock Price Header */}
          <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg font-bold">267.93</span>
                <span className="text-green-400 text-sm">+0.23 (+0.09%)</span>
              </div>
              <div className="flex space-x-4 text-sm text-slate-400">
                <div>O <span className="text-white">267.70</span></div>
                <div>H <span className="text-white">268.50</span></div>
                <div>L <span className="text-white">266.66</span></div>
                <div>C <span className="text-white">267.93</span></div>
              </div>
              <div className="text-sm text-slate-400">
                Vol <span className="text-blue-400">6.71M</span>
              </div>
            </div>
          </div>

          {/* Chart Title and Controls */}
          <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">{symbol} Live Performance</h3>
                <p className="text-xs text-slate-400">24 data points</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Time Period Buttons */}
                <div className="flex items-center space-x-1">
                  {['1D', '1W', '1M', '3M', '1Y'].map((period) => (
                    <Button
                      key={period}
                      variant={period === '1D' ? "default" : "ghost"}
                      size="sm"
                      className={`h-7 px-2 text-xs ${
                        period === '1D'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 px-2 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Line
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    Candles
                  </Button>
                </div>
                
                <div className="text-right">
                  <div className="text-emerald-400 text-sm font-medium">+7.07(+2.71%)</div>
                  <div className="text-xs text-slate-400">1M change</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Container - Full Height */}
          <div className="flex-1 bg-slate-900">
            <HistoricalPriceChart
              symbol={symbol || 'NFLX'}
              timeframe="1Day"
              limit={100}
              showMiniChart={false}
              fullHeight={true}
            />
          </div>
        </div>

        {/* Right Sidebar - Watchlist */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col flex-shrink-0">
          {/* Watchlist Header */}
          <div className="p-4 border-b border-slate-700">
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

            <div className="flex items-center space-x-2 text-xs text-slate-400 border-b border-slate-600 pb-2">
              <span className="flex-1">Symbol</span>
              <span className="w-16 text-right">Last</span>
              <span className="w-16 text-right">Chg</span>
              <span className="w-16 text-right">Chg%</span>
            </div>
          </div>

          {/* Watchlist Items */}
          <div className="flex-1 overflow-y-auto">
            {watchlistStocks.map((stock, index) => (
              <div
                key={stock.symbol}
                className={`flex items-center space-x-2 px-4 py-2 hover:bg-slate-700/50 cursor-pointer text-xs ${
                  stock.symbol === symbol ? 'bg-slate-700' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="text-white font-medium">{stock.symbol}</div>
                </div>
                <div className="w-16 text-right text-white">{stock.price}</div>
                <div className={`w-16 text-right ${stock.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.change}
                </div>
                <div className={`w-16 text-right ${stock.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.changePercent}
                </div>
              </div>
            ))}
          </div>

          {/* Stock Detail Panel */}
          <div className="p-4 border-t border-slate-700">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Netflix, Inc.</span>
                <Star className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-slate-400 text-xs">NASDAQ • Real-time • Pre market</div>
              <div className="text-white text-lg font-bold">1,180.76 <span className="text-xs text-slate-400">USD</span></div>
              <div className="text-green-400 text-sm">+3.98 +0.34%</div>
              <div className="text-slate-400 text-xs">Last update at 00:59 GMT+1</div>
              
              <div className="pt-2 space-y-1">
                <div className="text-slate-400 text-xs">Key stats</div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Market Cap</span>
                  <span className="text-white">505.8B</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">P/E Ratio</span>
                  <span className="text-white">45.2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingView;