
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
    return new Response("Alpaca API credentials not configured", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let alpacaSocket: WebSocket | null = null;
  let isAuthenticated = false;

  socket.onopen = () => {
    console.log('Client WebSocket connected');
    
    // Connect to Alpaca WebSocket
    alpacaSocket = new WebSocket("wss://stream.data.alpaca.markets/v1beta1/iex");
    
    alpacaSocket.onopen = () => {
      console.log('Connected to Alpaca WebSocket');
      
      // Send authentication message
      const authMessage = {
        action: "auth",
        key: alpacaApiKey,
        secret: alpacaSecretKey
      };
      
      alpacaSocket!.send(JSON.stringify(authMessage));
    };

    alpacaSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received from Alpaca:', data);
        
        // Handle authentication response
        if (data.action === 'auth' && data.status === 'authorized') {
          isAuthenticated = true;
          console.log('Alpaca WebSocket authenticated successfully');
          
          // Send success message to client
          socket.send(JSON.stringify({
            type: 'auth_success',
            message: 'Connected to Alpaca stream'
          }));
        } else if (data.action === 'auth' && data.status !== 'authorized') {
          console.error('Alpaca authentication failed:', data);
          socket.send(JSON.stringify({
            type: 'auth_error',
            message: 'Failed to authenticate with Alpaca'
          }));
        } else if (isAuthenticated) {
          // Forward market data to client
          socket.send(JSON.stringify({
            type: 'market_data',
            data: data
          }));
        }
      } catch (error) {
        console.error('Error parsing Alpaca message:', error);
      }
    };

    alpacaSocket.onerror = (error) => {
      console.error('Alpaca WebSocket error:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Alpaca connection error'
      }));
    };

    alpacaSocket.onclose = () => {
      console.log('Alpaca WebSocket disconnected');
      socket.send(JSON.stringify({
        type: 'disconnected',
        message: 'Alpaca stream disconnected'
      }));
    };
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received from client:', message);
      
      if (message.type === 'subscribe' && alpacaSocket && isAuthenticated) {
        // Subscribe to symbols
        const subscribeMessage = {
          action: "subscribe",
          trades: message.symbols || [],
          quotes: message.symbols || [],
          bars: message.symbols || []
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
    if (alpacaSocket) {
      alpacaSocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    if (alpacaSocket) {
      alpacaSocket.close();
    }
  };

  return response;
});
