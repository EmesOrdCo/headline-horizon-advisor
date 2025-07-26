import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BROKER_BASE_URL = 'https://broker-api.sandbox.alpaca.markets';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, account_id, data } = await req.json();
    
    const apiKey = Deno.env.get("ALPACA_API_KEY");
    const secretKey = Deno.env.get("ALPACA_SECRET_KEY");

    console.log(`=== ALPACA BROKER API ${action.toUpperCase()} ===`);
    console.log('API Key exists:', !!apiKey);
    console.log('Secret Key exists:', !!secretKey);
    console.log('API Key prefix:', apiKey ? apiKey.substring(0, 8) + '...' : 'undefined');
    console.log('Request data:', JSON.stringify(data, null, 2));

    if (!apiKey || !secretKey) {
      console.error('Missing API credentials');
      throw new Error('Alpaca broker API credentials not configured');
    }

    // Broker API uses HTTP Basic Auth (key:secret format)
    const basicAuth = btoa(`${apiKey}:${secretKey}`);
    const headers = {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    let response;
    let url;

    switch (action) {
      case 'create_account':
        url = `${BROKER_BASE_URL}/v1/accounts`;
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        break;

      case 'get_accounts':
        url = `${BROKER_BASE_URL}/v1/accounts`;
        response = await fetch(url, {
          method: 'GET',
          headers,
        });
        break;

      case 'get_account':
        url = `${BROKER_BASE_URL}/v1/accounts/${account_id}`;
        response = await fetch(url, {
          method: 'GET',
          headers,
        });
        break;

      case 'create_ach_relationship':
        url = `${BROKER_BASE_URL}/v1/accounts/${account_id}/ach_relationships`;
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        break;

      case 'create_transfer':
        url = `${BROKER_BASE_URL}/v1/accounts/${account_id}/transfers`;
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        break;

      case 'create_journal':
        url = `${BROKER_BASE_URL}/v1/journals`;
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        break;

      case 'get_assets':
        url = `${BROKER_BASE_URL}/v1/assets`;
        const params = new URLSearchParams();
        if (data?.status) params.append('status', data.status);
        if (data?.asset_class) params.append('asset_class', data.asset_class);
        if (data?.exchange) params.append('exchange', data.exchange);
        if (params.toString()) url += `?${params.toString()}`;
        
        response = await fetch(url, {
          method: 'GET',
          headers,
        });
        break;

      case 'place_order':
        url = `${BROKER_BASE_URL}/v1/trading/accounts/${account_id}/orders`;
        
        // Clean up the order data - remove empty limit_price for market orders
        const orderData = { ...data };
        if (orderData.type === 'market' && orderData.limit_price === '') {
          delete orderData.limit_price;
        }
        
        console.log(`Making ${action} request to: ${url}`);
        console.log(`Request headers:`, JSON.stringify(headers, null, 2));
        console.log(`Cleaned order data:`, JSON.stringify(orderData, null, 2));
        
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(orderData),
        });
        break;

      case 'get_orders':
        url = `${BROKER_BASE_URL}/v1/trading/accounts/${account_id}/orders`;
        const orderParams = new URLSearchParams();
        if (data?.status) orderParams.append('status', data.status);
        if (data?.limit) orderParams.append('limit', data.limit.toString());
        if (orderParams.toString()) url += `?${orderParams.toString()}`;
        
        response = await fetch(url, {
          method: 'GET',
          headers,
        });
        break;

      case 'get_positions':
        url = `${BROKER_BASE_URL}/v1/trading/accounts/${account_id}/positions`;
        response = await fetch(url, {
          method: 'GET',
          headers,
        });
        break;

      case 'get_activities':
        url = `${BROKER_BASE_URL}/v1/trading/accounts/${account_id}/activities`;
        const activityParams = new URLSearchParams();
        if (data?.activity_types) activityParams.append('activity_types', data.activity_types);
        if (data?.date) activityParams.append('date', data.date);
        if (activityParams.toString()) url += `?${activityParams.toString()}`;
        
        response = await fetch(url, {
          method: 'GET',
          headers,
        });
        break;

      case 'get_portfolio_history':
        url = `${BROKER_BASE_URL}/v1/trading/accounts/${account_id}/portfolio/history`;
        const historyParams = new URLSearchParams();
        if (data?.period) historyParams.append('period', data.period);
        if (data?.timeframe) historyParams.append('timeframe', data.timeframe);
        if (historyParams.toString()) url += `?${historyParams.toString()}`;
        
        response = await fetch(url, {
          method: 'GET',
          headers,
        });
        break;

      case 'get_market_data':
        url = `${BROKER_BASE_URL}/v1/trading/accounts/data/stocks/quotes/latest`;
        const symbols = Array.isArray(data?.symbols) ? data.symbols.join(',') : data?.symbols;
        if (symbols) url += `?symbols=${symbols}`;
        
        response = await fetch(url, {
          method: 'GET',
          headers,
        });
        break;

      case 'get_historical_bars':
        url = `${BROKER_BASE_URL}/v1/trading/accounts/data/stocks/bars`;
        const barParams = new URLSearchParams();
        if (data?.symbols) barParams.append('symbols', data.symbols);
        if (data?.timeframe) barParams.append('timeframe', data.timeframe);
        if (data?.start) barParams.append('start', data.start);
        if (data?.end) barParams.append('end', data.end);
        if (data?.limit) barParams.append('limit', data.limit.toString());
        if (barParams.toString()) url += `?${barParams.toString()}`;
        
        response = await fetch(url, {
          method: 'GET',
          headers,
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log request info for other actions (place_order has its own logging)
    if (action !== 'place_order') {
      console.log(`Making ${action} request to: ${url}`);
      console.log(`Request headers:`, JSON.stringify(headers, null, 2));
      
      // Log request body for POST requests
      if (['create_account', 'create_ach_relationship', 'create_transfer', 'create_journal'].includes(action)) {
        console.log(`Request body:`, JSON.stringify(data, null, 2));
      } else {
        console.log(`Request body: GET request (no body)`);
      }
    }
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Alpaca ${action} API error: ${response.status} - ${errorText}`);
      console.error(`Full error response:`, errorText);
      
      // Try to parse JSON error response for better error messages
      let errorMessage = `API request failed: ${response.status}`;
      let errorCode = null;
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log(`Parsed error JSON:`, errorJson);
        
        if (errorJson.message) {
          errorMessage = errorJson.message;
        } else if (errorJson.error) {
          errorMessage = errorJson.error;
        } else if (errorJson.detail) {
          errorMessage = errorJson.detail;
        }
        
        errorCode = errorJson.code;
        
        // Map common error codes to user-friendly messages
        if (errorCode === 40010000) {
          errorMessage = "Invalid order format. Please check your order details.";
        } else if (errorMessage.toLowerCase().includes('insufficient')) {
          errorMessage = "Insufficient buying power. You don't have enough funds for this trade.";
        } else if (errorMessage.toLowerCase().includes('not_tradable')) {
          errorMessage = "This stock is not available for trading.";
        } else if (errorMessage.toLowerCase().includes('market_closed')) {
          errorMessage = "Market is currently closed. Orders will be queued for next trading session.";
        } else if (errorMessage.toLowerCase().includes('already exists') || 
                   errorMessage.toLowerCase().includes('duplicate email') ||
                   errorMessage.toLowerCase().includes('email already used') ||
                   response.status === 409) {
          errorMessage = "An account with this email already exists. Please use a different email address.";
        } else if (errorMessage.toLowerCase().includes('invalid email')) {
          errorMessage = "Please provide a valid email address.";
        } else if (errorMessage.toLowerCase().includes('invalid phone')) {
          errorMessage = "Please provide a valid phone number.";
        } else if (errorMessage.toLowerCase().includes('invalid tax id') || 
                   errorMessage.toLowerCase().includes('invalid ssn')) {
          errorMessage = "Please provide a valid Tax ID/SSN.";
        } else if (errorMessage.toLowerCase().includes('kyc')) {
          errorMessage = "KYC verification failed. Please check your personal information.";
        }
      } catch (parseError) {
        console.error(`Failed to parse error JSON:`, parseError);
        // If parsing fails, use the original error text
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log(`${action} response:`, responseData);

    return new Response(JSON.stringify({
      success: true,
      action,
      data: responseData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Alpaca Broker API error:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: `Alpaca Broker API error: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});