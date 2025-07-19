
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

  // Get proper Alpaca credentials from Supabase secrets
  const alpacaApiKey = Deno.env.get("ALPACA_API_KEY");
  const alpacaSecretKey = Deno.env.get("ALPACA_SECRET_KEY");

  console.log('Using Alpaca paper trading credentials');
  console.log('API Key exists:', !!alpacaApiKey);
  console.log('Secret Key exists:', !!alpacaSecretKey);

  if (!alpacaApiKey || !alpacaSecretKey) {
    console.error('Missing Alpaca API credentials');
    return new Response("Missing Alpaca API credentials", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let alpacaSocket: WebSocket | null = null;
  let isAuthenticated = false;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 3;

  const connectToAlpaca = () => {
    try {
      console.log(`Connecting to Alpaca Paper Trading WebSocket (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts + 1})`);
      // Use paper trading WebSocket endpoint for IEX data
      alpacaSocket = new WebSocket("wss://stream.data.alpaca.markets/v2/iex");
      
      alpacaSocket.onopen = () => {
        console.log('Connected to Alpaca Paper Trading WebSocket successfully');
        reconnectAttempts = 0; // Reset on successful connection
        
        // Send authentication message with proper format for paper trading using actual key and secret
        const authMessage = {
          action: "auth",
          key: alpacaApiKey,
          secret: alpacaSecretKey
        };
        
        console.log('Sending authentication to Alpaca Paper Trading with proper credentials');
        alpacaSocket!.send(JSON.stringify(authMessage));
      };

      alpacaSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received from Alpaca Paper Trading:', JSON.stringify(data, null, 2));
          
          // Handle different message types
          if (Array.isArray(data)) {
            for (const message of data) {
              if (message.T === 'success' && message.msg === 'authenticated') {
                isAuthenticated = true;
                console.log('Alpaca Paper Trading WebSocket authenticated successfully');
                
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    type: 'auth_success',
                    message: 'Connected to Alpaca paper trading stream'
                  }));
                }
              } else if (message.T === 'error') {
                console.error('Alpaca paper trading authentication error:', message);
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
          console.error('Error parsing Alpaca paper trading message:', error);
        }
      };

      alpacaSocket.onerror = (error) => {
        console.error('Alpaca Paper Trading WebSocket error:', error);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Alpaca paper trading connection error - check API credentials'
          }));
        }
      };

      alpacaSocket.onclose = (event) => {
        console.log('Alpaca Paper Trading WebSocket disconnected', event.code, event.reason);
        isAuthenticated = false;
        
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'disconnected',
            message: `Alpaca paper trading stream disconnected: ${event.reason || 'Unknown reason'}`
          }));
        }
        
        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`Attempting to reconnect in 3 seconds... (${reconnectAttempts}/${maxReconnectAttempts})`);
          setTimeout(() => {
            if (socket.readyState === WebSocket.OPEN) {
              connectToAlpaca();
            }
          }, 3000);
        } else {
          console.log('Max reconnection attempts reached');
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Unable to maintain connection to Alpaca paper trading after multiple attempts'
            }));
          }
        }
      };
    } catch (error) {
      console.error('Failed to create Alpaca Paper Trading WebSocket:', error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to initialize Alpaca paper trading connection'
        }));
      }
    }
  };

  socket.onopen = () => {
    console.log('Client WebSocket connected to paper trading stream');
    connectToAlpaca();
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received from client:', message);
      
      if (message.type === 'subscribe' && alpacaSocket && isAuthenticated && alpacaSocket.readyState === WebSocket.OPEN) {
        // Subscribe to symbols for trades and quotes
        const subscribeMessage = {
          action: "subscribe",
          trades: message.symbols || [],
          quotes: message.symbols || []
        };
        
        console.log('Subscribing to symbols in paper trading:', subscribeMessage);
        alpacaSocket.send(JSON.stringify(subscribeMessage));
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  };

  socket.onclose = () => {
    console.log('Client WebSocket disconnected from paper trading stream');
    if (alpacaSocket && alpacaSocket.readyState === WebSocket.OPEN) {
      alpacaSocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    if (alpacaSocket && alpacaSocket.readyState === WebSocket.OPEN) {
      alpacaSocket.close();
    }
  };

  return response;
});
