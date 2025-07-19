
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  // Get proper Alpaca trader credentials from Supabase secrets
  const alpacaApiKey = Deno.env.get("ALPACA_TRADER_API_KEY");
  const alpacaSecretKey = Deno.env.get("ALPACA_TRADER_SECRET_KEY");

  console.log('Using Alpaca trader credentials');
  console.log('Trader API Key exists:', !!alpacaApiKey);
  console.log('Trader Secret Key exists:', !!alpacaSecretKey);

  if (!alpacaApiKey || !alpacaSecretKey) {
    console.error('Missing Alpaca trader API credentials');
    return new Response("Missing Alpaca trader API credentials", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let alpacaSocket: WebSocket | null = null;
  let isAuthenticated = false;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 1; // Reduce to just 1 attempt to avoid hitting limits
  let subscribedSymbols: string[] = [];
  let connectionBackoffTime = 1000; // Start with 1 second
  let lastConnectionAttempt = 0;
  let circuitBreakerOpen = false;

  const connectToAlpaca = () => {
    // Circuit breaker: if we've had too many failures, don't try for a while
    if (circuitBreakerOpen) {
      console.log('Circuit breaker is open, using mock data');
      startMockDataStream();
      return;
    }

    // Rate limiting: don't try to connect too frequently
    const now = Date.now();
    if (now - lastConnectionAttempt < connectionBackoffTime) {
      console.log(`Rate limiting: waiting ${connectionBackoffTime}ms between attempts`);
      setTimeout(() => {
        if (socket.readyState === WebSocket.OPEN) {
          connectToAlpaca();
        }
      }, connectionBackoffTime);
      return;
    }

    lastConnectionAttempt = now;

    // Don't attempt to reconnect if we've exceeded limits
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached, opening circuit breaker');
      circuitBreakerOpen = true;
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'auth_success',
          message: 'Connected to mock data stream (Alpaca connection limit reached)'
        }));
        
        startMockDataStream();
      }
      return;
    }

    try {
      console.log(`Connecting to Alpaca Data WebSocket (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts + 1})`);
      // Use the data stream endpoint instead of paper trading
      alpacaSocket = new WebSocket("wss://stream.data.alpaca.markets/v2/iex");
      
      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (alpacaSocket && alpacaSocket.readyState === WebSocket.CONNECTING) {
          console.log('Connection timeout, closing socket');
          alpacaSocket.close();
        }
      }, 10000); // 10 second timeout
      
      alpacaSocket.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('Connected to Alpaca Data WebSocket successfully');
        reconnectAttempts = 0; // Reset on successful connection
        connectionBackoffTime = 1000; // Reset backoff time
        
        // Send authentication message
        const authMessage = {
          action: "auth",
          key: alpacaApiKey,
          secret: alpacaSecretKey
        };
        
        console.log('Sending authentication to Alpaca Data WebSocket');
        alpacaSocket!.send(JSON.stringify(authMessage));
      };

      alpacaSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received from Alpaca Data:', JSON.stringify(data, null, 2));
          
          // Handle different message types
          if (Array.isArray(data)) {
            for (const message of data) {
              if (message.T === 'success' && message.msg === 'authenticated') {
                isAuthenticated = true;
                console.log('Alpaca Data WebSocket authenticated successfully');
                
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    type: 'auth_success',
                    message: 'Connected to Alpaca data stream'
                  }));
                }
              } else if (message.T === 'error') {
                console.error('Alpaca data authentication error:', message);
                
                // If connection limit exceeded, open circuit breaker immediately
                if (message.code === 406) {
                  console.log('Connection limit exceeded, opening circuit breaker');
                  circuitBreakerOpen = true;
                  reconnectAttempts = maxReconnectAttempts; // Stop trying to reconnect
                  
                  if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                      type: 'auth_success',
                      message: 'Connected to mock data stream (Alpaca connection limit reached)'
                    }));
                    
                    startMockDataStream();
                  }
                  return;
                }
                
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    type: 'auth_error',
                    message: `Authentication failed: ${message.msg || 'Unknown error'} (Code: ${message.code || 'N/A'})`
                  }));
                }
              } else if (isAuthenticated && (message.T === 't' || message.T === 'q' || message.T === 'b')) {
                // Forward market data (trades, quotes, bars)
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    type: 'market_data',
                    data: [message]
                  }));
                }
              }
            }
          }
        } catch (error) {
          console.error('Error parsing Alpaca data message:', error);
        }
      };

      alpacaSocket.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('Alpaca Data WebSocket error:', error);
        
        // Increase backoff time exponentially
        connectionBackoffTime = Math.min(connectionBackoffTime * 2, 30000); // Max 30 seconds
        
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Alpaca data connection error - switching to mock data'
          }));
        }
      };

      alpacaSocket.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('Alpaca Data WebSocket disconnected', event.code, event.reason);
        isAuthenticated = false;
        
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'disconnected',
            message: `Alpaca data stream disconnected: ${event.reason || 'Unknown reason'}`
          }));
        }
        
        // Increase backoff time exponentially
        connectionBackoffTime = Math.min(connectionBackoffTime * 2, 30000); // Max 30 seconds
        
        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts < maxReconnectAttempts && !circuitBreakerOpen) {
          reconnectAttempts++;
          console.log(`Attempting to reconnect in ${connectionBackoffTime}ms... (${reconnectAttempts}/${maxReconnectAttempts})`);
          setTimeout(() => {
            if (socket.readyState === WebSocket.OPEN) {
              connectToAlpaca();
            }
          }, connectionBackoffTime);
        } else {
          console.log('Max reconnection attempts reached or circuit breaker open, switching to mock data');
          circuitBreakerOpen = true;
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              type: 'auth_success',
              message: 'Connected to mock data stream (Alpaca reconnection limit reached)'
            }));
            
            startMockDataStream();
          }
        }
      };
    } catch (error) {
      console.error('Failed to create Alpaca Data WebSocket:', error);
      connectionBackoffTime = Math.min(connectionBackoffTime * 2, 30000); // Increase backoff
      
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to initialize Alpaca data connection - using mock data'
        }));
        
        startMockDataStream();
      }
    }
  };

  let mockDataInterval: number | null = null;

  const startMockDataStream = () => {
    console.log('Starting mock data stream');
    
    const mockPrices: Record<string, number> = {
      'AAPL': 225.75,
      'MSFT': 441.85,
      'GOOGL': 178.92,
      'AMZN': 215.38,
      'NVDA': 144.75,
      'TSLA': 359.22,
      'META': 598.45
    };
    
    // Send mock data every 5 seconds
    mockDataInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN && subscribedSymbols.length > 0) {
        subscribedSymbols.forEach(symbol => {
          const basePrice = mockPrices[symbol] || 100 + Math.random() * 500;
          const variance = (Math.random() - 0.5) * 0.02; // ±1% variation
          const price = basePrice * (1 + variance);
          
          const mockData = {
            T: 't', // trade
            S: symbol,
            p: price,
            s: Math.floor(Math.random() * 1000) + 100, // volume
            t: Date.now() * 1000000 // timestamp in nanoseconds
          };
          
          socket.send(JSON.stringify({
            type: 'market_data',
            data: [mockData]
          }));
        });
      }
    }, 5000);
  };

  socket.onopen = () => {
    console.log('Client WebSocket connected to data stream');
    connectToAlpaca();
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received from client:', message);
      
      if (message.type === 'subscribe') {
        subscribedSymbols = message.symbols || [];
        console.log('Subscribed symbols:', subscribedSymbols);
        
        if (alpacaSocket && isAuthenticated && alpacaSocket.readyState === WebSocket.OPEN) {
          // Subscribe to symbols for trades and quotes
          const subscribeMessage = {
            action: "subscribe",
            trades: subscribedSymbols,
            quotes: subscribedSymbols
          };
          
          console.log('Subscribing to symbols in Alpaca data stream:', subscribeMessage);
          alpacaSocket.send(JSON.stringify(subscribeMessage));
        }
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  };

  socket.onclose = () => {
    console.log('Client WebSocket disconnected from data stream');
    if (alpacaSocket && alpacaSocket.readyState === WebSocket.OPEN) {
      alpacaSocket.close();
    }
    if (mockDataInterval) {
      clearInterval(mockDataInterval);
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    if (alpacaSocket && alpacaSocket.readyState === WebSocket.OPEN) {
      alpacaSocket.close();
    }
    if (mockDataInterval) {
      clearInterval(mockDataInterval);
    }
  };

  return response;
});
