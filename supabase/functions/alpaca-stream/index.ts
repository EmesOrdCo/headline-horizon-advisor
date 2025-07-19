
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

  const alpacaApiKey = Deno.env.get('ALPACA_API_KEY');
  const alpacaSecretKey = Deno.env.get('ALPACA_SECRET_KEY');

  if (!alpacaApiKey || !alpacaSecretKey) {
    console.error('Missing Alpaca API credentials');
    return new Response("Alpaca API credentials not configured", { status: 500 });
  }

  console.log('Alpaca credentials found, attempting WebSocket connection...');

  const { socket, response } = Deno.upgradeWebSocket(req);
  let alpacaSocket: WebSocket | null = null;
  let isAuthenticated = false;

  socket.onopen = () => {
    console.log('Client WebSocket connected');
    
    // Connect to Alpaca WebSocket with better error handling
    try {
      alpacaSocket = new WebSocket("wss://stream.data.alpaca.markets/v2/iex");
      
      alpacaSocket.onopen = () => {
        console.log('Connected to Alpaca WebSocket successfully');
        
        // Send authentication message
        const authMessage = {
          action: "auth",
          key: alpacaApiKey,
          secret: alpacaSecretKey
        };
        
        console.log('Sending authentication to Alpaca...');
        alpacaSocket!.send(JSON.stringify(authMessage));
      };

      alpacaSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received from Alpaca:', JSON.stringify(data, null, 2));
          
          // Handle different message types
          if (Array.isArray(data)) {
            for (const message of data) {
              if (message.T === 'success' && message.msg === 'authenticated') {
                isAuthenticated = true;
                console.log('Alpaca WebSocket authenticated successfully');
                
                socket.send(JSON.stringify({
                  type: 'auth_success',
                  message: 'Connected to Alpaca stream'
                }));
              } else if (message.T === 'error') {
                console.error('Alpaca authentication error:', message);
                socket.send(JSON.stringify({
                  type: 'auth_error',
                  message: `Authentication failed: ${message.msg || 'Unknown error'}`
                }));
              } else if (isAuthenticated && (message.T === 't' || message.T === 'q' || message.T === 'b')) {
                // Forward market data (trades, quotes, bars)
                socket.send(JSON.stringify({
                  type: 'market_data',
                  data: [message]
                }));
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
            message: 'Alpaca connection error - check API credentials and permissions'
          }));
        }
      };

      alpacaSocket.onclose = (event) => {
        console.log('Alpaca WebSocket disconnected', event.code, event.reason);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'disconnected',
            message: `Alpaca stream disconnected: ${event.reason || 'Unknown reason'}`
          }));
        }
      };
    } catch (error) {
      console.error('Failed to create Alpaca WebSocket:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to initialize Alpaca connection'
      }));
    }
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
        
        console.log('Subscribing to symbols:', subscribeMessage);
        alpacaSocket.send(JSON.stringify(subscribeMessage));
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  };

  socket.onclose = () => {
    console.log('Client WebSocket disconnected');
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
