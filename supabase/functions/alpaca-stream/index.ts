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


  const connectToAlpaca = async () => {
    try {
      console.log(`🔌 Connecting to Alpaca WebSocket (attempt ${connectionAttempts}/${maxConnectionAttempts})`);
      
      // Close existing connection
      if (alpacaSocket) {
        console.log('Closing existing connection');
        alpacaSocket.close();
        alpacaSocket = null;
      }
      
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
      
      // Connect to Alpaca data stream
      console.log('🌐 Opening WebSocket to wss://stream.data.sandbox.alpaca.markets/v2/test');
      alpacaSocket = new WebSocket('wss://stream.data.sandbox.alpaca.markets/v2/test');
      
      let authTimeout: number;
      
      alpacaSocket.onopen = () => {
        console.log('✅ WebSocket connection opened');
        
        // Send authentication immediately
        const authMessage = {
          action: 'auth',
          key: alpacaApiKey,
          secret: alpacaSecretKey
        };
        
        console.log('🔑 Sending authentication message');
        alpacaSocket!.send(JSON.stringify(authMessage));
        
        // Set auth timeout
        authTimeout = setTimeout(() => {
          if (!isAuthenticated) {
            console.error('❌ Authentication timeout after 15 seconds');
            alpacaSocket?.close();
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Authentication timeout',
              code: 404
            }));
          }
        }, 15000);
      };

      alpacaSocket.onmessage = async (event) => {
        try {
          clearTimeout(authTimeout);
          
          const rawData = event.data instanceof Blob ? await event.data.text() : event.data;
          const data = JSON.parse(rawData);
          
          console.log('📨 Received from Alpaca:', JSON.stringify(data));
          
          if (Array.isArray(data)) {
            for (const message of data) {
              if (message.T === 'success' && message.msg === 'authenticated') {
                isAuthenticated = true;
                connectionAttempts = 0;
                console.log('🎉 Successfully authenticated with Alpaca');
                
                // Subscribe to AAPL data
                const subscribeMessage = {
                  action: 'subscribe',
                  trades: ['AAPL'],
                  quotes: ['AAPL']
                };
                
                console.log('📋 Subscribing to AAPL trades and quotes');
                alpacaSocket!.send(JSON.stringify(subscribeMessage));
                
                // Notify client of successful connection
                socket.send(JSON.stringify({
                  type: 'auth_success',
                  message: 'Connected to Alpaca - streaming AAPL data',
                  symbol: 'AAPL'
                }));
                
              } else if (message.T === 'subscription') {
                console.log('✅ Subscription confirmed:', message);
                
              } else if (message.T === 'error') {
                console.error('❌ Alpaca error:', message);
                
                const errorCode = message.code || 'UNKNOWN';
                const errorMsg = message.msg || 'Unknown error';
                
                socket.send(JSON.stringify({
                  type: 'error',
                  message: errorMsg,
                  code: errorCode
                }));
                
                // Close connection on error
                alpacaSocket?.close();
                
              } else if (isAuthenticated && (message.T === 't' || message.T === 'q')) {
                // Forward real market data
                console.log('💹 Forwarding AAPL market data:', message.T, message.S, message.p || message.bp);
                
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
          console.error('❌ Error processing message:', error);
          clearTimeout(authTimeout);
        }
      };

      alpacaSocket.onerror = (error) => {
        console.error('❌ Alpaca WebSocket error:', error);
        clearTimeout(authTimeout);
        
        socket.send(JSON.stringify({
          type: 'error',
          message: 'WebSocket connection error',
          code: 'WS_ERROR'
        }));
      };

      alpacaSocket.onclose = (event) => {
        console.error(`❌ Alpaca WebSocket closed: ${event.code} - ${event.reason || 'No reason provided'}`);
        clearTimeout(authTimeout);
        isAuthenticated = false;
        
        // Map close codes to user-friendly messages
        let errorMessage = 'Connection closed';
        let errorCode = event.code;
        
        switch (event.code) {
          case 1006:
            errorMessage = 'Connection lost unexpectedly';
            break;
          case 1011:
            errorMessage = 'Server error occurred';
            errorCode = 406; // Map to connection limit
            break;
          case 4001:
            errorMessage = 'Authentication failed';
            errorCode = 404;
            break;
          default:
            errorMessage = event.reason || 'Unknown connection error';
        }
        
        console.error(`Mapped error: ${errorCode} - ${errorMessage}`);
        
        socket.send(JSON.stringify({
          type: 'error',
          message: errorMessage,
          code: errorCode
        }));
        
        // Retry connection if we haven't exceeded max attempts
        if (connectionAttempts < maxConnectionAttempts) {
          connectionAttempts++;
          console.log(`🔄 Retrying connection in 3 seconds (attempt ${connectionAttempts}/${maxConnectionAttempts})`);
          retryTimeout = setTimeout(() => connectToAlpaca(), 3000);
        } else {
          console.error('❌ Max connection attempts reached');
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Max connection attempts exceeded',
            code: 'MAX_RETRIES'
          }));
        }
      };
      
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      connectionAttempts++;
      
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to create connection',
        code: 'CREATE_ERROR'
      }));
      
      if (connectionAttempts < maxConnectionAttempts) {
        retryTimeout = setTimeout(() => connectToAlpaca(), 3000);
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