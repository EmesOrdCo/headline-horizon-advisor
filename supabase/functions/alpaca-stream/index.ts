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

  // Use Alpaca Broker API credentials for direct AAPL connection
  const alpacaApiKey = Deno.env.get("ALPACA_API_KEY");
  const alpacaSecretKey = Deno.env.get("ALPACA_SECRET_KEY");

  console.log('WebSocket connection request received for AAPL direct stream');
  console.log('Broker API Key exists:', !!alpacaApiKey);
  console.log('Broker Secret Key exists:', !!alpacaSecretKey);
  console.log('API Key prefix:', alpacaApiKey ? alpacaApiKey.substring(0, 8) + '...' : 'None');

  if (!alpacaApiKey || !alpacaSecretKey) {
    console.error('Missing Alpaca API credentials');
    return new Response("Missing Alpaca API credentials", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let alpacaSocket: WebSocket | null = null;
  let isAuthenticated = false;
  let connectionAttempts = 0;
  const maxConnectionAttempts = 3;
  let retryTimeout: number | null = null;


  const connectToAlpaca = () => {
    if (connectionAttempts >= maxConnectionAttempts) {
      console.error('Max connection attempts reached - unable to connect to Alpaca');
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to connect to Alpaca after multiple attempts',
        code: 'CONNECTION_FAILED'
      }));
      return;
    }

    connectionAttempts++;
    
    try {
      console.log(`Connecting to Alpaca AAPL stream (attempt ${connectionAttempts}/${maxConnectionAttempts})...`);
      
      // Close existing connection if any
      if (alpacaSocket && alpacaSocket.readyState === WebSocket.OPEN) {
        console.log('Closing existing Alpaca connection');
        alpacaSocket.close();
      }
      
      // Clear any existing retry timeout
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
      
      // Connect to Alpaca sandbox for AAPL data
      alpacaSocket = new WebSocket("wss://stream.data.sandbox.alpaca.markets/v2/test");
      
      // Set authentication timeout
      const authTimeout = setTimeout(() => {
        console.error('404 - Authentication timeout after 10 seconds');
        if (alpacaSocket) {
          alpacaSocket.close();
        }
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Authentication timeout',
          code: 404
        }));
        
        // Retry connection
        retryTimeout = setTimeout(() => connectToAlpaca(), 5000);
      }, 10000);
      
      alpacaSocket.onopen = () => {
        console.log('WebSocket connection opened to Alpaca sandbox');
        
        const authMessage = {
          action: "auth",
          key: alpacaApiKey,
          secret: alpacaSecretKey
        };
        
        console.log('Sending authentication for AAPL stream');
        alpacaSocket!.send(JSON.stringify(authMessage));
      };

      alpacaSocket.onmessage = async (event) => {
        try {
          clearTimeout(authTimeout);
          let rawData = event.data;
          
          if (rawData instanceof Blob) {
            rawData = await rawData.text();
          }
          
          const data = JSON.parse(rawData);
          console.log('Alpaca response:', JSON.stringify(data));
          
          if (Array.isArray(data)) {
            for (const message of data) {
              if (message.T === 'success' && message.msg === 'authenticated') {
                isAuthenticated = true;
                connectionAttempts = 0; // Reset on successful auth
                console.log('✓ Successfully authenticated with Alpaca');
                
                // Subscribe to AAPL directly (not FAKEPACA)
                const subscribeMessage = {
                  action: "subscribe",
                  trades: ["AAPL"],
                  quotes: ["AAPL"]
                };
                console.log('Subscribing to real AAPL data');
                alpacaSocket!.send(JSON.stringify(subscribeMessage));
                
                socket.send(JSON.stringify({
                  type: 'auth_success',
                  message: 'Connected to Alpaca - streaming real AAPL data'
                }));
                
              } else if (message.T === 'subscription') {
                console.log('✓ Subscription confirmed for:', message);
                
              } else if (message.T === 'error') {
                console.error('Alpaca error response:', message);
                clearTimeout(authTimeout);
                
                if (message.code === 404) {
                  console.error('404 - Authentication failed or timeout');
                  socket.send(JSON.stringify({
                    type: 'error',
                    message: 'Authentication failed',
                    code: 404
                  }));
                } else if (message.code === 406) {
                  console.error('406 - Connection limit exceeded');
                  socket.send(JSON.stringify({
                    type: 'error',
                    message: 'Connection limit exceeded',
                    code: 406
                  }));
                }
                
                // Retry connection after error
                retryTimeout = setTimeout(() => connectToAlpaca(), 5000);
                
              } else if (isAuthenticated && (message.T === 't' || message.T === 'q')) {
                console.log('✓ Real AAPL data received:', message);
                
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
          console.error('Error processing Alpaca message:', error);
          clearTimeout(authTimeout);
          retryTimeout = setTimeout(() => connectToAlpaca(), 5000);
        }
      };

      alpacaSocket.onerror = (error) => {
        console.error('Alpaca WebSocket error:', error);
        clearTimeout(authTimeout);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'WebSocket connection error',
          code: 'WS_ERROR'
        }));
        retryTimeout = setTimeout(() => connectToAlpaca(), 5000);
      };

      alpacaSocket.onclose = (event) => {
        console.log(`Alpaca WebSocket closed: ${event.code} - ${event.reason}`);
        clearTimeout(authTimeout);
        isAuthenticated = false;
        
        let errorCode = event.code;
        let errorMessage = event.reason || 'Connection closed';
        
        if (event.code === 1006) {
          errorCode = 404;
          errorMessage = 'Authentication timeout';
        } else if (event.code === 1011) {
          errorCode = 406;
          errorMessage = 'Connection limit exceeded';
        }
        
        socket.send(JSON.stringify({
          type: 'error',
          message: errorMessage,
          code: errorCode
        }));
        
        // Retry connection
        retryTimeout = setTimeout(() => connectToAlpaca(), 5000);
      };
      
    } catch (error) {
      console.error('Failed to create Alpaca WebSocket:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to create WebSocket connection',
        code: 'CREATE_ERROR'
      }));
      retryTimeout = setTimeout(() => connectToAlpaca(), 5000);
    }
  };

  socket.onopen = () => {
    console.log('Client connected to WebSocket');
    connectToAlpaca();
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received from client:', JSON.stringify(message, null, 2));
      
      if (message.type === 'subscribe' && message.symbols) {
        console.log('Client subscribing to symbols:', message.symbols);
        
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'subscribed',
            symbols: ['AAPL'],
            message: 'Subscribed to AAPL data stream'
          }));
        }
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  };

  socket.onclose = () => {
    console.log('Client disconnected');
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
    if (alpacaSocket && alpacaSocket.readyState === WebSocket.OPEN) {
      alpacaSocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
    if (alpacaSocket && alpacaSocket.readyState === WebSocket.OPEN) {
      alpacaSocket.close();
    }
  };

  return response;
});