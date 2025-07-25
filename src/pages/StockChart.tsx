import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Star
} from "lucide-react";
import HistoricalPriceChart from "@/components/HistoricalPriceChart";

const StockChart: React.FC = () => {
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

  const handleTabChange = (value: string) => {
    if (value === 'ai-analysis') {
      navigate(`/stock-analysis/${symbol}`);
    } else if (value === 'all-data') {
      navigate(`/stock-data/${symbol}`);
    }
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white"
            onClick={() => navigate(`/stock/${symbol}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <span className="text-white font-medium">{symbol}</span>
            <span className="text-slate-400">1D</span>
            <span className="text-slate-400">NASDAQ</span>
          </div>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Timeframe Dropdown */}
          <div className="relative">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-slate-800 text-slate-300 text-sm px-3 py-1 border border-slate-600 hover:bg-slate-700 hover:text-white focus:outline-none appearance-none cursor-pointer"
            >
              {timeframes.map((tf) => (
                <option key={tf} value={tf} className="bg-slate-800 text-slate-300">
                  {tf}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-sm">
            <BarChart3 className="w-4 h-4" />
            <span className="ml-1">Indicators</span>
          </Button>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="ml-1">Alert</span>
          </Button>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-sm">
            <RotateCcw className="w-4 h-4" />
            <span className="ml-1">Replay</span>
          </Button>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          {/* Tab Navigation */}
          <Tabs value="trading-view" onValueChange={handleTabChange}>
            <TabsList className="bg-slate-700/50 border border-slate-600 h-8">
              <TabsTrigger 
                value="trading-view" 
                className="text-sm px-3 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Trading View
              </TabsTrigger>
              <TabsTrigger 
                value="ai-analysis" 
                className="text-sm px-3 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                AI Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="all-data" 
                className="text-sm px-3 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                All Data
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-12 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 space-y-2">
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
          {/* Stock Price Header */}
          <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg font-bold">1,180.76</span>
                <span className="text-green-400 text-sm">+3.98 (+0.34%)</span>
              </div>
              <div className="flex space-x-4 text-sm text-slate-400">
                <div>O <span className="text-white">1,177.80</span></div>
                <div>H <span className="text-white">1,183.50</span></div>
                <div>L <span className="text-white">1,162.66</span></div>
                <div>C <span className="text-white">1,180.76</span></div>
              </div>
              <div className="text-sm text-slate-400">
                Vol <span className="text-blue-400">3.85M</span>
              </div>
            </div>
          </div>

          {/* Chart Content */}
          <div className="flex-1 bg-slate-900 min-h-0">
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
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
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
                onClick={() => navigate(`/stock-chart/${stock.symbol}`)}
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

export default StockChart;