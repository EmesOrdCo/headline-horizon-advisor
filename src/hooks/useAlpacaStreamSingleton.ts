
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

// Singleton WebSocket connection manager
class AlpacaStreamManager {
  private static instance: AlpacaStreamManager;
  private socket: WebSocket | null = null;
  private subscribers: Map<string, (data: Record<string, StreamData>) => void> = new Map();
  private streamData: Record<string, StreamData> = {};
  private subscribedSymbols: Set<string> = new Set();
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private isAuthenticated = false;
  private errorMessage = '';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 1; // Reduced to 1 to avoid spam
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false; // Add flag to prevent multiple simultaneous connections

  static getInstance(): AlpacaStreamManager {
    if (!AlpacaStreamManager.instance) {
      AlpacaStreamManager.instance = new AlpacaStreamManager();
    }
    return AlpacaStreamManager.instance;
  }

  subscribe(id: string, callback: (data: Record<string, StreamData>) => void, symbols: string[]) {
    this.subscribers.set(id, callback);
    
    // Add new symbols to subscription
    const newSymbols = symbols.filter(symbol => !this.subscribedSymbols.has(symbol));
    newSymbols.forEach(symbol => this.subscribedSymbols.add(symbol));

    // Connect if not already connected or connecting
    if (this.connectionStatus === 'disconnected' && this.subscribedSymbols.size > 0 && !this.isConnecting) {
      this.connect();
    }

    // Subscribe to new symbols if connected
    if (this.socket && this.isAuthenticated && newSymbols.length > 0) {
      this.socket.send(JSON.stringify({
        type: 'subscribe',
        symbols: newSymbols
      }));
    }

    // Send current data immediately
    callback(this.streamData);
  }

  unsubscribe(id: string, symbols: string[]) {
    this.subscribers.delete(id);
    
    // Remove symbols if no other subscribers need them
    symbols.forEach(symbol => {
      this.subscribedSymbols.delete(symbol);
      delete this.streamData[symbol];
    });

    // Disconnect if no subscribers
    if (this.subscribers.size === 0) {
      this.disconnect();
    }
  }

  getStatus() {
    return {
      connectionStatus: this.connectionStatus,
      isConnected: this.connectionStatus === 'connected',
      isAuthenticated: this.isAuthenticated,
      errorMessage: this.errorMessage,
      streamData: this.streamData
    };
  }

  private connect() {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('Singleton: Connection attempt already in progress, skipping');
      return;
    }

    this.isConnecting = true;
    this.cleanup();
    this.connectionStatus = 'connecting';
    this.errorMessage = '';
    this.notifySubscribers();

    console.log('Singleton: Attempting WebSocket connection');
    
    const wsUrl = `wss://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/alpaca-stream`;
    
    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('Singleton: WebSocket connected successfully');
        this.connectionStatus = 'connected';
        this.errorMessage = '';
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.notifySubscribers();
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'auth_success':
              this.isAuthenticated = true;
              this.errorMessage = '';
              console.log('Singleton: Authenticated successfully, subscribing to:', Array.from(this.subscribedSymbols));
              
              if (this.socket?.readyState === WebSocket.OPEN && this.subscribedSymbols.size > 0) {
                this.socket.send(JSON.stringify({
                  type: 'subscribe',
                  symbols: Array.from(this.subscribedSymbols)
                }));
              }
              this.notifySubscribers();
              break;
              
            case 'auth_error':
              this.connectionStatus = 'error';
              this.isAuthenticated = false;
              this.isConnecting = false;
              this.errorMessage = message.message || 'Authentication failed';
              console.error('Singleton: Authentication failed:', message.message);
              // Don't retry auth errors
              this.reconnectAttempts = this.maxReconnectAttempts;
              this.notifySubscribers();
              break;
              
            case 'market_data':
              if (Array.isArray(message.data)) {
                message.data.forEach((item: any) => {
                  if (this.subscribedSymbols.has(item.S)) {
                    const price = item.p || item.ap || item.bp || item.c;
                    if (price) {
                      this.streamData[item.S] = {
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
                      };
                    }
                  }
                });
                this.notifySubscribers();
              }
              break;
              
            case 'error':
              this.connectionStatus = 'error';
              this.isAuthenticated = false;
              this.isConnecting = false;
              
              if (message.message && message.message.includes('connection limit')) {
                this.errorMessage = 'Connection limit reached. Real-time data unavailable.';
                console.log('Singleton: Connection limit reached - stopping retries');
                // Stop all retry attempts for connection limit errors
                this.reconnectAttempts = this.maxReconnectAttempts;
              } else {
                this.errorMessage = message.message || 'Stream error occurred';
                console.error('Singleton: Stream error:', message.message);
              }
              this.notifySubscribers();
              break;
          }
        } catch (error) {
          console.error('Singleton: Error parsing stream message:', error);
          this.errorMessage = 'Failed to parse stream data';
          this.notifySubscribers();
        }
      };

      this.socket.onerror = (error) => {
        console.error('Singleton: WebSocket error:', error);
        this.connectionStatus = 'error';
        this.isConnected = false;
        this.isAuthenticated = false;
        this.isConnecting = false;
        this.errorMessage = 'WebSocket connection failed';
        this.notifySubscribers();
      };

      this.socket.onclose = (event) => {
        console.log('Singleton: WebSocket disconnected, code:', event.code);
        this.isAuthenticated = false;
        this.isConnecting = false;
        
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts && this.subscribers.size > 0) {
          this.connectionStatus = 'connecting';
          this.scheduleReconnect();
        } else {
          this.connectionStatus = 'error';
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.errorMessage = 'Connection failed. Real-time data unavailable.';
          }
        }
        this.notifySubscribers();
      };

    } catch (error) {
      console.error('Singleton: Failed to create WebSocket connection:', error);
      this.connectionStatus = 'error';
      this.isConnecting = false;
      this.errorMessage = 'Failed to initialize WebSocket connection';
      this.notifySubscribers();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || this.reconnectTimeout) {
      return;
    }

    this.reconnectAttempts++;
    const delay = 15000; // Fixed 15 second delay
    
    console.log(`Singleton: Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    this.errorMessage = `Retrying connection... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`;
    this.notifySubscribers();
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.subscribers.size > 0) {
        this.connect();
      }
    }, delay);
  }

  private disconnect() {
    this.cleanup();
    this.connectionStatus = 'disconnected';
    this.errorMessage = '';
    this.isConnecting = false;
    this.notifySubscribers();
  }

  private cleanup() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close();
      }
      this.socket = null;
    }
    
    this.isAuthenticated = false;
    this.isConnecting = false;
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback(this.streamData);
    });
  }
}

export const useAlpacaStreamSingleton = ({ symbols, enabled = true }: UseAlpacaStreamProps) => {
  const [status, setStatus] = useState(() => AlpacaStreamManager.getInstance().getStatus());
  const subscriberIdRef = useRef(`subscriber-${Math.random().toString(36).substr(2, 9)}`);
  const managerRef = useRef(AlpacaStreamManager.getInstance());

  const updateStatus = useCallback((streamData: Record<string, StreamData>) => {
    const currentStatus = managerRef.current.getStatus();
    setStatus(currentStatus);
  }, []);

  useEffect(() => {
    if (enabled && symbols.length > 0) {
      managerRef.current.subscribe(subscriberIdRef.current, updateStatus, symbols);
    }

    return () => {
      managerRef.current.unsubscribe(subscriberIdRef.current, symbols);
    };
  }, [symbols, enabled, updateStatus]);

  return {
    isConnected: status.isConnected,
    isAuthenticated: status.isAuthenticated,
    connectionStatus: status.connectionStatus,
    streamData: status.streamData,
    errorMessage: status.errorMessage,
    connect: () => managerRef.current.subscribe(subscriberIdRef.current, updateStatus, symbols),
    disconnect: () => managerRef.current.unsubscribe(subscriberIdRef.current, symbols)
  };
};
