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
        console.log(`=== ACCOUNT CREATION REQUEST ===`);
        console.log(`URL: ${url}`);
        console.log(`Headers:`, JSON.stringify(headers, null, 2));
        console.log(`Account Data:`, JSON.stringify(data, null, 2));
        
        // Validate required fields before sending
        const requiredFields = ['account_type', 'contact', 'identity', 'disclosures', 'agreements'];
        for (const field of requiredFields) {
          if (!data[field]) {
            console.error(`Missing required field: ${field}`);
            throw new Error(`Missing required field: ${field}`);
          }
        }
        
        // Validate contact fields
        const requiredContactFields = ['email_address', 'phone_number', 'street_address', 'city', 'state', 'postal_code', 'country'];
        for (const field of requiredContactFields) {
          if (!data.contact[field]) {
            console.error(`Missing required contact field: ${field}`);
            throw new Error(`Missing required contact field: contact.${field}`);
          }
        }
        
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        
        console.log(`=== ACCOUNT CREATION RESPONSE ===`);
        console.log(`Status: ${response.status}`);
        console.log(`StatusText: ${response.statusText}`);
        break;

      case 'get_accounts':
        url = `${BROKER_BASE_URL}/v1/accounts`;
        response = await fetch(url, {
          method: 'GET',
          headers,
        });
        break;

      case 'get_account':
        // For trading accounts, we need to get both the basic account info and trading details
        url = `${BROKER_BASE_URL}/v1/accounts/${account_id}`;
        response = await fetch(url, {
          method: 'GET',
          headers,
        });
        
        // If successful, also fetch trading account details
        if (response.ok) {
          const basicAccount = await response.json();
          
          // Try to get trading account data - this has the equity, cash, buying_power fields
          const tradingUrl = `${BROKER_BASE_URL}/v1/trading/accounts/${account_id}/account`;
          const tradingResponse = await fetch(tradingUrl, {
            method: 'GET',
            headers,
          });
          
          if (tradingResponse.ok) {
            const tradingAccount = await tradingResponse.json();
            console.log('Trading account data:', tradingAccount);
            
            // Merge the data, prioritizing trading account fields
            const mergedAccount = {
              ...basicAccount,
              ...tradingAccount,
              // Ensure we have the expected field names
              equity: tradingAccount.equity || tradingAccount.last_equity || '0',
              cash: tradingAccount.cash || '0',
              buying_power: tradingAccount.buying_power || tradingAccount.cash || '0',
              long_market_value: tradingAccount.long_market_value || '0',
              short_market_value: tradingAccount.short_market_value || '0',
              // Also keep the original last_equity for reference
              last_equity: basicAccount.last_equity
            };
            
            return new Response(JSON.stringify({
              success: true,
              action,
              data: mergedAccount
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } else {
            console.log('Trading account endpoint failed, using basic account data only');
            // Fallback: use basic account data but map fields appropriately
            const mappedAccount = {
              ...basicAccount,
              equity: basicAccount.last_equity || '0',
              cash: '0', // Default since not available in basic account
              buying_power: '0', // Default since not available in basic account  
              long_market_value: '0', // Default since not available in basic account
              short_market_value: '0' // Default since not available in basic account
            };
            
            return new Response(JSON.stringify({
              success: true,
              action,
              data: mappedAccount
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
        break;

      case 'create_ach_relationship':
        url = `${BROKER_BASE_URL}/v1/accounts/${account_id}/ach_relationships`;
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        break;

      case 'get_ach_relationships':
        url = `${BROKER_BASE_URL}/v1/accounts/${account_id}/ach_relationships`;
        response = await fetch(url, {
          method: 'GET',
          headers,
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
        console.log('=== ALPACA BROKER API CREATE_JOURNAL ===');
        console.log('Request data:', JSON.stringify(data, null, 2));
        console.log('Checking if this is a withdrawal request...');
        console.log('to_account value:', data.to_account);
        console.log('Is withdrawal?', data.to_account === 'alpaca-funding-source');
        
        // For withdrawals (to alpaca-funding-source), create a real journal transfer
        if (data.to_account === 'alpaca-funding-source') {
          console.log('Creating journal transfer for withdrawal simulation...');
          
          // Create a journal transfer to a funding account to simulate withdrawal
          // This will actually deduct the money from the account balance
          const journalData = {
            from_account: data.from_account,
            to_account: '00000000-0000-0000-0000-000000000000', // Use a standard funding source ID
            entry_type: 'JNLC', // Journal Cash
            amount: data.amount,
            description: `Simulated withdrawal of $${data.amount}`
          };
          
          console.log('Making journal API request:', journalData);
          
          response = await fetch(`${BROKER_BASE_URL}/v1/journals`, {
            method: 'POST',
            headers,
            body: JSON.stringify(journalData),
          });
          
          console.log('Journal API response status:', response.status);
          console.log('Journal API response headers:', Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Journal API failed with error:', errorText);
            console.error('This confirms Alpaca sandbox does not support real withdrawals');
            
            // Return a clear explanation that sandbox doesn't support real withdrawals
            const simulatedResponse = {
              id: `sim-withdrawal-${Date.now()}`,
              from_account: data.from_account,
              to_account: 'external-funding',
              entry_type: 'JNLC',
              amount: data.amount,
              status: 'SIMULATED',
              created_at: new Date().toISOString(),
              description: `Withdrawal simulation - Alpaca sandbox cannot modify account balances`,
              limitation: 'Alpaca sandbox environment does not support real balance modifications for withdrawals'
            };
            
            return new Response(JSON.stringify({
              success: true,
              action: 'create_journal',
              data: simulatedResponse,
              warning: 'Withdrawal only simulated - Alpaca sandbox does not support real balance modifications. In production, this would actually deduct money from your account.'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } else {
            // If journal API succeeded, log the success
            const journalResult = await response.json();
            console.log('✅ Journal API SUCCESS! Withdrawal should affect account balance:', journalResult);
            
            return new Response(JSON.stringify({
              success: true,
              action: 'create_journal',
              data: journalResult
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } else {
          // Regular journal transfer between accounts
          console.log('Processing regular journal transfer...');
          url = `${BROKER_BASE_URL}/v1/journals`;
          response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
          });
        }
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

      case 'cancel_order':
        url = `${BROKER_BASE_URL}/v1/trading/accounts/${account_id}/orders/${data.order_id}`;
        console.log(`Making cancel order request to: ${url}`);
        console.log(`Order ID to cancel: ${data.order_id}`);
        
        response = await fetch(url, {
          method: 'DELETE',
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
        // Try different activity endpoints to find transfers
        const activityUrls = [
          `${BROKER_BASE_URL}/v1/trading/accounts/${account_id}/activities`,
          `${BROKER_BASE_URL}/v1/accounts/${account_id}/activities`, 
          `${BROKER_BASE_URL}/v1/trading/accounts/${account_id}/activities/TRANS`,
          `${BROKER_BASE_URL}/v1/accounts/${account_id}/transfers`
        ];
        
        let activitiesFound = false;
        
        for (const baseUrl of activityUrls) {
          try {
            url = baseUrl;
            const activityParams = new URLSearchParams();
            if (data?.activity_types && !url.includes('/transfers')) {
              activityParams.append('activity_types', data.activity_types);
            }
            if (data?.date) activityParams.append('date', data.date);
            if (activityParams.toString()) url += `?${activityParams.toString()}`;
            
            console.log(`Trying activities URL: ${url}`);
            
            response = await fetch(url, {
              method: 'GET',
              headers,
            });
            
            if (response.ok) {
              activitiesFound = true;
              console.log(`Successfully found activities at: ${url}`);
              break;
            } else {
              console.log(`Activities URL failed (${response.status}): ${url}`);
            }
          } catch (urlError) {
            console.log(`Error trying URL ${url}:`, urlError);
            continue;
          }
        }
        
        // If none of the URLs worked, return empty array
        if (!activitiesFound) {
          console.log('All activities endpoints returned 404 - returning empty array for new account');
          return new Response(JSON.stringify({
            success: true,
            action,
            data: [] // Return empty activities array for new accounts
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
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
        // Only try to parse as JSON if the content looks like JSON
        if (errorText.trim().startsWith('{') || errorText.trim().startsWith('[')) {
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
        } else {
          // If it's not JSON, treat it as plain text error
          console.log(`Plain text error response:`, errorText);
          if (errorText.toLowerCase().includes('not found')) {
            errorMessage = `Resource not found (${response.status}). This may be normal for some operations.`;
          } else if (errorText.toLowerCase().includes('forbidden') || errorText.toLowerCase().includes('unauthorized')) {
            errorMessage = 'API access denied. This endpoint may not be available in sandbox mode.';
          } else if (action === 'create_ach_relationship' || action === 'create_transfer') {
            errorMessage = 'ACH transfers may not be fully supported in sandbox mode. Please try the journal transfer option instead.';
          } else {
            errorMessage = errorText || `API request failed with status ${response.status}`;
          }
        }
      } catch (parseError) {
        console.error(`Failed to parse error JSON:`, parseError);
        // If parsing fails, use the original error text
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    // Handle different response types
    let responseData;
    if (response.status === 204) {
      // 204 No Content - successful but no response body (e.g., order cancellation)
      console.log(`${action} completed successfully (204 No Content)`);
      responseData = { message: 'Operation completed successfully' };
    } else {
      responseData = await response.json();
      console.log(`${action} response:`, responseData);
    }

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