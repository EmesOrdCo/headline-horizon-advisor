import React from 'react';
import StockLineChart from './StockLineChart';
import { WebSocketMonitor } from '@/components/WebSocketMonitor';

interface LiveTimeGraphProps {
  currentPrice?: number;
  symbol?: string;
}

const LiveTimeGraph: React.FC<LiveTimeGraphProps> = ({ 
  currentPrice = 214.73, 
  symbol = 'AAPL' 
}) => {
  return (
    <div className="space-y-4">
      <StockLineChart currentPrice={currentPrice} symbol={symbol} />
      <div className="flex justify-end">
        <div className="scale-75 origin-bottom-right">
          <WebSocketMonitor />
        </div>
      </div>
    </div>
  );
};

export default LiveTimeGraph;