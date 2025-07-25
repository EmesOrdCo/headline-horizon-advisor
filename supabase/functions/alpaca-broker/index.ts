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

    const headers = {
      'APCA-API-KEY-ID': apiKey,
      'APCA-API-SECRET-KEY': secretKey,
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
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
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
        url = `${BROKER_BASE_URL}/v1/accounts/${account_id}/activities`;
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

    console.log(`Making ${action} request to: ${url}`);
    console.log(`Request headers:`, JSON.stringify(headers, null, 2));
    console.log(`Request body:`, response ? 'POST' : 'GET');
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Alpaca ${action} API error: ${response.status} - ${errorText}`);
      console.error(`Full error response:`, errorText);
      throw new Error(`${action} API request failed: ${response.status} - ${errorText}`);
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