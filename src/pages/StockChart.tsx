import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

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
import StockLineChart from '@/components/StockLineChart';
import { WebSocketMonitor } from '@/components/WebSocketMonitor';
import { useStockPrices } from "@/hooks/useStockPrices";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { useAlpacaStreamSingleton } from "@/hooks/useAlpacaStreamSingleton";

const StockChart: React.FC = () => {
  
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [chartType, setChartType] = useState<'line' | 'candles'>('line');
  const [isLoadingTimeframe, setIsLoadingTimeframe] = useState(false);
  
  // Fetch current stock data and historical data - use SPY as it has extended hours trading
  const activeSymbol = symbol || 'SPY';
  const { data: stockPrices } = useStockPrices([activeSymbol]);
  
  // Dynamic historical data fetching based on timeframe specifications
  const getTimeframeConfig = (timeframe: string) => {
    switch (timeframe) {
      case '1m':
        return { apiTimeframe: '1Minute', limit: 60, hours: 1 }; // Last 1 hour
      case '5m':
        return { apiTimeframe: '5Minute', limit: 36, hours: 3 }; // Last 3 hours  
      case '15m':
        return { apiTimeframe: '15Minute', limit: 24, hours: 6 }; // Last 6 hours
      case '30m':
        return { apiTimeframe: '30Minute', limit: 24, hours: 12 }; // Last 12 hours
      case '1H':
        return { apiTimeframe: '1Hour', limit: 48, days: 2 }; // Last 2 days
      case '4H':
        return { apiTimeframe: '4Hour', limit: 30, days: 5 }; // Last 5 days
      case '1D':
        return { apiTimeframe: '1Day', limit: 30, days: 30 }; // Last 1 month
      case '1W':
        return { apiTimeframe: '1Week', limit: 12, months: 3 }; // Last 3 months
      case '1M':
        return { apiTimeframe: '1Month', limit: 12, months: 12 }; // Last 1 year
      default:
        return { apiTimeframe: '1Day', limit: 30, days: 30 };
    }
  };
  
  const { apiTimeframe, limit } = getTimeframeConfig(selectedTimeframe);
  
  // Use React Query's suspense mode and better error handling
  const { data: historicalData, isLoading: historicalLoading, isFetching } = useHistoricalPrices(activeSymbol, apiTimeframe, limit);
  
  // Fetch watchlist data - include globally traded assets
  const watchlistSymbols = ['SPY', 'QQQ', 'GLD', 'TLT', 'EEM', 'IWM', 'XLF'];
  const { data: watchlistPrices } = useStockPrices(watchlistSymbols);
  
  // Set up Alpaca WebSocket for real-time updates - include AAPL for Live Data Flow
  const { streamData, isConnected } = useAlpacaStreamSingleton({
    symbols: [activeSymbol, 'AAPL'],
    enabled: true
  });
  
  const timeframes = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'];
  
  // Handle timeframe changes with smooth transitions
  const handleTimeframeChange = async (timeframe: string) => {
    if (timeframe === selectedTimeframe) return;
    
    setIsLoadingTimeframe(true);
    setSelectedTimeframe(timeframe);
    
    // Don't wait for historical data to load - let it happen in background
    setTimeout(() => {
      setIsLoadingTimeframe(false);
    }, 500); // Show loading for just 500ms, then let chart render with existing data
  };
  
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

  // Create watchlist with REAL data from APIs
  const watchlistStocks = watchlistSymbols.map(sym => {
    const price = watchlistPrices?.find(p => p.symbol === sym);
    const streamPrice = streamData?.[sym];
    
    // Use REAL API data - prioritize stream data, then API data
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
      price: currentPrice > 0 ? currentPrice.toFixed(2) : '0.00',
      change: change >= 0 ? `+${Math.abs(change).toFixed(2)}` : `-${Math.abs(change).toFixed(2)}`,
      changePercent: changePercent >= 0 ? `+${Math.abs(changePercent).toFixed(2)}%` : `-${Math.abs(changePercent).toFixed(2)}%`,
      positive: change >= 0
    };
  });


  // Get current stock info using REAL data from APIs
  const currentStock = stockPrices?.find(s => s.symbol === activeSymbol);
  const streamPrice = streamData?.[activeSymbol];
  
  // Use REAL data from APIs - prioritize stream data, then API data, then fallback
  const currentPrice = streamPrice?.price || currentStock?.price || 0;
  const bidPrice = streamPrice?.bid || currentStock?.bidPrice || (currentPrice * 0.999);
  const askPrice = streamPrice?.ask || currentStock?.askPrice || (currentPrice * 1.001);
  const spread = askPrice - bidPrice;
  const spreadPercent = bidPrice > 0 ? ((spread / bidPrice) * 100) : 0;
  
  // Get REAL OHLC data from historical data or stream data
  const todayData = historicalData?.data?.[0];
  const openPrice = streamPrice?.open || todayData?.open || currentPrice;
  const highPrice = streamPrice?.high || todayData?.high || currentPrice;
  const lowPrice = streamPrice?.low || todayData?.low || currentPrice;
  const closePrice = streamPrice?.close || todayData?.close || currentPrice;
  const volume = streamPrice?.volume || todayData?.volume || 0;
  
  // Calculate change using REAL data
  const previousClose = currentStock?.previousClose || openPrice;
  const change = currentStock?.change || (currentPrice - previousClose);
  const changePercent = currentStock?.changePercent || (previousClose > 0 ? ((change / previousClose) * 100) : 0);
  
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
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
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
          {/* Chart Type Options */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs px-2 py-1 h-7 ${
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
              className={`text-xs px-2 py-1 h-7 ${
                chartType === 'candles' 
                  ? 'bg-green-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => setChartType('candles')}
            >
              Candles
            </Button>
          </div>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          {/* Timeframe Options */}
          <div className="flex items-center space-x-1 relative">
            {isLoadingTimeframe && (
              <div className="absolute inset-0 bg-slate-800/50 rounded-md flex items-center justify-center z-10">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'].map((timeframe) => (
              <Button
                key={timeframe}
                variant="ghost"
                size="sm"
                disabled={isLoadingTimeframe}
                className={`text-xs px-2 py-1 h-7 transition-all duration-200 ${
                  timeframe === selectedTimeframe 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                } ${isLoadingTimeframe ? 'opacity-50' : ''}`}
                onClick={() => handleTimeframeChange(timeframe)}
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
              onClick={() => navigate(`/stock-analysis/${symbol}`)}
            >
              Analysis
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm px-3 py-1 text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => navigate(`/stock-data/${symbol}`)}
            >
              Data
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
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

          {/* Chart Content - Takes full remaining height */}
          <div className="flex-1 bg-slate-900 relative min-h-0">
            {/* Loading overlay for timeframe changes */}
            {(isLoadingTimeframe || historicalLoading) && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-slate-300 text-sm">Loading {selectedTimeframe} data...</div>
                </div>
              </div>
            )}
            
            <div className="absolute inset-0">
              <StockLineChart 
                currentPrice={currentPrice} 
                symbol={activeSymbol} 
                chartType={chartType}
                timeframe={selectedTimeframe}
                historicalData={historicalData}
              />
            </div>
            
            {/* WebSocket Monitor */}
            <div className="absolute bottom-4 right-4 z-10">
              <div className="scale-75 origin-bottom-right">
                <WebSocketMonitor />
              </div>
            </div>
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