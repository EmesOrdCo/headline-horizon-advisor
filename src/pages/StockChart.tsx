import React, { useState, useEffect, useRef } from 'react';
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
import { WebSocketMonitor } from '@/components/WebSocketMonitor';
import { useStockPrices } from "@/hooks/useStockPrices";
import { useAlpacaStreamSingleton } from "@/hooks/useAlpacaStreamSingleton";

// TradingView Widget Component
const TradingViewWidget: React.FC<{ symbol: string; theme: 'light' | 'dark' }> = ({ symbol, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${symbol}",
        "timezone": "Etc/UTC",
        "theme": "${theme}",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "withdateranges": true,
        "range": "YTD",
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "details": true,
        "hotlist": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }`;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  return (
    <div className="tradingview-widget-container w-full h-full">
      <div ref={containerRef} className="tradingview-widget-container__widget w-full h-full"></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

const StockChart: React.FC = () => {
  
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [chartType, setChartType] = useState<'line' | 'candles'>('candles');
  
  // Fetch current stock data and historical data - use SPY as it has extended hours trading
  const activeSymbol = symbol || 'AAPL';
  const { data: stockPrices } = useStockPrices([activeSymbol]);
  
  // Fetch watchlist data - include globally traded assets
  const watchlistSymbols = ['SPY', 'QQQ', 'GLD', 'TLT', 'EEM', 'IWM', 'XLF'];
  const { data: watchlistPrices } = useStockPrices(watchlistSymbols);
  
  // Set up Alpaca WebSocket for real-time updates - include AAPL for Live Data Flow
  const { streamData, isConnected } = useAlpacaStreamSingleton({
    symbols: [activeSymbol, ...watchlistSymbols],
    enabled: true
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

  // Create watchlist with REAL data from APIs
  const watchlistStocks = watchlistSymbols.map(sym => {
    const price = watchlistPrices?.find(p => p.symbol === sym);
    const streamPrice = streamData?.[sym];
    
    // Use REAL API data - prioritize stream data, then API data
    const currentPrice = streamPrice?.price || price?.price || 0;
    const change = price?.change || 0;
    const changePercent = price?.changePercent || 0;
    
    return {
      symbol: sym,
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
  
  // Calculate change using REAL data
  const previousClose = currentStock?.previousClose || currentPrice;
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
      {/* Top Navigation Bar - Exact replica */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-4">
          {/* Stock Symbol with Icon */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{activeSymbol?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-lg">{activeSymbol}</span>
              <span className="text-slate-400 text-sm">{selectedTimeframe}</span>
              <span className="text-slate-400 text-sm">{exchange}</span>
              <span className="text-slate-400 text-sm">•</span>
              {isConnected && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live data" />
              )}
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
                chartType === 'candles' ? 'bg-green-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
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

          {/* Indicators Button */}
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
        </div>
      </div>

      {/* Price Header - EXACT replica */}
      <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <span className="text-white text-2xl font-bold">{currentPrice.toFixed(2)}</span>
              <span className={`px-2 py-1 text-sm rounded ${change >= 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="flex space-x-6 text-sm">
              <div className="text-slate-400">O <span className="text-white">{currentPrice.toFixed(2)}</span></div>
              <div className="text-slate-400">H <span className="text-white">{currentPrice.toFixed(2)}</span></div>
              <div className="text-slate-400">L <span className="text-white">{currentPrice.toFixed(2)}</span></div>
              <div className="text-slate-400">C <span className="text-white">{currentPrice.toFixed(2)}</span></div>
              <div className="text-slate-400">Vol <span className="text-blue-400">{formatVolume(1000000)}</span></div>
            </div>
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
          {/* TradingView Chart */}
          <div className="flex-1 bg-slate-900 relative min-h-0">
            <TradingViewWidget symbol={activeSymbol} theme="dark" />
            
            {/* WebSocket Monitor */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className="scale-75 origin-bottom-left">
                <WebSocketMonitor />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StockChart;