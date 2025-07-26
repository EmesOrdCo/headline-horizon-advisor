
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
  sandbox?: boolean;
  simulated?: boolean;
  source?: string;
}

interface UseAlpacaStreamProps {
  symbols: string[];
  enabled?: boolean;
}

// True singleton WebSocket connection manager
class AlpacaStreamManager {
  private static instance: AlpacaStreamManager | null = null;
  private socket: WebSocket | null = null;
  private subscribers: Map<string, (data: Record<string, StreamData>) => void> = new Map();
  private streamData: Record<string, StreamData> = {};
  private subscribedSymbols: Set<string> = new Set();
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private isAuthenticated = false;
  private errorMessage = '';
  private connectionAttempts = 0;
  private maxAttempts = 1;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  static getInstance(): AlpacaStreamManager {
    if (!AlpacaStreamManager.instance) {
      AlpacaStreamManager.instance = new AlpacaStreamManager();
    }
    return AlpacaStreamManager.instance;
  }

  subscribe(id: string, callback: (data: Record<string, StreamData>) => void, symbols: string[]) {
    console.log(`Singleton: Subscribing ${id} to symbols:`, symbols);
    this.subscribers.set(id, callback);
    
    // Add new symbols to subscription
    const newSymbols = symbols.filter(symbol => !this.subscribedSymbols.has(symbol));
    newSymbols.forEach(symbol => this.subscribedSymbols.add(symbol));

    // Only connect if we don't have a connection and haven't exceeded attempts
    if (!this.socket && this.connectionStatus !== 'connecting' && this.connectionAttempts < this.maxAttempts) {
      this.connect();
    } else if (this.socket && this.isAuthenticated && newSymbols.length > 0) {
      // Subscribe to new symbols if already connected
      this.socket.send(JSON.stringify({
        type: 'subscribe',
        symbols: newSymbols
      }));
    }

    // Send current status immediately
    callback(this.streamData);
  }

  unsubscribe(id: string, symbols: string[]) {
    console.log(`Singleton: Unsubscribing ${id} from symbols:`, symbols);
    this.subscribers.delete(id);
    
    // Remove symbols that are no longer needed
    symbols.forEach(symbol => {
      const stillNeeded = Array.from(this.subscribers.values()).some(callback => 
        // This is a simplified check - in reality you'd track which symbols each subscriber needs
        this.subscribedSymbols.has(symbol)
      );
      if (!stillNeeded) {
        this.subscribedSymbols.delete(symbol);
        delete this.streamData[symbol];
      }
    });

    // Disconnect if no more subscribers
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
    // Prevent multiple simultaneous connections
    if (this.socket?.readyState === WebSocket.CONNECTING || this.socket?.readyState === WebSocket.OPEN) {
      console.log('Singleton: Connection already exists in state:', this.socket.readyState);
      return;
    }

    if (this.connectionAttempts >= this.maxAttempts) {
      console.log('Singleton: Max connection attempts reached');
      this.connectionStatus = 'error';
      this.errorMessage = 'Max connection attempts reached';
      this.notifySubscribers();
      return;
    }

    this.connectionAttempts++;
    this.connectionStatus = 'connecting';
    this.errorMessage = '';
    this.notifySubscribers();

    console.log(`Singleton: Creating WebSocket connection (attempt ${this.connectionAttempts}/${this.maxAttempts})`);
    
    const wsUrl = `wss://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/alpaca-stream`;
    console.log('Singleton: Connecting to URL:', wsUrl);
    
    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('Singleton: WebSocket connected successfully');
        this.connectionStatus = 'connected';
        this.errorMessage = '';
        this.notifySubscribers();
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Singleton: Received message:', message);
          
          switch (message.type) {
            case 'auth_success':
              this.isAuthenticated = true;
              this.errorMessage = '';
              this.connectionAttempts = 0; // Reset on success
              console.log('Singleton: Authenticated, subscribing to:', Array.from(this.subscribedSymbols));
              
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
              this.errorMessage = message.message || 'Authentication failed';
              console.error('Singleton: Auth error:', message.message);
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
                        close: item.c,
                        sandbox: item.sandbox || true,
                        simulated: item.simulated || true,
                        source: item.source || 'alpaca_sandbox_test'
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
              
              if (message.message && message.message.includes('connection limit')) {
                this.errorMessage = 'Connection limit reached. Real-time data unavailable.';
                console.log('Singleton: Connection limit reached');
              } else {
                this.errorMessage = message.message || 'Stream error occurred';
                console.error('Singleton: Stream error:', message.message);
              }
              this.notifySubscribers();
              break;
          }
        } catch (error) {
          console.error('Singleton: Error parsing message:', error);
          this.errorMessage = 'Failed to parse stream data';
          this.notifySubscribers();
        }
      };

      this.socket.onerror = (error) => {
        console.error('Singleton: WebSocket error:', error);
        this.connectionStatus = 'error';
        this.isAuthenticated = false;
        this.errorMessage = 'WebSocket connection failed';
        this.notifySubscribers();
      };

      this.socket.onclose = (event) => {
        console.log('Singleton: WebSocket closed, code:', event.code, 'reason:', event.reason);
        this.isAuthenticated = false;
        this.connectionStatus = 'disconnected';
        this.errorMessage = `Connection closed (${event.code}): ${event.reason || 'Unknown reason'}`;
        this.cleanup();
        this.notifySubscribers();
      };

    } catch (error) {
      console.error('Singleton: Failed to create WebSocket:', error);
      this.connectionStatus = 'error';
      this.errorMessage = 'Failed to initialize WebSocket connection';
      this.notifySubscribers();
    }
  }

  private disconnect() {
    console.log('Singleton: Disconnecting...');
    this.cleanup();
    this.connectionStatus = 'disconnected';
    this.errorMessage = '';
    this.connectionAttempts = 0;
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
        this.socket.close(1000, "Clean disconnect");
      }
      this.socket = null;
    }
    
    this.isAuthenticated = false;
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
      console.log('Hook: Starting subscription for symbols:', symbols);
      managerRef.current.subscribe(subscriberIdRef.current, updateStatus, symbols);
    }

    return () => {
      if (symbols.length > 0) {
        console.log('Hook: Cleaning up subscription for symbols:', symbols);
        managerRef.current.unsubscribe(subscriberIdRef.current, symbols);
      }
    };
  }, [symbols.join(','), enabled]); // Use symbols.join(',') to prevent array reference issues

  return {
    isConnected: status.connectionStatus === 'connected',
    isAuthenticated: status.isAuthenticated,
    connectionStatus: status.connectionStatus,
    streamData: status.streamData,
    errorMessage: status.errorMessage,
    connect: () => managerRef.current.subscribe(subscriberIdRef.current, updateStatus, symbols),
    disconnect: () => managerRef.current.unsubscribe(subscriberIdRef.current, symbols)
  };
};
