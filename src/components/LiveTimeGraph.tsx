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
import { useAlpacaStreamSingleton } from '@/hooks/useAlpacaStreamSingleton';
import { WebSocketMonitor } from '@/components/WebSocketMonitor';

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
  sandbox?: boolean;
  simulated?: boolean;
  source?: string;
}

interface LiveTimeGraphProps {
  streamData?: Record<string, StreamData>;
  symbols?: string[];
  isConnected?: boolean;
}

const LiveTimeGraph: React.FC<LiveTimeGraphProps> = () => {
  // Use the hook directly to get real data
  const { streamData, isConnected, errorMessage, connect } = useAlpacaStreamSingleton({ 
    symbols: ['AAPL'], 
    enabled: true 
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [priceHistory, setPriceHistory] = useState<Array<{price: number, timestamp: string | number}>>([]);

  // Update price history when new data comes in
  useEffect(() => {
    if (streamData['AAPL']?.price && streamData['AAPL']?.timestamp) {
      setPriceHistory(prev => {
        const newHistory = [...prev, { 
          price: streamData['AAPL'].price!, 
          timestamp: streamData['AAPL'].timestamp! 
        }].slice(-10); // Keep only last 10 data points
        return newHistory;
      });
    }
  }, [streamData]);

  // Generate initial nodes and update based on real-time data
  useEffect(() => {
    const data = streamData['AAPL'];
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Main AAPL symbol node - ALWAYS show this
    const symbolNode: Node = {
      id: 'symbol-AAPL',
      type: 'default',
      position: { x: 100, y: 50 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-lg">AAPL</div>
            <div className={`text-sm ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
              {isConnected ? '🟢 Live' : '🔴 Disconnected'}
            </div>
            {data?.sandbox && (
              <div className="text-xs text-blue-400">
                Sandbox
              </div>
            )}
          </div>
        )
      },
      style: {
        background: isConnected ? '#f0f9ff' : '#f3f4f6',
        border: `2px solid ${isConnected ? '#0ea5e9' : '#9ca3af'}`,
        borderRadius: '12px',
        width: 140,
        height: 100,
      }
    };
    newNodes.push(symbolNode);

    // WebSocket status node - ALWAYS show this
    const statusNode: Node = {
      id: 'websocket-status',
      type: 'default',
      position: { x: 300, y: 50 },
      data: {
        label: (
          <div className="text-center">
            <div className="text-xs text-gray-600">WebSocket</div>
            <div className={`font-bold text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            {errorMessage && (
              <div className="text-xs text-red-500 mt-1 truncate max-w-[120px]">
                {errorMessage.substring(0, 30)}...
              </div>
            )}
          </div>
        )
      },
      style: {
        background: isConnected ? '#f0fdf4' : '#fef2f2',
        border: `2px solid ${isConnected ? '#22c55e' : '#ef4444'}`,
        borderRadius: '8px',
        width: 140,
        height: 80,
      }
    };
    newNodes.push(statusNode);

    // Connect symbol to status
    newEdges.push({
      id: 'e-symbol-status',
      source: 'symbol-AAPL',
      target: 'websocket-status',
      type: 'smoothstep',
      animated: isConnected,
      style: { 
        stroke: isConnected ? '#22c55e' : '#ef4444', 
        strokeWidth: 2,
        strokeDasharray: isConnected ? '' : '5,5'
      }
    });

    // Price node - only show if we have price data
    if (data?.price) {
      const priceNode: Node = {
        id: 'price-AAPL',
        type: 'default',
        position: { x: 500, y: 50 },
        data: {
          label: (
            <div className="text-center">
              <div className="text-xs text-gray-600">Current Price</div>
              <div className="font-bold text-lg text-green-600">
                ${data.price.toFixed(2)}
              </div>
              {data.source && (
                <div className="text-xs text-gray-500">
                  {data.source}
                </div>
              )}
            </div>
          )
        },
        style: {
          background: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '8px',
          width: 140,
          height: 80,
        }
      };
      newNodes.push(priceNode);

      // Connect status to price
      newEdges.push({
        id: 'e-status-price',
        source: 'websocket-status',
        target: 'price-AAPL',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#22c55e', strokeWidth: 2 }
      });
    }

    // Volume node
    if (data?.volume) {
      const volumeNode: Node = {
        id: 'volume-AAPL',
        type: 'default',
        position: { x: 500, y: 50 },
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
          width: 120,
          height: 60,
        }
      };
      newNodes.push(volumeNode);

      // Connect symbol to volume
      newEdges.push({
        id: 'e-symbol-volume',
        source: 'symbol-AAPL',
        target: 'volume-AAPL',
        type: 'smoothstep',
        style: { stroke: '#3b82f6', strokeWidth: 2 }
      });
    }

    // Bid/Ask nodes
    if (data?.bid && data?.ask) {
      const bidNode: Node = {
        id: 'bid-AAPL',
        type: 'default',
        position: { x: 150, y: 200 },
        data: {
          label: (
            <div className="text-center">
              <div className="text-xs text-gray-600">Bid</div>
              <div className="font-bold text-sm text-red-600">
                ${data.bid.toFixed(2)}
              </div>
            </div>
          )
        },
        style: {
          background: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          width: 100,
          height: 60,
        }
      };

      const askNode: Node = {
        id: 'ask-AAPL',
        type: 'default',
        position: { x: 350, y: 200 },
        data: {
          label: (
            <div className="text-center">
              <div className="text-xs text-gray-600">Ask</div>
              <div className="font-bold text-sm text-green-600">
                ${data.ask.toFixed(2)}
              </div>
            </div>
          )
        },
        style: {
          background: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '8px',
          width: 100,
          height: 60,
        }
      };

      newNodes.push(bidNode, askNode);

      // Connect to bid/ask
      newEdges.push(
        {
          id: 'e-price-bid',
          source: 'price-AAPL',
          target: 'bid-AAPL',
          type: 'smoothstep',
          style: { stroke: '#ef4444', strokeWidth: 1.5 }
        },
        {
          id: 'e-price-ask',
          source: 'price-AAPL',
          target: 'ask-AAPL',
          type: 'smoothstep',
          style: { stroke: '#22c55e', strokeWidth: 1.5 }
        }
      );
    }

    // Price history nodes (mini chart effect)
    if (priceHistory.length > 1) {
      priceHistory.slice(-5).forEach((point, pointIndex) => {
        const historyNode: Node = {
          id: `history-${pointIndex}`,
          type: 'default',
          position: { 
            x: 100 + pointIndex * 80, 
            y: 350 
          },
          data: {
            label: (
              <div className="text-xs text-center">
                <div className="font-semibold">${point.price.toFixed(2)}</div>
                <div className="text-xs text-gray-500">
                  {new Date(point.timestamp).toLocaleTimeString().slice(0, 8)}
                </div>
              </div>
            )
          },
          style: {
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            width: 70,
            height: 50,
            fontSize: '10px'
          }
        };
        newNodes.push(historyNode);

        // Connect previous point to current (creating a chain)
        if (pointIndex > 0) {
          newEdges.push({
            id: `e-history-${pointIndex}`,
            source: `history-${pointIndex - 1}`,
            target: `history-${pointIndex}`,
            type: 'straight',
            animated: true,
            style: { stroke: '#f59e0b', strokeWidth: 2 }
          });
        }

        // Connect price node to first history node
        if (pointIndex === 0 && data?.price) {
          newEdges.push({
            id: 'e-price-history',
            source: 'price-AAPL',
            target: 'history-0',
            type: 'smoothstep',
            style: { stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '5,5' }
          });
        }
      });
    }

    // Timestamp node
    if (data?.timestamp) {
      const timestampNode: Node = {
        id: 'timestamp-AAPL',
        type: 'default',
        position: { x: 300, y: 450 },
        data: {
          label: (
            <div className="text-center">
              <div className="text-xs text-gray-600">Last Update</div>
              <div className="font-bold text-xs text-purple-600">
                {new Date(data.timestamp).toLocaleTimeString()}
              </div>
              {data.simulated && (
                <div className="text-xs text-orange-500">
                  Simulated
                </div>
              )}
            </div>
          )
        },
        style: {
          background: '#faf5ff',
          border: '2px solid #a855f7',
          borderRadius: '8px',
          width: 140,
          height: 70,
        }
      };
      newNodes.push(timestampNode);
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [streamData, isConnected, priceHistory, setNodes, setEdges]);

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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Live Market Data Flow</h3>
            <p className="text-sm text-muted-foreground">
              Real-time websocket data visualization • {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
            {errorMessage && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-red-500">{errorMessage}</p>
                <button 
                  onClick={connect}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <WebSocketMonitor />
            <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-medium">
              📊 Sandbox Test Data (FAKEPACA → AAPL)
            </span>
            <span className="text-xs px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 font-medium">
              ⚠️ Simulated
            </span>
          </div>
        </div>
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