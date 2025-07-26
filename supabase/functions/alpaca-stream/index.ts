import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Global connection state to prevent multiple connections and handle rate limits
let globalAlpacaSocket: WebSocket | null = null;
let globalConnectionPromise: Promise<void> | null = null;
let globalIsAuthenticated = false;
let globalSubscribers = new Set<WebSocket>();
let globalConnectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 10;
let globalRetryTimeout: number | null = null;
let lastConnectionTime = 0;
const MIN_CONNECTION_INTERVAL = 5000; // 5 seconds between connection attempts

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const alpacaApiKey = Deno.env.get("ALPACA_API_KEY");
  const alpacaSecretKey = Deno.env.get("ALPACA_SECRET_KEY");

  console.log('🔌 New client connection request');
  console.log('🔑 API credentials status:', { 
    keyExists: !!alpacaApiKey, 
    secretExists: !!alpacaSecretKey,
    keyPrefix: alpacaApiKey ? alpacaApiKey.substring(0, 8) + '...' : 'None'
  });

  if (!alpacaApiKey || !alpacaSecretKey) {
    console.error('❌ Missing Alpaca API credentials');
    return new Response("Missing Alpaca API credentials", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  // Add this client to global subscribers
  globalSubscribers.add(socket);
  console.log(`👥 Client added, total subscribers: ${globalSubscribers.size}`);

  // Function to broadcast to all subscribers
  const broadcastToSubscribers = (message: any) => {
    const messageStr = JSON.stringify(message);
    const disconnectedClients: WebSocket[] = [];
    
    globalSubscribers.forEach(subscriber => {
      if (subscriber.readyState === WebSocket.OPEN) {
        try {
          subscriber.send(messageStr);
        } catch (error) {
          console.error('❌ Error sending to subscriber:', error);
          disconnectedClients.push(subscriber);
        }
      } else {
        disconnectedClients.push(subscriber);
      }
    });
    
    // Clean up disconnected clients
    disconnectedClients.forEach(client => globalSubscribers.delete(client));
  };

  // Function to connect to Alpaca with proper rate limiting
  const connectToAlpaca = async (): Promise<void> => {
    // Check if connection already exists and is working
    if (globalAlpacaSocket?.readyState === WebSocket.OPEN && globalIsAuthenticated) {
      console.log('✅ Using existing authenticated connection');
      broadcastToSubscribers({
        type: 'auth_success',
        message: 'Connected to existing Alpaca stream - AAPL data available',
        symbol: 'AAPL'
      });
      return Promise.resolve();
    }

    // CRITICAL: Wait 60 seconds before attempting ANY new connections
    const now = Date.now();
    const timeSinceLastConnection = now - lastConnectionTime;
    const MANDATORY_WAIT = 60000; // 60 seconds mandatory wait
    
    if (timeSinceLastConnection < MANDATORY_WAIT) {
      const waitTime = MANDATORY_WAIT - timeSinceLastConnection;
      console.log(`🛑 MANDATORY WAIT: ${Math.round(waitTime/1000)}s remaining before next connection attempt`);
      
      broadcastToSubscribers({
        type: 'error',
        message: `Waiting ${Math.round(waitTime/1000)}s to avoid connection limits`,
        code: 'RATE_LIMIT_WAIT'
      });
      
      // Schedule connection after wait period
      setTimeout(async () => {
        try {
          await connectToAlpaca();
        } catch (error) {
          console.error('❌ Delayed connection failed:', error);
        }
      }, waitTime);
      
      return Promise.resolve();
    }

    // Check if connection is already in progress
    if (globalConnectionPromise) {
      console.log('⏳ Connection already in progress, waiting...');
      try {
        await globalConnectionPromise;
        return;
      } catch (error) {
        console.error('❌ Previous connection attempt failed:', error);
        globalConnectionPromise = null;
      }
    }

    // Check rate limiting
    const currentTime = Date.now();
    const timeSinceLastAttempt = currentTime - lastConnectionTime;
    if (timeSinceLastAttempt < MIN_CONNECTION_INTERVAL) {
      const waitTime = MIN_CONNECTION_INTERVAL - timeSinceLastAttempt;
      console.log(`⏰ Rate limiting: waiting ${waitTime}ms before connection`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    console.log(`🔄 Starting connection attempt ${globalConnectionAttempts + 1}/${MAX_CONNECTION_ATTEMPTS}`);
    
    globalConnectionPromise = new Promise((resolve, reject) => {
      if (globalConnectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        console.error('❌ Max connection attempts exceeded');
        broadcastToSubscribers({
          type: 'error',
          message: 'Max connection attempts exceeded - service temporarily unavailable',
          code: 'MAX_RETRIES'
        });
        reject(new Error('Max attempts exceeded'));
        return;
      }

      globalConnectionAttempts++;
      lastConnectionTime = Date.now();

      // Close existing connection if any
      if (globalAlpacaSocket) {
        console.log('🔄 Closing existing connection');
        try {
          globalAlpacaSocket.close();
        } catch (error) {
          console.error('Error closing existing connection:', error);
        }
        globalAlpacaSocket = null;
        globalIsAuthenticated = false;
      }

      // Clear retry timeout if exists
      if (globalRetryTimeout) {
        clearTimeout(globalRetryTimeout);
        globalRetryTimeout = null;
      }

      console.log('🌐 Creating new WebSocket connection to Alpaca sandbox...');
      
      try {
        globalAlpacaSocket = new WebSocket('wss://stream.data.sandbox.alpaca.markets/v2/test');
        
        let authTimeout: number;
        let connectionResolved = false;

        const resolveConnection = (success: boolean, error?: string) => {
          if (connectionResolved) return;
          connectionResolved = true;
          clearTimeout(authTimeout);
          globalConnectionPromise = null;
          
          if (success) {
            globalConnectionAttempts = 0; // Reset on success
            resolve();
          } else {
            reject(new Error(error || 'Connection failed'));
          }
        };

        globalAlpacaSocket.onopen = () => {
          console.log('✅ WebSocket opened, sending authentication...');
          
          const authMessage = {
            action: 'auth',
            key: alpacaApiKey,
            secret: alpacaSecretKey
          };
          
          try {
            globalAlpacaSocket!.send(JSON.stringify(authMessage));
            console.log('🔑 Authentication message sent');
          } catch (error) {
            console.error('❌ Failed to send auth message:', error);
            resolveConnection(false, 'Failed to send authentication');
            return;
          }
          
          // Set auth timeout - increased to 30 seconds
          authTimeout = setTimeout(() => {
            console.error('❌ Authentication timeout after 30 seconds');
            broadcastToSubscribers({
              type: 'error',
              message: 'Authentication timeout - retrying...',
              code: 404
            });
            resolveConnection(false, 'Authentication timeout');
          }, 30000);
        };

        globalAlpacaSocket.onmessage = async (event) => {
          try {
            const rawData = event.data instanceof Blob ? await event.data.text() : event.data;
            const data = JSON.parse(rawData);
            
            console.log('📨 Alpaca message:', JSON.stringify(data));
            
            if (Array.isArray(data)) {
              for (const message of data) {
                if (message.T === 'success' && message.msg === 'authenticated') {
                  globalIsAuthenticated = true;
                  console.log('🎉 Authentication successful!');
                  
                  // Subscribe to AAPL data
                  const subscribeMessage = {
                    action: 'subscribe',
                    trades: ['AAPL'],
                    quotes: ['AAPL']
                  };
                  
                  console.log('📋 Subscribing to AAPL...');
                  globalAlpacaSocket!.send(JSON.stringify(subscribeMessage));
                  
                  broadcastToSubscribers({
                    type: 'auth_success',
                    message: 'Successfully connected to Alpaca - streaming AAPL data',
                    symbol: 'AAPL'
                  });
                  
                  resolveConnection(true);
                  
                } else if (message.T === 'subscription') {
                  console.log('✅ Subscription confirmed:', message);
                  
                } else if (message.T === 'error') {
                  console.error('❌ Alpaca error:', message);
                  
                  const errorCode = message.code || 'UNKNOWN';
                  const errorMsg = message.msg || 'Unknown error';
                  
                  // Handle specific error codes
                  if (errorCode === 406 || errorMsg.includes('connection limit')) {
                    console.error('🚫 Connection limit exceeded, implementing backoff');
                    broadcastToSubscribers({
                      type: 'error',
                      message: 'Connection limit exceeded - implementing backoff strategy',
                      code: 406
                    });
                  } else {
                    broadcastToSubscribers({
                      type: 'error',
                      message: errorMsg,
                      code: errorCode
                    });
                  }
                  
                  resolveConnection(false, `Alpaca error: ${errorMsg}`);
                  
                } else if (globalIsAuthenticated && (message.T === 't' || message.T === 'q')) {
                  // Forward real market data to all subscribers
                  console.log('💹 Broadcasting AAPL data:', message.T, message.S, message.p || message.bp);
                  
                  broadcastToSubscribers({
                    type: 'market_data',
                    data: [message]
                  });
                }
              }
            }
          } catch (error) {
            console.error('❌ Error processing Alpaca message:', error);
          }
        };

        globalAlpacaSocket.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          broadcastToSubscribers({
            type: 'error',
            message: 'WebSocket connection error - retrying...',
            code: 'WS_ERROR'
          });
          resolveConnection(false, 'WebSocket error');
        };

        globalAlpacaSocket.onclose = (event) => {
          console.error(`❌ WebSocket closed: ${event.code} - ${event.reason || 'No reason'}`);
          globalIsAuthenticated = false;
          
          let errorMessage = 'Connection closed';
          let shouldRetry = true;
          
          switch (event.code) {
            case 1000:
              errorMessage = 'Connection closed normally';
              shouldRetry = false;
              break;
            case 1006:
              errorMessage = 'Connection lost unexpectedly - retrying...';
              break;
            case 1011:
              errorMessage = 'Server overloaded (connection limit) - retrying with backoff...';
              break;
            case 4001:
              errorMessage = 'Authentication failed - check credentials';
              shouldRetry = false;
              break;
            default:
              errorMessage = event.reason || `Connection closed (${event.code}) - retrying...`;
          }
          
          broadcastToSubscribers({
            type: 'error',
            message: errorMessage,
            code: event.code
          });
          
          resolveConnection(false, errorMessage);
          
          // Schedule retry if appropriate and we have subscribers
          if (shouldRetry && globalSubscribers.size > 0 && globalConnectionAttempts < MAX_CONNECTION_ATTEMPTS) {
            // Exponential backoff with jitter
            const baseDelay = Math.min(2000 * Math.pow(2, globalConnectionAttempts - 1), 60000);
            const jitter = Math.random() * 1000;
            const retryDelay = baseDelay + jitter;
            
            console.log(`🔄 Scheduling retry in ${Math.round(retryDelay)}ms (attempt ${globalConnectionAttempts}/${MAX_CONNECTION_ATTEMPTS})`);
            
            globalRetryTimeout = setTimeout(async () => {
              try {
                console.log('🔄 Executing retry...');
                await connectToAlpaca();
              } catch (error) {
                console.error('❌ Retry failed:', error);
              }
            }, retryDelay);
          } else if (globalConnectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
            console.error('❌ Max retries exceeded, giving up');
            broadcastToSubscribers({
              type: 'error',
              message: 'Max retry attempts exceeded - please refresh page',
              code: 'MAX_RETRIES'
            });
          }
        };
        
      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        resolveConnection(false, 'Failed to create WebSocket');
      }
    });

    return globalConnectionPromise;
  };

  // Handle individual client events
  socket.onopen = async () => {
    console.log('👋 Client connected');
    
    // Try to connect to Alpaca
    try {
      await connectToAlpaca();
    } catch (error) {
      console.error('❌ Failed to establish Alpaca connection:', error);
      // Client will get error messages via broadcast
    }
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("📩 Client message:", message);
      
      if (message.action === 'subscribe' && message.symbols) {
        console.log("📋 Client requesting subscription to:", message.symbols);
        
        // We only support AAPL currently
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'subscribed',
            symbols: ['AAPL'],
            message: 'Subscribed to AAPL data stream'
          }));
        }
      }
    } catch (error) {
      console.error("❌ Error parsing client message:", error);
    }
  };

  socket.onclose = () => {
    console.log('👋 Client disconnected');
    globalSubscribers.delete(socket);
    console.log(`👥 Remaining subscribers: ${globalSubscribers.size}`);
    
    // If no more subscribers, clean up
    if (globalSubscribers.size === 0) {
      console.log('🧹 No subscribers left, cleaning up...');
      
      if (globalAlpacaSocket) {
        globalAlpacaSocket.close();
        globalAlpacaSocket = null;
      }
      
      globalIsAuthenticated = false;
      globalConnectionAttempts = 0;
      
      if (globalRetryTimeout) {
        clearTimeout(globalRetryTimeout);
        globalRetryTimeout = null;
      }
      
      globalConnectionPromise = null;
    }
  };

  socket.onerror = (error) => {
    console.error('❌ Client error:', error);
    globalSubscribers.delete(socket);
  };

  return response;
});