import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  TrendingUp,
  TrendingDown,
  Pencil,
  Type,
  Circle,
  Square,
  Triangle,
  Minus,
  Plus,
  BarChart3,
  Crosshair,
  Move,
  ArrowLeft,
  ExternalLink,
  Settings,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";
import HistoricalPriceChart from "@/components/HistoricalPriceChart";

const TradingView = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedTab, setSelectedTab] = useState('Chart');
  
  const timeframes = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'];
  const tabs = ['Overview', 'Chart', 'Analysis', 'News', 'Financials'];
  
  const leftSidebarTools = [
    { icon: Crosshair, label: 'Cursor', active: true },
    { icon: Move, label: 'Hand' },
    { icon: TrendingUp, label: 'Trend Line' },
    { icon: Pencil, label: 'Draw' },
    { icon: Type, label: 'Text' },
    { icon: Circle, label: 'Circle' },
    { icon: Square, label: 'Rectangle' },
    { icon: Triangle, label: 'Triangle' },
    { icon: Minus, label: 'Horizontal Line' },
    { icon: BarChart3, label: 'Indicators' }
  ];

  const watchlistData = {
    indices: [
      { symbol: 'SPX', name: 'S&P 500', price: '6,373.69', change: '10.33', changePercent: '0.16%', positive: true, logo: '500' },
      { symbol: 'NDQ', name: 'NASDAQ', price: '23,265.20', change: '45.40', changePercent: '0.20%', positive: true, logo: '100' },
      { symbol: 'DJI', name: 'Dow Jones', price: '44,679.07', change: '-14.84', changePercent: '-0.03%', positive: false, logo: '30' },
      { symbol: 'VIX', name: 'Volatility Index', price: '15.30', change: '-0.09', changePercent: '-0.58%', positive: false, logo: 'D' },
      { symbol: 'DXY', name: 'Dollar Index', price: '97.738', change: '0.221', changePercent: '0.23%', positive: true, logo: '$' }
    ],
    stocks: [
      { symbol: 'AAPL', name: 'Apple Inc.', price: '214.18', change: '0.42', changePercent: '0.20%', positive: true },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: '312.94', change: '7.64', changePercent: '2.50%', positive: true },
      { symbol: 'NFLX', name: 'Netflix Inc.', price: '1,183.44', change: '2.68', changePercent: '0.23%', positive: true, active: true }
    ]
  };

  const currentStock = {
    symbol: symbol?.toUpperCase() || 'NVDA',
    name: 'NVIDIA Corporation',
    price: '174.32',
    change: '0.5881',
    changePercent: '0.34%',
    preMarket: '169.72',
    preMarketChange: '-0.98',
    preMarketPercent: '-0.57%',
    volume: '14.504M',
    ohlc: {
      open: '173.36',
      high: '174.34',
      low: '172.71',
      close: '174.32'
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-6">
          {/* Stock Info */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-lime-400 rounded-lg flex items-center justify-center">
              <span className="text-black text-lg font-bold">N</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-black font-bold text-lg">{currentStock.symbol}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">{currentStock.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-black font-bold text-2xl">{currentStock.price}</span>
                <span className="text-green-600 font-medium">
                  {currentStock.change} ({currentStock.changePercent})
                </span>
                <span className="text-gray-500 text-sm">At Close</span>
              </div>
              <div className="text-sm text-gray-500">
                Pre Market: <span className="text-black">{currentStock.preMarket}</span>
                <span className="text-red-500 ml-1">{currentStock.preMarketChange} ({currentStock.preMarketPercent})</span>
                <span className="ml-2">PRICES BY NASDAQ, IN USD</span>
              </div>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-black hover:bg-gray-100"
            onClick={() => navigate('/watchlist')}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Watchlist
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <BarChart3 className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </Button>
          
          <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
            Trade
          </Button>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
                selectedTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setSelectedTab(tab)}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium">{tab}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-black"
            onClick={() => navigate(`/stock/${symbol}/analysis`)}
          >
            AI Qualitative Analysis
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-black"
            onClick={() => navigate(`/stock/${symbol}/data`)}
          >
            All Data
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Sidebar - Tools */}
        <div className="w-12 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 space-y-3">
          {leftSidebarTools.map((tool, index) => (
            <button
              key={index}
              className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors ${
                tool.active ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Chart Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chart Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              {/* Timeframe Selector */}
              <div className="flex items-center space-x-1">
                <span className="text-gray-600 text-sm mr-2">1D</span>
                <ChevronDown className="w-3 h-3 text-gray-600" />
              </div>

              {/* OHLCV Data */}
              <div className="flex items-center space-x-6 text-sm">
                <span className="text-blue-600">O {currentStock.ohlc.open}</span>
                <span className="text-green-600">H {currentStock.ohlc.high}</span>
                <span className="text-red-600">L {currentStock.ohlc.low}</span>
                <span className="text-black">C {currentStock.ohlc.close}</span>
                <span className="text-green-600">+0.88 (+0.51%)</span>
              </div>
              
              <div className="text-sm text-gray-600">
                Volume <span className="text-blue-600">{currentStock.volume}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Chart Type Controls */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="bg-orange-100 text-orange-600 border-orange-300">
                  📊 ProCharts
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                  S {currentStock.price}
                </Button>
                <Button variant="outline" size="sm" className="text-green-600 border-green-300">
                  B 174.87
                </Button>
              </div>

              {/* Chart Tools */}
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm">📏</Button>
                <Button variant="ghost" size="sm">🔄</Button>
                <Button variant="ghost" size="sm">↗</Button>
                <Button variant="ghost" size="sm">🎵</Button>
                <Button variant="ghost" size="sm">⚙️</Button>
                <Button variant="ghost" size="sm">📊</Button>
                <Button variant="ghost" size="sm">❓</Button>
                <Button variant="ghost" size="sm">📤</Button>
                <Button variant="ghost" size="sm">⛶</Button>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="flex-1 relative bg-white">
            <HistoricalPriceChart
              symbol={symbol || 'NVDA'}
              timeframe="1Month"
              limit={1000}
              showMiniChart={false}
              fullHeight={true}
            />
            
            {/* Chart Info Overlay */}
            <div className="absolute bottom-4 left-4 text-xs text-gray-500">
              Chart data is indicative and shows eToro's bid price
            </div>
            
            {/* Price Label */}
            <div className="absolute top-1/2 right-4 bg-teal-600 text-white px-2 py-1 text-sm font-bold rounded">
              {currentStock.price}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Watchlist */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
          {/* Watchlist Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-black font-semibold">Watchlist</h3>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-gray-600" />
                <Settings className="w-4 h-4 text-gray-600" />
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
              </div>
            </div>

            {/* Column Headers */}
            <div className="flex items-center text-xs text-gray-500 pb-2">
              <span className="flex-1">Symbol</span>
              <span className="w-20 text-right">Last</span>
              <span className="w-16 text-right">Chg</span>
              <span className="w-16 text-right">Chg%</span>
            </div>
          </div>

          {/* Watchlist Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Indices Section */}
            <div className="p-4">
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <ChevronDown className="w-3 h-3 mr-1" />
                <span>INDICES</span>
              </div>
              
              {watchlistData.indices.map((item) => (
                <div key={item.symbol} className="flex items-center py-2 hover:bg-gray-100 rounded text-sm">
                  <div className="flex items-center flex-1">
                    <div className={`w-8 h-6 rounded text-xs font-bold flex items-center justify-center mr-3 text-white ${
                      item.symbol === 'SPX' ? 'bg-red-500' :
                      item.symbol === 'NDQ' ? 'bg-blue-500' :
                      item.symbol === 'DJI' ? 'bg-blue-600' :
                      item.symbol === 'VIX' ? 'bg-green-500' :
                      'bg-green-600'
                    }`}>
                      {item.logo}
                    </div>
                    <span className="font-medium text-black">{item.symbol}</span>
                  </div>
                  <span className="w-20 text-right text-black">{item.price}</span>
                  <span className={`w-16 text-right ${item.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change}
                  </span>
                  <span className={`w-16 text-right ${item.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {item.changePercent}
                  </span>
                </div>
              ))}
            </div>

            {/* Stocks Section */}
            <div className="p-4">
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <ChevronDown className="w-3 h-3 mr-1" />
                <span>STOCKS</span>
              </div>
              
              {watchlistData.stocks.map((stock) => (
                <div key={stock.symbol} className={`flex items-center py-2 hover:bg-gray-100 rounded text-sm ${
                  stock.active ? 'bg-black text-white hover:bg-gray-800' : ''
                }`}>
                  <div className="flex items-center flex-1">
                    <div className={`w-8 h-6 rounded text-xs font-bold flex items-center justify-center mr-3 text-white ${
                      stock.symbol === 'AAPL' ? 'bg-black' :
                      stock.symbol === 'TSLA' ? 'bg-red-600' :
                      'bg-red-500'
                    }`}>
                      {stock.symbol === 'AAPL' ? '🍎' : 
                       stock.symbol === 'TSLA' ? 'T' : 'N'}
                    </div>
                    <span className={`font-medium ${stock.active ? 'text-white' : 'text-black'}`}>
                      {stock.symbol}
                    </span>
                  </div>
                  <span className={`w-20 text-right ${stock.active ? 'text-white' : 'text-black'}`}>
                    {stock.price}
                  </span>
                  <span className={`w-16 text-right ${
                    stock.active ? 'text-green-300' : 'text-green-600'
                  }`}>
                    {stock.change}
                  </span>
                  <span className={`w-16 text-right ${
                    stock.active ? 'text-green-300' : 'text-green-600'
                  }`}>
                    {stock.changePercent}
                  </span>
                </div>
              ))}
            </div>

            {/* Futures Section */}
            <div className="p-4">
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <ChevronDown className="w-3 h-3 mr-1" />
                <span>FUTURES</span>
              </div>
            </div>
          </div>

          {/* Selected Stock Details */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-6 bg-red-500 rounded text-xs font-bold flex items-center justify-center text-white">
                    N
                  </div>
                  <span className="font-medium text-black">NFLX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">📊</Button>
                  <Button variant="ghost" size="sm">✏️</Button>
                  <Button variant="ghost" size="sm">⋯</Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-sm">
                <span className="text-gray-600">Netflix, Inc.</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">NASDAQ</span>
              </div>
              
              <div className="text-sm text-gray-600">
                Technology Services • Internet Software/Services
              </div>
              
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-black">1,183.44</span>
                <span className="text-sm text-gray-600">USD</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-medium">+2.68 +0.23%</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Market open</span>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  📈 Netflix reported earnings that exceeded expectations and raised its 
                  guidance, benefiting from a weaker U.S. dollar against foreign currencies, 
                  which positively impacted its revenue.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-black">Key stats</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next earnings report</span>
                    <span className="text-black">In 82 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volume</span>
                    <span className="text-black">325.66K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Volume (30D)</span>
                    <span className="text-black">3.49M</span>
                  </div>
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