
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

  const alpacaApiKey = Deno.env.get("ALPACA_TRADER_API_KEY");
  const alpacaSecretKey = Deno.env.get("ALPACA_TRADER_SECRET_KEY");

  console.log('WebSocket connection request received');
  console.log('Trader API Key exists:', !!alpacaApiKey);
  console.log('Trader Secret Key exists:', !!alpacaSecretKey);

  if (!alpacaApiKey || !alpacaSecretKey) {
    console.error('Missing Alpaca API credentials');
    return new Response("Missing Alpaca API credentials", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let alpacaSocket: WebSocket | null = null;
  let isAuthenticated = false;
  let connectionAttempts = 0;
  const maxConnectionAttempts = 1; // Limit to prevent connection spam

  const connectToAlpaca = () => {
    if (connectionAttempts >= maxConnectionAttempts) {
      console.log('Max connection attempts reached, sending error to client');
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Connection limit reached. Please try again later.'
        }));
      }
      return;
    }

    connectionAttempts++;
    
    try {
      console.log(`Connecting to Alpaca data stream (attempt ${connectionAttempts}/${maxConnectionAttempts})...`);
      
      // Close existing connection if any
      if (alpacaSocket && alpacaSocket.readyState === WebSocket.OPEN) {
        alpacaSocket.close();
      }
      
      alpacaSocket = new WebSocket("wss://paper-api.alpaca.markets/stream");
      
      alpacaSocket.onopen = () => {
        console.log('Connected to Alpaca data stream');
        
        const authMessage = {
          action: "auth",
          key: alpacaApiKey,
          secret: alpacaSecretKey
        };
        
        console.log('Sending authentication...');
        alpacaSocket!.send(JSON.stringify(authMessage));
      };

      alpacaSocket.onmessage = async (event) => {
        try {
          let rawData = event.data;
          
          // Handle binary data (Blob)
          if (rawData instanceof Blob) {
            rawData = await rawData.text();
          }
          
          const data = JSON.parse(rawData);
          console.log('Received from Alpaca:', data);
          
          if (Array.isArray(data)) {
            for (const message of data) {
              if (message.T === 'success' && message.msg === 'authenticated') {
                isAuthenticated = true;
                connectionAttempts = 0; // Reset on successful auth
                console.log('Successfully authenticated with Alpaca');
                
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    type: 'auth_success',
                    message: 'Connected to Alpaca data stream'
                  }));
                }
              } else if (message.T === 'error') {
                console.error('Alpaca error:', message);
                
                let errorMessage = `Alpaca error: ${message.msg || 'Unknown error'}`;
                if (message.code === 406) {
                  errorMessage = 'Connection limit exceeded. Market data may be temporarily unavailable.';
                }
                
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    type: 'auth_error',
                    message: errorMessage
                  }));
                }
              } else if (isAuthenticated && (message.T === 't' || message.T === 'q' || message.T === 'b')) {
                // Forward market data
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
          console.error('Error parsing Alpaca message:', error);
        }
      };

      alpacaSocket.onerror = (error) => {
        console.error('Alpaca WebSocket error:', error);
        
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Connection to data provider failed'
          }));
        }
      };

      alpacaSocket.onclose = (event) => {
        console.log('Alpaca WebSocket disconnected:', event.code, event.reason);
        isAuthenticated = false;
        
        // Don't automatically reconnect to prevent connection spam
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Data stream disconnected'
          }));
        }
      };
    } catch (error) {
      console.error('Failed to create Alpaca WebSocket:', error);
      
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to initialize data connection'
        }));
      }
    }
  };

  socket.onopen = () => {
    console.log('Client connected to WebSocket');
    connectToAlpaca();
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received from client:', message);
      
      if (message.type === 'subscribe' && message.symbols) {
        console.log('Subscribing to symbols:', message.symbols);
        
        if (alpacaSocket && isAuthenticated && alpacaSocket.readyState === WebSocket.OPEN) {
          const subscribeMessage = {
            action: "subscribe",
            trades: message.symbols,
            quotes: message.symbols
          };
          
          console.log('Sending subscription to Alpaca:', subscribeMessage);
          alpacaSocket.send(JSON.stringify(subscribeMessage));
        } else {
          console.log('Cannot subscribe: not authenticated or connection not ready');
        }
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  };

  socket.onclose = () => {
    console.log('Client disconnected');
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
