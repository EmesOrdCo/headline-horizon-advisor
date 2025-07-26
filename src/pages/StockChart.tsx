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
import { useStockPrices } from "@/hooks/useStockPrices";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { useAlpacaStreamSingleton } from "@/hooks/useAlpacaStreamSingleton";
import LiveTimeGraph from "@/components/LiveTimeGraph";

const StockChart: React.FC = () => {
  const [activeTab, setActiveTab] = useState("chart");
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  
  // Fetch current stock data and historical data - use SPY as it has extended hours trading
  const activeSymbol = symbol || 'SPY';
  const { data: stockPrices } = useStockPrices([activeSymbol]);
  const { data: historicalData } = useHistoricalPrices(activeSymbol, '1Day', 1);
  
  // Fetch watchlist data - include globally traded assets
  const watchlistSymbols = ['SPY', 'QQQ', 'GLD', 'TLT', 'EEM', 'IWM', 'XLF'];
  const { data: watchlistPrices } = useStockPrices(watchlistSymbols);
  
  // Set up Alpaca WebSocket for real-time updates
  const { streamData, isConnected } = useAlpacaStreamSingleton({
    symbols: [activeSymbol],
    enabled: true
  });
  
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

  // Create watchlist with real data
  const watchlistStocks = watchlistSymbols.map(sym => {
    const price = watchlistPrices?.find(p => p.symbol === sym);
    const streamPrice = streamData?.[sym];
    
    const currentPrice = streamPrice?.price || price?.price || 0;
    const change = price?.change || 0;
    const changePercent = price?.changePercent || 0;
    
    const displayNames: { [key: string]: string } = {
      'SPY': 'S&P 500 ETF',
      'QQQ': 'NASDAQ ETF', 
      'GLD': 'Gold ETF',
      'TLT': 'Treasury ETF',
      'EEM': 'Emerging Markets',
      'IWM': 'Russell 2000 ETF',
      'XLF': 'Financial Sector'
    };
    
    return {
      symbol: sym,
      name: displayNames[sym] || sym,
      price: currentPrice.toFixed(2),
      change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
      changePercent: change >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
      positive: change >= 0
    };
  });

  const handleTabChange = (value: string) => {
    if (value === 'ai-analysis') {
      navigate(`/stock-analysis/${symbol}`);
    } else if (value === 'all-data') {
      navigate(`/stock-data/${symbol}`);
    }
  };

  // Get current stock info 
  const currentStock = stockPrices?.find(s => s.symbol === activeSymbol);
  const streamPrice = streamData?.[activeSymbol];
  
  // Use real-time data if available, otherwise fall back to API data
  const currentPrice = streamPrice?.price || currentStock?.price || 0;
  const bidPrice = currentStock?.bidPrice || 0;
  const askPrice = currentStock?.askPrice || 0;
  const spread = askPrice - bidPrice;
  const spreadPercent = bidPrice > 0 ? ((spread / bidPrice) * 100) : 0;
  
  // Get OHLC data from historical data
  const todayData = historicalData?.data?.[0];
  const openPrice = todayData?.open || 0;
  const highPrice = todayData?.high || 0;
  const lowPrice = todayData?.low || 0;
  const closePrice = todayData?.close || currentPrice;
  const volume = todayData?.volume || 0;
  
  // Calculate change
  const change = currentStock?.change || 0;
  const changePercent = currentStock?.changePercent || 0;
  
  // Format volume
  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`;
    return vol.toString();
  };
  
  // Get company name mapping
  const companyNames: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'TSLA': 'Tesla, Inc.',
    'NFLX': 'Netflix, Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms, Inc.',
    'NVDA': 'NVIDIA Corporation'
  };
  
  const companyName = companyNames[activeSymbol] || `${activeSymbol} ETF`;
  const exchange = activeSymbol.startsWith('SPY') || activeSymbol.startsWith('QQQ') ? 'NYSE Arca' : 'NASDAQ';

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white"
            onClick={() => navigate(`/stock/${activeSymbol}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{activeSymbol?.charAt(0) || 'S'}</span>
            </div>
            <span className="text-white font-medium">{activeSymbol}</span>
            <span className="text-slate-400">{selectedTimeframe}</span>
            <span className="text-slate-400">{exchange}</span>
            {isConnected && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live data" />
            )}
          </div>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Timeframe Options */}
          <div className="flex items-center space-x-1">
            {['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'].map((timeframe) => (
              <Button
                key={timeframe}
                variant="ghost"
                size="sm"
                className={`text-xs px-2 py-1 h-7 ${
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
                <span className="text-white text-lg font-bold">{currentPrice.toFixed(2)}</span>
                <span className={`text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </span>
              </div>
              <div className="flex space-x-4 text-sm text-slate-400">
                <div>O <span className="text-white">{openPrice.toFixed(2)}</span></div>
                <div>H <span className="text-white">{highPrice.toFixed(2)}</span></div>
                <div>L <span className="text-white">{lowPrice.toFixed(2)}</span></div>
                <div>C <span className="text-white">{closePrice.toFixed(2)}</span></div>
              </div>
              <div className="text-sm text-slate-400">
                Vol <span className="text-blue-400">{formatVolume(volume)}</span>
              </div>
            </div>
          </div>

          {/* Chart Content */}
          <div className="flex-1 bg-slate-900 min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="bg-slate-800/50 border-b border-slate-700 rounded-none h-10 w-full justify-start px-4">
                <TabsTrigger 
                  value="chart" 
                  className="text-sm px-3 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Price Chart
                </TabsTrigger>
                <TabsTrigger 
                  value="live-flow" 
                  className="text-sm px-3 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Live Data Flow
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="flex-1 m-0 p-0">
                <HistoricalPriceChart
                  symbol={activeSymbol}
                  timeframe="1Day"
                  limit={100}
                  showMiniChart={false}
                  fullHeight={true}
                />
              </TabsContent>
              
              <TabsContent value="live-flow" className="flex-1 m-0 p-4">
                <LiveTimeGraph
                  streamData={streamData}
                  symbols={[activeSymbol]}
                  isConnected={isConnected}
                />
              </TabsContent>
            </Tabs>
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
                  stock.symbol === activeSymbol ? 'bg-slate-700' : ''
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

          {/* Bid/Ask Spread Component */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/50">
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm">Buy/Sell Spread</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
                  <div className="text-green-400 text-xs font-medium mb-1">BID (Sell)</div>
                  <div className="text-white font-bold text-lg">${bidPrice.toFixed(2)}</div>
                </div>
                
                <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
                  <div className="text-red-400 text-xs font-medium mb-1">ASK (Buy)</div>
                  <div className="text-white font-bold text-lg">${askPrice.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Spread</span>
                  <div className="text-right">
                    <div className="text-white font-semibold">${spread.toFixed(4)}</div>
                    <div className="text-slate-400 text-xs">{spreadPercent.toFixed(3)}%</div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-slate-500 text-center">
                Real-time bid/ask prices for {activeSymbol}
              </div>
            </div>
          </div>

          {/* Stock Detail Panel */}
          <div className="p-4 border-t border-slate-700">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{companyName}</span>
                <Star className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-slate-400 text-xs">{exchange} • Real-time • {isConnected ? 'Live' : 'Delayed'}</div>
              <div className="text-white text-lg font-bold">{currentPrice.toFixed(2)} <span className="text-xs text-slate-400">USD</span></div>
              <div className={`text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)} {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </div>
              <div className="text-slate-400 text-xs">Last update: {new Date().toLocaleTimeString()}</div>
              
              <div className="pt-2 space-y-1">
                <div className="text-slate-400 text-xs">Key stats</div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Market Cap</span>
                  <span className="text-white">N/A</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">P/E Ratio</span>
                  <span className="text-white">N/A</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">52W High</span>
                  <span className="text-white">N/A</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">52W Low</span>
                  <span className="text-white">N/A</span>
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