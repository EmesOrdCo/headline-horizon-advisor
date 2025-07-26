
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

  // Use Alpaca Broker API credentials for sandbox environment
  const alpacaApiKey = Deno.env.get("ALPACA_TRADER_API_KEY");
  const alpacaSecretKey = Deno.env.get("ALPACA_TRADER_SECRET_KEY");

  console.log('WebSocket connection request received for sandbox test stream');
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
      
      alpacaSocket = new WebSocket("wss://stream.data.sandbox.alpaca.markets/v2/test");
      
      alpacaSocket.onopen = () => {
        console.log('Connected to Alpaca sandbox test data stream');
        
        const authMessage = {
          action: "auth",
          key: alpacaApiKey,
          secret: alpacaSecretKey
        };
        
        console.log('Sending authentication to sandbox...');
        alpacaSocket!.send(JSON.stringify(authMessage));
      };

      alpacaSocket.onmessage = async (event) => {
        try {
          let rawData = event.data;
          console.log('Raw data received:', typeof rawData, rawData.length || 'no length');
          
          // Handle binary data (Blob)
          if (rawData instanceof Blob) {
            rawData = await rawData.text();
          }
          
          const data = JSON.parse(rawData);
          console.log('Parsed data from Alpaca:', JSON.stringify(data, null, 2));
          
          if (Array.isArray(data)) {
            for (const message of data) {
              console.log('Processing message:', JSON.stringify(message, null, 2));
              
              if (message.T === 'success' && message.msg === 'connected') {
                console.log('Connected to Alpaca, now authenticating...');
                
                // Send auth message
                const authMessage = {
                  action: "auth",
                  key: alpacaApiKey,
                  secret: alpacaSecretKey
                };
                console.log('Sending auth message:', JSON.stringify(authMessage, null, 2));
                alpacaSocket!.send(JSON.stringify(authMessage));
                
              } else if (message.T === 'success' && message.msg === 'authenticated') {
                isAuthenticated = true;
                connectionAttempts = 0; // Reset on successful auth
                console.log('Successfully authenticated with Alpaca sandbox');
                
                // Subscribe to FAKEPACA test symbol for simulated data
                const subscribeMessage = {
                  action: "subscribe",
                  trades: ["FAKEPACA"],
                  quotes: ["FAKEPACA"],
                  bars: ["FAKEPACA"]
                };
                console.log('Subscribing to FAKEPACA test symbol:', JSON.stringify(subscribeMessage, null, 2));
                alpacaSocket!.send(JSON.stringify(subscribeMessage));
                
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    type: 'auth_success',
                    message: 'Connected to Alpaca sandbox test stream - simulated data'
                  }));
                }
              } else if (message.T === 'error') {
                console.error('Alpaca error:', JSON.stringify(message, null, 2));
                
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
                // Forward sandbox test market data
                console.log('Forwarding sandbox test data:', JSON.stringify(message, null, 2));
                
                // Add sandbox markers to the data
                const sandboxData = {
                  ...message,
                  sandbox: true,
                  simulated: true,
                  source: 'alpaca_sandbox_test'
                };
                
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    type: 'market_data',
                    data: [sandboxData]
                  }));
                }
              } else {
                console.log('Unhandled message type:', message.T, JSON.stringify(message, null, 2));
              }
            }
          } else {
            console.log('Single message received:', JSON.stringify(data, null, 2));
          }
        } catch (error) {
          console.error('Error parsing Alpaca message:', error, 'Raw data:', event.data);
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
      console.log('Received from client:', JSON.stringify(message, null, 2));
      
      if (message.type === 'subscribe' && message.symbols) {
        // For test stream, convert all symbols to FAKEPACA
        const testSymbols = ["FAKEPACA"];
        console.log('Converting symbols to test symbols:', message.symbols, '→', testSymbols);
        
        if (alpacaSocket && isAuthenticated && alpacaSocket.readyState === WebSocket.OPEN) {
          const subscribeMessage = {
            action: "subscribe",
            trades: testSymbols,
            quotes: testSymbols
          };
          
          console.log('Sending subscription to Alpaca:', JSON.stringify(subscribeMessage, null, 2));
          alpacaSocket.send(JSON.stringify(subscribeMessage));
          
          // Send confirmation to client
          socket.send(JSON.stringify({
            type: 'subscribed',
            symbols: testSymbols,
            message: 'Subscribed to FAKEPACA sandbox test stream - simulated data'
          }));
        } else {
          console.log('Cannot subscribe: not authenticated or connection not ready');
          console.log('Socket state:', alpacaSocket?.readyState, 'Authenticated:', isAuthenticated);
          
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Not connected to data stream'
          }));
        }
      }
    } catch (error) {
      console.error('Error parsing client message:', error, 'Raw data:', event.data);
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
