import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Store WebSocket connections
const connections = new Map<string, WebSocket>()

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Handle WebSocket upgrade
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected websocket", { status: 400 })
  }

  const { socket, response } = Deno.upgradeWebSocket(req)
  
  // Get Alpaca API credentials
  const alpacaApiKey = Deno.env.get('ALPACA_API_KEY')
  const alpacaSecret = Deno.env.get('ALPACA_SECRET_KEY')

  if (!alpacaApiKey || !alpacaSecret) {
    socket.close(1000, "Alpaca API credentials not configured")
    return response
  }

  let alpacaWs: WebSocket | null = null

  socket.onopen = () => {
    console.log("Client connected")
    
    // Connect to Alpaca WebSocket
    alpacaWs = new WebSocket("wss://stream.data.sandbox.alpaca.markets/v2/stocks")
    
    alpacaWs.onopen = () => {
      console.log("Connected to Alpaca WebSocket")
      // Authenticate with Alpaca
      alpacaWs!.send(JSON.stringify({
        action: "auth",
        key: alpacaApiKey,
        secret: alpacaSecret
      }))
    }

    alpacaWs.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log("Alpaca message:", data)
      
      // Forward data to client
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data))
      }
    }

    alpacaWs.onclose = () => {
      console.log("Alpaca WebSocket closed")
    }

    alpacaWs.onerror = (error) => {
      console.error("Alpaca WebSocket error:", error)
    }
  }

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      console.log("Client message:", message)
      
      if (message.action === 'subscribe' && alpacaWs && alpacaWs.readyState === WebSocket.OPEN) {
        // Subscribe to trades for the symbol
        alpacaWs.send(JSON.stringify({
          action: "subscribe",
          trades: [message.symbol],
          quotes: [message.symbol]
        }))
      }
    } catch (error) {
      console.error("Error parsing client message:", error)
    }
  }

  socket.onclose = () => {
    console.log("Client disconnected")
    if (alpacaWs) {
      alpacaWs.close()
    }
  }

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error)
  }

  return response
})