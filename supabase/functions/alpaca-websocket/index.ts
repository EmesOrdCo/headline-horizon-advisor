import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  console.log('🔌 alpaca-websocket function called')
  
  // Handle WebSocket upgrade
  if (req.headers.get("upgrade") !== "websocket") {
    console.error('❌ Not a WebSocket request')
    return new Response("Expected websocket", { status: 400 })
  }

  const { socket, response } = Deno.upgradeWebSocket(req)
  
  // Get Alpaca API credentials
  const alpacaApiKey = Deno.env.get('ALPACA_API_KEY')
  const alpacaSecret = Deno.env.get('ALPACA_SECRET_KEY')

  console.log('🔑 API Key exists:', !!alpacaApiKey)
  console.log('🔑 Secret Key exists:', !!alpacaSecret)

  if (!alpacaApiKey || !alpacaSecret) {
    console.error('❌ Missing Alpaca credentials for WebSocket')
    socket.close(1000, "Alpaca API credentials not configured")
    return response
  }

  let alpacaWs: WebSocket | null = null

  socket.onopen = () => {
    console.log("✅ Client connected to WebSocket")
    
    // Try connecting to different Alpaca WebSocket endpoints
    const wsUrls = [
      "wss://stream.data.alpaca.markets/v2/stocks",
      "wss://stream.data.sandbox.alpaca.markets/v2/stocks"
    ];

    const connectToAlpaca = (urlIndex = 0) => {
      if (urlIndex >= wsUrls.length) {
        console.error('❌ Failed to connect to any Alpaca WebSocket');
        socket.send(JSON.stringify({ error: 'Failed to connect to Alpaca' }));
        return;
      }

      const wsUrl = wsUrls[urlIndex];
      console.log(`🔌 Connecting to Alpaca WebSocket: ${wsUrl}`);
      
      alpacaWs = new WebSocket(wsUrl);
      
      alpacaWs.onopen = () => {
        console.log(`✅ Connected to Alpaca WebSocket: ${wsUrl}`)
        
        // Authenticate with Alpaca
        const authMessage = {
          action: "auth",
          key: alpacaApiKey,
          secret: alpacaSecret
        };
        console.log('🔐 Sending auth message to Alpaca');
        alpacaWs!.send(JSON.stringify(authMessage));
      }

      alpacaWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("📡 Alpaca message received:", data)
          
          // Forward successful auth and data to client
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data))
          }
        } catch (error) {
          console.error("❌ Error parsing Alpaca message:", error)
        }
      }

      alpacaWs.onclose = (event) => {
        console.log(`🔌 Alpaca WebSocket closed: ${wsUrl}, code: ${event.code}, reason: ${event.reason}`)
        if (event.code !== 1000) {
          // Try next URL if connection failed
          console.log('⚠️ Connection failed, trying next endpoint...');
          connectToAlpaca(urlIndex + 1);
        }
      }

      alpacaWs.onerror = (error) => {
        console.error(`❌ Alpaca WebSocket error for ${wsUrl}:`, error)
        // Try next URL on error
        connectToAlpaca(urlIndex + 1);
      }
    };

    // Start connection attempts
    connectToAlpaca();
  }

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      console.log("📡 Client message received:", message)
      
      if (message.action === 'subscribe' && alpacaWs && alpacaWs.readyState === WebSocket.OPEN) {
        // Subscribe to trades for the symbol
        const subscribeMessage = {
          action: "subscribe",
          trades: [message.symbol],
          quotes: [message.symbol]
        };
        console.log(`📡 Subscribing to trades for ${message.symbol}:`, subscribeMessage);
        alpacaWs.send(JSON.stringify(subscribeMessage));
      }
    } catch (error) {
      console.error("❌ Error parsing client message:", error)
    }
  }

  socket.onclose = () => {
    console.log("🔌 Client disconnected")
    if (alpacaWs) {
      alpacaWs.close()
    }
  }

  socket.onerror = (error) => {
    console.error("❌ Client WebSocket error:", error)
  }

  return response
})