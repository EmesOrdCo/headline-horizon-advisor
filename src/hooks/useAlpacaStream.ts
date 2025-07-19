
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
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (!enabled || symbols.length === 0) return;

    setConnectionStatus('connecting');
    
    // Use the full Supabase function URL
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
              toast({
                title: "Authentication Failed",
                description: message.message,
                variant: "destructive",
              });
              break;
              
            case 'market_data':
              // Handle different data types
              if (Array.isArray(message.data)) {
                message.data.forEach((item: any) => {
                  if (item.S) { // Symbol exists
                    setStreamData(prev => ({
                      ...prev,
                      [item.S]: {
                        type: item.T, // Message type (t=trade, q=quote, b=bar)
                        symbol: item.S,
                        price: item.p || item.ap || item.c, // Trade price, ask price, or close price
                        timestamp: item.t,
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
                });
              }
              break;
              
            case 'error':
            case 'disconnected':
              setConnectionStatus('error');
              setIsAuthenticated(false);
              toast({
                title: "Stream Error",
                description: message.message,
                variant: "destructive",
              });
              break;
          }
        } catch (error) {
          console.error('Error parsing stream message:', error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        toast({
          title: "Connection Error",
          description: "Failed to connect to real-time data stream",
          variant: "destructive",
        });
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
  }, [symbols, enabled, toast]);

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
