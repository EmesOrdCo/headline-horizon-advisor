
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
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const reconnectDelay = 5000; // 5 seconds

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onerror = null;
      socketRef.current.onclose = null;
      
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setIsAuthenticated(false);
  }, []);

  const connect = useCallback(() => {
    if (!enabled || symbols.length === 0) {
      setConnectionStatus('disconnected');
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (socketRef.current && socketRef.current.readyState === WebSocket.CONNECTING) {
      console.log('Connection attempt already in progress');
      return;
    }

    // Clean up any existing connection
    cleanup();

    setConnectionStatus('connecting');
    console.log('Attempting to connect to Alpaca WebSocket for:', symbols[0]);
    
    const wsUrl = `wss://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/alpaca-stream`;
    
    try {
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0; // Reset retry counter on successful connection
      };

      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'auth_success':
              setIsAuthenticated(true);
              console.log('Authenticated successfully, subscribing to:', symbols[0]);
              
              if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                  type: 'subscribe',
                  symbols: [symbols[0]]
                }));
              }
              break;
              
            case 'auth_error':
              setConnectionStatus('error');
              setIsAuthenticated(false);
              console.error('Authentication failed:', message.message);
              
              // Don't retry if authentication fails
              reconnectAttemptsRef.current = maxReconnectAttempts;
              break;
              
            case 'market_data':
              if (Array.isArray(message.data)) {
                message.data.forEach((item: any) => {
                  if (item.S === symbols[0]) {
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
              
              // Check if it's a connection limit error
              if (message.message && message.message.includes('connection limit')) {
                console.log('Connection limit reached, will retry with delay');
                scheduleReconnect();
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

      socketRef.current.onclose = (event) => {
        console.log('WebSocket disconnected, code:', event.code, 'reason:', event.reason);
        setIsConnected(false);
        setIsAuthenticated(false);
        setConnectionStatus('disconnected');
        
        // Only attempt reconnect if it wasn't a manual close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [symbols, enabled, cleanup]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      setConnectionStatus('error');
      return;
    }

    if (reconnectTimeoutRef.current) {
      return; // Reconnect already scheduled
    }

    reconnectAttemptsRef.current++;
    const delay = reconnectDelay * reconnectAttemptsRef.current; // Exponential backoff
    
    console.log(`Scheduling reconnect attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connect();
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    cleanup();
    setConnectionStatus('disconnected');
  }, [cleanup]);

  useEffect(() => {
    if (enabled && symbols.length > 0) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      cleanup();
    };
  }, [symbols, enabled, connect, disconnect, cleanup]);

  return {
    isConnected,
    isAuthenticated,
    connectionStatus,
    streamData,
    connect,
    disconnect
  };
};
