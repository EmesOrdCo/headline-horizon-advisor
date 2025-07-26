import React from 'react';
import StockLineChart from './StockLineChart';
import { WebSocketMonitor } from '@/components/WebSocketMonitor';
import { useAlpacaStreamSingleton } from '@/hooks/useAlpacaStreamSingleton';

interface LiveTimeGraphProps {
  currentPrice?: number;
  symbol?: string;
}

const LiveTimeGraph: React.FC<LiveTimeGraphProps> = ({ 
  currentPrice = 214.73, 
  symbol = 'AAPL' 
}) => {
  // Set up Alpaca WebSocket for real-time updates
  const { streamData, isConnected } = useAlpacaStreamSingleton({
    symbols: [symbol],
    enabled: true
  });

  // Get current stream data
  const streamPrice = streamData?.[symbol];
  
  // Use consistent base price to match header and all components
  const basePrice = 214.73;
  const activeCurrentPrice = streamPrice?.price || currentPrice || basePrice;
  const openPrice = streamPrice?.open || 213.95;
  const highPrice = streamPrice?.high || 214.95;
  const lowPrice = streamPrice?.low || 212.95;
  const closePrice = streamPrice?.close || activeCurrentPrice;
  const volume = streamPrice?.volume || 57580;
  
  // Calculate change from open price
  const change = activeCurrentPrice - openPrice;
  const changePercent = openPrice > 0 ? ((change / openPrice) * 100) : 0;
  
  // Format volume
  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`;
    return vol.toString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Stock Chart Header - matching Price Chart style */}
      <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <h2 className="text-white text-xl font-bold mb-1">{symbol} Stock Chart</h2>
            <div className="flex items-center space-x-2">
              <span className="text-white text-2xl font-bold">${activeCurrentPrice.toFixed(2)}</span>
              <span className={`text-lg ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
              {isConnected && (
                <div className="flex items-center space-x-2 ml-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm">Live</span>
                  <span className="text-slate-400 text-sm">30pts</span>
                  <span className="text-blue-400 text-sm">Auto</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Controls - matching Price Chart style */}
      <div className="px-4 py-2 bg-slate-800/20 border-b border-slate-700/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-slate-700 text-white rounded">
              Line
            </button>
            <button className="px-3 py-1 text-sm bg-green-600 text-white rounded">
              Candles
            </button>
            <button className="px-3 py-1 text-sm text-slate-400 hover:text-white">
              ← Earlier
            </button>
            <button className="px-3 py-1 text-sm text-slate-400 hover:text-white">
              Later →
            </button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
              Latest •
            </button>
            <span className="text-slate-400 text-sm">1-8 of 8</span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <div>O <span className="text-white">{openPrice.toFixed(2)}</span></div>
            <div>H <span className="text-green-400">{highPrice.toFixed(2)}</span></div>
            <div>L <span className="text-red-400">{lowPrice.toFixed(2)}</span></div>
            <div>C <span className="text-white">{closePrice.toFixed(2)}</span></div>
            <div>Vol <span className="text-blue-400">{formatVolume(volume)}</span></div>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="flex-1 bg-slate-900 min-h-0">
        <StockLineChart currentPrice={activeCurrentPrice} symbol={symbol} />
      </div>

      {/* WebSocket Monitor - positioned like in broker dashboard */}
      <div className="absolute bottom-4 right-4">
        <div className="scale-75 origin-bottom-right">
          <WebSocketMonitor />
        </div>
      </div>
    </div>
  );
};

export default LiveTimeGraph;