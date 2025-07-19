
import { useState, useEffect, useRef, useCallback } from 'react';

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
  const [hasShownError, setHasShownError] = useState(false);
  
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!enabled || symbols.length === 0) return;

    setConnectionStatus('connecting');
    console.log('Connecting to Alpaca WebSocket for:', symbols[0]); // Only log first symbol
    
    const wsUrl = `wss://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/alpaca-stream`;
    
    try {
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
      };

      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'auth_success':
              setIsAuthenticated(true);
              console.log('Authenticated, subscribing to:', symbols[0]);
              
              if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                  type: 'subscribe',
                  symbols: [symbols[0]] // Only subscribe to first symbol (AAPL)
                }));
              }
              break;
              
            case 'auth_error':
              setConnectionStatus('error');
              setIsAuthenticated(false);
              console.error('Authentication failed:', message.message);
              if (!hasShownError) {
                setHasShownError(true);
              }
              break;
              
            case 'market_data':
              if (Array.isArray(message.data)) {
                message.data.forEach((item: any) => {
                  if (item.S === symbols[0]) { // Only process first symbol
                    const price = item.p || item.ap || item.bp || item.c;
                    if (price) {
                      setStreamData(prev => ({
                        ...prev,
                        [item.S]: {
                          type: item.T,
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
              console.error('Stream error:', message.message);
              if (!hasShownError) {
                setHasShownError(true);
              }
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
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsAuthenticated(false);
        setConnectionStatus('disconnected');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [symbols, enabled, hasShownError]);

  const disconnect = useCallback(() => {
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
