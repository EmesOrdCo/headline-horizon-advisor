
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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

interface UseAlpacaStreamProps {
  symbols: string[];
  enabled?: boolean;
}

export const useAlpacaStream = ({ symbols, enabled = true }: UseAlpacaStreamProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [streamData, setStreamData] = useState<Record<string, StreamData>>({});
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (!enabled || symbols.length === 0) return;

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setConnectionStatus('connecting');
    
    const wsUrl = `wss://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/alpaca-stream`;
    
    try {
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('Connected to Alpaca stream');
        setIsConnected(true);
        setConnectionStatus('connected');
      };

      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);
          
          switch (message.type) {
            case 'auth_success':
              setIsAuthenticated(true);
              console.log('Stream authenticated, subscribing to symbols:', symbols);
              
              // Subscribe to symbols after authentication
              socketRef.current?.send(JSON.stringify({
                type: 'subscribe',
                symbols: symbols
              }));
              
              toast({
                title: "Connected",
                description: "Real-time market data stream connected",
              });
              break;
              
            case 'auth_error':
              setConnectionStatus('error');
              setIsAuthenticated(false);
              toast({
                title: "Authentication Failed",
                description: message.message || "Failed to authenticate with market data provider",
                variant: "destructive",
              });
              break;
              
            case 'market_data':
              // Handle market data
              if (Array.isArray(message.data)) {
                message.data.forEach((item: any) => {
                  if (item.S) { // Symbol exists
                    const price = item.p || item.ap || item.bp || item.c; // Trade, ask, bid, or close price
                    if (price) {
                      setStreamData(prev => ({
                        ...prev,
                        [item.S]: {
                          type: item.T, // Message type (t=trade, q=quote, b=bar)
                          symbol: item.S,
                          price: price,
                          timestamp: item.t ? new Date(item.t / 1000000).toISOString() : new Date().toISOString(),
                          volume: item.s || item.v,
                          bid: item.bp,
                          ask: item.ap,
                          open: item.o,
                          high: item.h,
                          low: item.l,
                          close: item.c
                        }
                      }));
                    }
                  }
                });
              }
              break;
              
            case 'error':
              setConnectionStatus('error');
              setIsAuthenticated(false);
              toast({
                title: "Stream Error",
                description: message.message || "Connection error occurred",
                variant: "destructive",
              });
              
              // Attempt to reconnect after 5 seconds
              reconnectTimeoutRef.current = setTimeout(() => {
                if (enabled) {
                  console.log('Attempting to reconnect...');
                  connect();
                }
              }, 5000);
              break;
              
            case 'disconnected':
              setConnectionStatus('disconnected');
              setIsAuthenticated(false);
              console.log('Stream disconnected:', message.message);
              
              // Attempt to reconnect after 3 seconds
              reconnectTimeoutRef.current = setTimeout(() => {
                if (enabled) {
                  console.log('Attempting to reconnect after disconnection...');
                  connect();
                }
              }, 3000);
              break;
          }
        } catch (error) {
          console.error('Error parsing stream message:', error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
        setIsAuthenticated(false);
        
        toast({
          title: "Connection Error",
          description: "Failed to connect to real-time data stream. Retrying...",
          variant: "destructive",
        });
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (enabled) {
            console.log('Attempting to reconnect after error...');
            connect();
          }
        }, 5000);
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsAuthenticated(false);
        if (connectionStatus !== 'error') {
          setConnectionStatus('disconnected');
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [symbols, enabled, toast, connectionStatus]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
    setIsAuthenticated(false);
    setConnectionStatus('disconnected');
  }, []);

  useEffect(() => {
    if (enabled && symbols.length > 0) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [symbols, enabled, connect, disconnect]);

  return {
    isConnected,
    isAuthenticated,
    connectionStatus,
    streamData,
    connect,
    disconnect
  };
};
