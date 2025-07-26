import React from 'react';
import StockLineChart from './StockLineChart';
import { WebSocketMonitor } from '@/components/WebSocketMonitor';

const LiveTimeGraph: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <WebSocketMonitor />
      </div>
      <StockLineChart />
    </div>
  );
};

export default LiveTimeGraph;