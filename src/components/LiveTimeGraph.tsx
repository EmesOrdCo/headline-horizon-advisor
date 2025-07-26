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
  symbol = 'CRM' 
}) => {
  // Set up Alpaca WebSocket for real-time updates for both CRM and AAPL
  const { streamData, isConnected } = useAlpacaStreamSingleton({
    symbols: [symbol, 'AAPL'],
    enabled: true
  });

  // CRM Data
  const crmStreamPrice = streamData?.[symbol];
  const basePrice = 214.73;
  const crmCurrentPrice = crmStreamPrice?.price || currentPrice || basePrice;
  const crmOpenPrice = crmStreamPrice?.open || 213.95;
  const crmHighPrice = crmStreamPrice?.high || 214.95;
  const crmLowPrice = crmStreamPrice?.low || 212.95;
  const crmClosePrice = crmStreamPrice?.close || crmCurrentPrice;
  const crmVolume = crmStreamPrice?.volume || 57580;
  
  // Calculate CRM change from open price
  const crmChange = crmCurrentPrice - crmOpenPrice;
  const crmChangePercent = crmOpenPrice > 0 ? ((crmChange / crmOpenPrice) * 100) : 0;

  // AAPL Data
  const aaplStreamPrice = streamData?.['AAPL'];
  const aaplBasePrice = 214.73;
  const aaplCurrentPrice = aaplStreamPrice?.price || aaplBasePrice;
  const aaplOpenPrice = aaplStreamPrice?.open || 213.95;
  const aaplHighPrice = aaplStreamPrice?.high || 214.95;
  const aaplLowPrice = aaplStreamPrice?.low || 212.95;
  const aaplClosePrice = aaplStreamPrice?.close || aaplCurrentPrice;
  const aaplVolume = aaplStreamPrice?.volume || 57580;
  
  // Calculate AAPL change from open price
  const aaplChange = aaplCurrentPrice - aaplOpenPrice;
  const aaplChangePercent = aaplOpenPrice > 0 ? ((aaplChange / aaplOpenPrice) * 100) : 0;
  
  // Format volume
  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`;
    return vol.toString();
  };

  const renderChart = (stockSymbol: string, stockCurrentPrice: number, stockOpenPrice: number, stockHighPrice: number, stockLowPrice: number, stockClosePrice: number, stockVolume: number, stockChange: number, stockChangePercent: number) => (
    <div className="flex flex-col h-[400px]">
      {/* Stock Chart Header - matching Price Chart style */}
      <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <h2 className="text-white text-xl font-bold mb-1">{stockSymbol} Stock Chart</h2>
            <div className="flex items-center space-x-2">
              <span className="text-white text-2xl font-bold">${stockCurrentPrice.toFixed(2)}</span>
              <span className={`text-lg ${stockChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stockChange >= 0 ? '+' : ''}{stockChange.toFixed(2)} ({stockChange >= 0 ? '+' : ''}{stockChangePercent.toFixed(2)}%)
              </span>
              {isConnected && (
                <div className="flex items-center space-x-2 ml-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm">Live</span>
                  <span className="text-slate-400 text-sm">{stockSymbol === 'AAPL' ? '600pts' : '30pts'}</span>
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
            <div>O <span className="text-white">{stockOpenPrice.toFixed(2)}</span></div>
            <div>H <span className="text-green-400">{stockHighPrice.toFixed(2)}</span></div>
            <div>L <span className="text-red-400">{stockLowPrice.toFixed(2)}</span></div>
            <div>C <span className="text-white">{stockClosePrice.toFixed(2)}</span></div>
            <div>Vol <span className="text-blue-400">{formatVolume(stockVolume)}</span></div>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="flex-1 bg-slate-900 min-h-0">
        <StockLineChart currentPrice={stockCurrentPrice} symbol={stockSymbol} />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-900">
      {/* CRM Chart */}
      {renderChart(symbol, crmCurrentPrice, crmOpenPrice, crmHighPrice, crmLowPrice, crmClosePrice, crmVolume, crmChange, crmChangePercent)}
      
      {/* AAPL Chart */}
      {renderChart('AAPL', aaplCurrentPrice, aaplOpenPrice, aaplHighPrice, aaplLowPrice, aaplClosePrice, aaplVolume, aaplChange, aaplChangePercent)}

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