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
  const alpacaApiKey = Deno.env.get("ALPACA_API_KEY");
  const alpacaSecretKey = Deno.env.get("ALPACA_SECRET_KEY");

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
  const maxConnectionAttempts = 1;
  let mockDataInterval: number | null = null;

  const startMockDataStream = () => {
    console.log('Starting mock data stream for AAPL');
    
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'auth_success',
        message: 'Connected to mock data stream - simulated AAPL data'
      }));
    }

    // Generate mock AAPL data every 2 seconds
    let basePrice = 213.50;
    mockDataInterval = setInterval(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        if (mockDataInterval) {
          clearInterval(mockDataInterval);
          mockDataInterval = null;
        }
        return;
      }

      // Generate realistic price movements
      const priceChange = (Math.random() - 0.5) * 2; // +/- $1 max change
      basePrice += priceChange;
      basePrice = Math.max(200, Math.min(250, basePrice)); // Keep in realistic range

      const volume = Math.floor(Math.random() * 100000) + 50000;
      const spread = 0.02;
      const bidPrice = basePrice - spread;
      const askPrice = basePrice + spread;

      const mockTradeData = {
        T: 't',
        S: 'AAPL',
        p: Number(basePrice.toFixed(2)),
        s: volume,
        t: Date.now() * 1000000, // Convert to nanoseconds like Alpaca
        x: 'MOCK',
        sandbox: true,
        simulated: true,
        source: 'mock_stream'
      };

      const mockQuoteData = {
        T: 'q',
        S: 'AAPL',
        bp: Number(bidPrice.toFixed(2)),
        ap: Number(askPrice.toFixed(2)),
        bs: Math.floor(Math.random() * 1000) + 100,
        as: Math.floor(Math.random() * 1000) + 100,
        t: Date.now() * 1000000,
        sandbox: true,
        simulated: true,
        source: 'mock_stream'
      };

      console.log('Sending mock data:', JSON.stringify(mockTradeData, null, 2));

      socket.send(JSON.stringify({
        type: 'market_data',
        data: [mockTradeData, mockQuoteData]
      }));
    }, 2000);
  };

  const connectToAlpaca = () => {
    if (connectionAttempts >= maxConnectionAttempts) {
      console.log('Max connection attempts reached, starting mock data stream');
      startMockDataStream();
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
      
      // Set a timeout for authentication
      const authTimeout = setTimeout(() => {
        console.log('Authentication timeout, switching to mock data');
        if (alpacaSocket) {
          alpacaSocket.close();
        }
        startMockDataStream();
      }, 5000);
      
      alpacaSocket.onopen = () => {
        console.log('Connected to Alpaca sandbox test data stream');
        console.log('Sending authentication to sandbox...');
        
        const authMessage = {
          action: "auth",
          key: alpacaApiKey,
          secret: alpacaSecretKey
        };
        
        console.log('Sending auth message:', JSON.stringify(authMessage, null, 2));
        alpacaSocket!.send(JSON.stringify(authMessage));
      };

      alpacaSocket.onmessage = async (event) => {
        try {
          clearTimeout(authTimeout);
          let rawData = event.data;
          console.log('Raw data received:', typeof rawData, rawData.length || 'no length');
          
          if (rawData instanceof Blob) {
            rawData = await rawData.text();
          }
          
          const data = JSON.parse(rawData);
          console.log('Parsed data from Alpaca:', JSON.stringify(data, null, 2));
          
          if (Array.isArray(data)) {
            for (const message of data) {
              console.log('Processing message:', JSON.stringify(message, null, 2));
              
              if (message.T === 'success' && message.msg === 'authenticated') {
                isAuthenticated = true;
                connectionAttempts = 0;
                console.log('Successfully authenticated with Alpaca sandbox');
                
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
                clearTimeout(authTimeout);
                console.log('Alpaca connection failed, switching to mock data');
                startMockDataStream();
                
              } else if (isAuthenticated && (message.T === 't' || message.T === 'q' || message.T === 'b')) {
                console.log('Forwarding sandbox test data:', JSON.stringify(message, null, 2));
                
                const mappedData = {
                  ...message,
                  S: 'AAPL',
                  sandbox: true,
                  simulated: true,
                  source: 'alpaca_sandbox_test'
                };
                
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    type: 'market_data',
                    data: [mappedData]
                  }));
                }
              }
            }
          }
        } catch (error) {
          console.error('Error parsing Alpaca message:', error);
          clearTimeout(authTimeout);
          startMockDataStream();
        }
      };

      alpacaSocket.onerror = (error) => {
        console.error('Alpaca WebSocket error:', error);
        clearTimeout(authTimeout);
        startMockDataStream();
      };

      alpacaSocket.onclose = (event) => {
        console.log('Alpaca WebSocket disconnected:', event.code, event.reason);
        clearTimeout(authTimeout);
        isAuthenticated = false;
        
        if (!mockDataInterval) {
          startMockDataStream();
        }
      };
    } catch (error) {
      console.error('Failed to create Alpaca WebSocket:', error);
      startMockDataStream();
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
    if (mockDataInterval) {
      clearInterval(mockDataInterval);
      mockDataInterval = null;
    }
    if (alpacaSocket && alpacaSocket.readyState === WebSocket.OPEN) {
      alpacaSocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    if (mockDataInterval) {
      clearInterval(mockDataInterval);
      mockDataInterval = null;
    }
    if (alpacaSocket && alpacaSocket.readyState === WebSocket.OPEN) {
      alpacaSocket.close();
    }
  };

  return response;
});