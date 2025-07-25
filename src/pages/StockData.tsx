import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Menu, 
  Plus, 
  BarChart3, 
  AlertTriangle, 
  RotateCcw,
  ArrowLeft,
  Settings,
  MoreHorizontal,
  Star
} from "lucide-react";
import AllDataTab from "@/components/StockDetail/AllDataTab";

const StockData: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    if (value === 'trading-view') {
      navigate(`/stock-chart/${symbol}`);
    } else if (value === 'ai-analysis') {
      navigate(`/stock-analysis/${symbol}`);
    }
  };

  const watchlistStocks = [
    { symbol: 'SPX', price: '6,363.36', change: '+4.46', changePercent: '+0.07%', positive: true },
    { symbol: 'NDQ', price: '23,219.88', change: '+57.46', changePercent: '+0.25%', positive: true },
    { symbol: 'DJI', price: '44,693.95', change: '-316.38', changePercent: '-0.70%', positive: false },
    { symbol: 'VIX', price: '15.24', change: '-0.15', changePercent: '-0.97%', positive: false },
    { symbol: 'AAPL', price: '213.76', change: '-0.39', changePercent: '-0.18%', positive: false },
    { symbol: 'TSLA', price: '305.30', change: '-27.26', changePercent: '-8.20%', positive: false },
    { symbol: 'NFLX', price: '1,180.76', change: '+3.98', changePercent: '+0.34%', positive: true },
  ];

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white"
            onClick={() => navigate(`/stock-chart/${symbol}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <span className="text-white font-medium">{symbol}</span>
            <span className="text-slate-400">All Data</span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={() => navigate('/dashboard')}
          >
            <span className="text-sm">Back to Watchlist</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
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
          <Tabs value="all-data" onValueChange={handleTabChange}>
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
                Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="all-data" 
                className="text-sm px-3 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Data
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        <div className="flex-1 bg-slate-900 overflow-y-auto">
          <div className="p-6">
            <AllDataTab 
              symbol={symbol || 'NFLX'}
              stockInfo={{
                price: 1180.76,
                change: 3.98,
                changePercent: 0.34,
                askPrice: 1181.00,
                bidPrice: 1180.50,
                previousClose: 1176.78,
                volume: "3.85M",
                marketCap: "505.8B"
              }}
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
                onClick={() => navigate(`/stock-data/${stock.symbol}`)}
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

export default StockData;