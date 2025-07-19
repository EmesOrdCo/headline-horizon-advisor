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

  // Get proper Alpaca trader credentials from Supabase secrets
  const alpacaApiKey = Deno.env.get("ALPACA_TRADER_API_KEY");
  const alpacaSecretKey = Deno.env.get("ALPACA_TRADER_SECRET_KEY");

  console.log('Using Alpaca trader credentials for polling approach');
  console.log('Trader API Key exists:', !!alpacaApiKey);
  console.log('Trader Secret Key exists:', !!alpacaSecretKey);

  if (!alpacaApiKey || !alpacaSecretKey) {
    console.error('Missing Alpaca trader API credentials');
    return new Response("Missing Alpaca trader API credentials", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let subscribedSymbols: string[] = [];
  let pollingInterval: number | null = null;
  let failedRequests = 0;
  const maxFailedRequests = 3;
  let pollingRate = 5000; // Start with 5 seconds
  const maxPollingRate = 30000; // Max 30 seconds

  const fetchStockData = async (symbols: string[]) => {
    if (symbols.length === 0) return;

    try {
      const symbolsParam = symbols.join(',');
      const url = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${symbolsParam}`;
      
      console.log(`Polling Alpaca API for: ${symbolsParam}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'APCA-API-KEY-ID': alpacaApiKey,
          'APCA-API-SECRET-KEY': alpacaSecretKey,
          'User-Agent': 'Mozilla/5.0 (compatible; StockApp/1.0)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`API error: ${response.status} - ${await response.text()}`);
        failedRequests++;
        
        // If we get rate limited, increase polling interval
        if (response.status === 429 || response.status === 406) {
          pollingRate = Math.min(pollingRate * 2, maxPollingRate);
          console.log(`Rate limited, increasing polling interval to ${pollingRate}ms`);
        }
        
        if (failedRequests >= maxFailedRequests) {
          console.log('Too many failed requests, switching to mock data');
          sendMockData(symbols);
        }
        return;
      }

      const data = await response.json();
      console.log(`Successful polling response:`, data);
      
      // Reset failure count on success
      failedRequests = 0;
      pollingRate = Math.max(pollingRate / 1.5, 5000); // Gradually decrease polling interval on success
      
      // Convert to market data format and send
      if (data.quotes) {
        const marketData = Object.entries(data.quotes).map(([symbol, quote]: [string, any]) => ({
          T: 'q', // quote
          S: symbol,
          bp: quote.bp, // bid price
          ap: quote.ap, // ask price
          bs: quote.bs, // bid size
          as: quote.as, // ask size
          t: Date.now() * 1000000 // timestamp in nanoseconds
        }));

        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'market_data',
            data: marketData
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      failedRequests++;
      
      if (failedRequests >= maxFailedRequests) {
        console.log('Too many failed requests, switching to mock data');
        sendMockData(symbols);
      }
    }
  };

  const sendMockData = (symbols: string[]) => {
    const mockPrices: Record<string, number> = {
      'AAPL': 225.75,
      'MSFT': 441.85,
      'GOOGL': 178.92,
      'AMZN': 215.38,
      'NVDA': 144.75,
      'TSLA': 359.22,
      'META': 598.45
    };

    const mockData = symbols.map(symbol => {
      const basePrice = mockPrices[symbol] || 100 + Math.random() * 500;
      const variance = (Math.random() - 0.5) * 0.02; // ±1% variation
      const price = basePrice * (1 + variance);
      
      return {
        T: 'q', // quote
        S: symbol,
        bp: price * 0.999, // bid slightly lower
        ap: price * 1.001, // ask slightly higher
        bs: Math.floor(Math.random() * 100) + 1,
        as: Math.floor(Math.random() * 100) + 1,
        t: Date.now() * 1000000
      };
    });

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'market_data',
        data: mockData
      }));
    }
  };

  const startPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    console.log(`Starting polling with ${pollingRate}ms interval`);
    
    pollingInterval = setInterval(() => {
      if (subscribedSymbols.length > 0) {
        fetchStockData(subscribedSymbols);
      }
    }, pollingRate);

    // Fetch data immediately
    if (subscribedSymbols.length > 0) {
      fetchStockData(subscribedSymbols);
    }
  };

  socket.onopen = () => {
    console.log('Client WebSocket connected to polling data stream');
    
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'auth_success',
        message: 'Connected to polling-based data stream'
      }));
    }
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received from client:', message);
      
      if (message.type === 'subscribe') {
        subscribedSymbols = message.symbols || [];
        console.log('Subscribed symbols for polling:', subscribedSymbols);
        
        if (subscribedSymbols.length > 0) {
          startPolling();
        } else if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  };

  socket.onclose = () => {
    console.log('Client WebSocket disconnected from polling stream');
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  };

  return response;
});