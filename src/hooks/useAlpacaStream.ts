
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
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 2; // Reduced to prevent hitting connection limits
  const reconnectDelay = 10000; // Increased to 10 seconds

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
      
      if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setIsAuthenticated(false);
    setErrorMessage('');
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
    setErrorMessage('');
    console.log('Attempting to connect to Alpaca WebSocket for:', symbols[0]);
    
    const wsUrl = `wss://gjtswpgjrznbrnmvmpno.functions.supabase.co/alpaca-stream`;
    
    try {
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        setErrorMessage('');
        reconnectAttemptsRef.current = 0; // Reset retry counter on successful connection
      };

      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'auth_success':
              setIsAuthenticated(true);
              setErrorMessage('');
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
              setErrorMessage(message.message || 'Authentication failed');
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
              
              if (message.message && message.message.includes('connection limit')) {
                setErrorMessage('Connection limit reached. Market data may be temporarily unavailable.');
                console.log('Connection limit reached, will retry with longer delay');
                // Don't schedule immediate reconnect for connection limit errors
                reconnectAttemptsRef.current = maxReconnectAttempts;
              } else {
                setErrorMessage(message.message || 'Stream error occurred');
                console.error('Stream error:', message.message);
                scheduleReconnect();
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing stream message:', error);
          setErrorMessage('Failed to parse stream data');
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
        setIsAuthenticated(false);
        setErrorMessage('WebSocket connection failed');
      };

      socketRef.current.onclose = (event) => {
        console.log('WebSocket disconnected, code:', event.code, 'reason:', event.reason);
        setIsConnected(false);
        setIsAuthenticated(false);
        setConnectionStatus('disconnected');
        
        // Only attempt reconnect if it wasn't a manual close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          scheduleReconnect();
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionStatus('error');
          setErrorMessage('Maximum reconnection attempts reached');
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
      setErrorMessage('Failed to initialize WebSocket connection');
    }
  }, [symbols, enabled, cleanup]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      setConnectionStatus('error');
      setErrorMessage('Connection failed after multiple attempts');
      return;
    }

    if (reconnectTimeoutRef.current) {
      return; // Reconnect already scheduled
    }

    reconnectAttemptsRef.current++;
    const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1); // Exponential backoff
    
    console.log(`Scheduling reconnect attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`);
    setConnectionStatus('connecting');
    setErrorMessage(`Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connect();
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    cleanup();
    setConnectionStatus('disconnected');
    setErrorMessage('');
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
    errorMessage,
    connect,
    disconnect
  };
};
