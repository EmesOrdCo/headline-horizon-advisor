import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface StreamData {
  type: string;
  symbol?: string;
  price?: number;
  timestamp?: string;
  volume?: number;
  bid?: number;
  ask?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

interface LiveTimeGraphProps {
  streamData: Record<string, StreamData>;
  symbols: string[];
  isConnected: boolean;
}

const LiveTimeGraph: React.FC<LiveTimeGraphProps> = ({
  streamData,
  symbols,
  isConnected
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [priceHistory, setPriceHistory] = useState<Record<string, Array<{price: number, timestamp: string | number}>>>({});

  // Add mock data when disconnected to demonstrate the visualization
  const mockStreamData = isConnected ? {} : {
    [symbols[0]]: {
      type: 'trade',
      symbol: symbols[0],
      price: 213.96,
      timestamp: new Date().toISOString(),
      volume: 1000000,
      bid: 212.90,
      ask: 215.00,
      open: 212.48,
      high: 215.78,
      low: 212.10,
      close: 213.96
    }
  };

  const displayData = isConnected ? streamData : mockStreamData;
  useEffect(() => {
    Object.entries(streamData).forEach(([symbol, data]) => {
      if (data.price && data.timestamp) {
        setPriceHistory(prev => {
          const currentHistory = prev[symbol] || [];
          const newHistory = [...currentHistory, { price: data.price, timestamp: data.timestamp }]
            .slice(-20); // Keep only last 20 data points
          
          return {
            ...prev,
            [symbol]: newHistory
          };
        });
      }
    });
  }, [streamData]);

  // Generate nodes and edges based on real-time data
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    symbols.forEach((symbol, index) => {
      const data = displayData[symbol];
      const history = priceHistory[symbol] || [];
      
      // Main symbol node
      const symbolNode: Node = {
        id: `symbol-${symbol}`,
        type: 'default',
        position: { x: 50 + index * 300, y: 50 },
        data: {
          label: (
            <div className="text-center">
              <div className="font-bold text-lg">{symbol}</div>
              <div className={`text-sm ${data ? 'text-green-600' : 'text-gray-400'}`}>
                {isConnected ? '🟢 Live' : '🔴 Disconnected'}
              </div>
            </div>
          )
        },
        style: {
          background: isConnected ? '#f0f9ff' : '#f3f4f6',
          border: `2px solid ${isConnected ? '#0ea5e9' : '#9ca3af'}`,
          borderRadius: '12px',
          width: 120,
          height: 80,
        }
      };
      newNodes.push(symbolNode);

      // Price node
      if (data && data.price) {
        const priceNode: Node = {
          id: `price-${symbol}`,
          type: 'default',
          position: { x: 50 + index * 300, y: 160 },
          data: {
            label: (
              <div className="text-center">
                <div className="text-xs text-gray-600">Current Price</div>
                <div className="font-bold text-lg text-green-600">
                  ${data.price.toFixed(2)}
                </div>
              </div>
            )
          },
          style: {
            background: '#f0fdf4',
            border: '2px solid #22c55e',
            borderRadius: '8px',
            width: 120,
            height: 60,
          }
        };
        newNodes.push(priceNode);

        // Connect symbol to price
        newEdges.push({
          id: `e-${symbol}-price`,
          source: `symbol-${symbol}`,
          target: `price-${symbol}`,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#22c55e', strokeWidth: 2 }
        });
      }

      // Volume node
      if (data && data.volume) {
        const volumeNode: Node = {
          id: `volume-${symbol}`,
          type: 'default',
          position: { x: 200 + index * 300, y: 160 },
          data: {
            label: (
              <div className="text-center">
                <div className="text-xs text-gray-600">Volume</div>
                <div className="font-bold text-sm text-blue-600">
                  {data.volume.toLocaleString()}
                </div>
              </div>
            )
          },
          style: {
            background: '#eff6ff',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            width: 100,
            height: 60,
          }
        };
        newNodes.push(volumeNode);

        // Connect symbol to volume
        newEdges.push({
          id: `e-${symbol}-volume`,
          source: `symbol-${symbol}`,
          target: `volume-${symbol}`,
          type: 'smoothstep',
          style: { stroke: '#3b82f6', strokeWidth: 2 }
        });
      }

      // Price history nodes (mini chart effect)
      if (history.length > 1) {
        history.slice(-5).forEach((point, pointIndex) => {
          const historyNode: Node = {
            id: `history-${symbol}-${pointIndex}`,
            type: 'default',
            position: { 
              x: 50 + index * 300 + pointIndex * 25, 
              y: 280 
            },
            data: {
              label: (
                <div className="text-xs text-center">
                  <div>${point.price.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(point.timestamp).toLocaleTimeString().slice(0, 5)}
                  </div>
                </div>
              )
            },
            style: {
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '6px',
              width: 60,
              height: 50,
              fontSize: '10px'
            }
          };
          newNodes.push(historyNode);

          // Connect previous point to current (creating a chain)
          if (pointIndex > 0) {
            newEdges.push({
              id: `e-history-${symbol}-${pointIndex}`,
              source: `history-${symbol}-${pointIndex - 1}`,
              target: `history-${symbol}-${pointIndex}`,
              type: 'straight',
              style: { stroke: '#f59e0b', strokeWidth: 1 }
            });
          }

          // Connect price node to first history node
          if (pointIndex === 0) {
            newEdges.push({
              id: `e-price-history-${symbol}`,
              source: `price-${symbol}`,
              target: `history-${symbol}-0`,
              type: 'smoothstep',
              style: { stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '5,5' }
            });
          }
        });
      }

      // Timestamp node
      if (data && data.timestamp) {
        const timestampNode: Node = {
          id: `timestamp-${symbol}`,
          type: 'default',
          position: { x: 50 + index * 300, y: 360 },
          data: {
            label: (
              <div className="text-center">
                <div className="text-xs text-gray-600">Last Update</div>
                <div className="font-bold text-xs text-purple-600">
                  {new Date(data.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )
          },
          style: {
            background: '#faf5ff',
            border: '2px solid #a855f7',
            borderRadius: '8px',
            width: 120,
            height: 50,
          }
        };
        newNodes.push(timestampNode);
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [displayData, symbols, priceHistory, isConnected, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeClassName = useCallback((node: Node) => {
    if (node.id.includes('symbol')) return 'symbol-node';
    if (node.id.includes('price')) return 'price-node';
    if (node.id.includes('volume')) return 'volume-node';
    if (node.id.includes('history')) return 'history-node';
    if (node.id.includes('timestamp')) return 'timestamp-node';
    return 'default-node';
  }, []);

  return (
    <div className="w-full h-[600px] border border-border rounded-lg bg-background">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Live Market Data Flow</h3>
        <p className="text-sm text-muted-foreground">
          Real-time websocket data visualization • {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </p>
      </div>
      <div className="h-[540px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-left"
          style={{ background: 'hsl(var(--background))' }}
        >
          <MiniMap 
            zoomable 
            pannable 
            nodeClassName={nodeClassName}
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))'
            }}
          />
          <Controls 
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))'
            }}
          />
          <Background 
            gap={20} 
            size={1}
            style={{ background: 'hsl(var(--muted/20))' }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default LiveTimeGraph;