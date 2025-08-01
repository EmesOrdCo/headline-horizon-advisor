import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { account_id } = await req.json();
    
    // Get the authorization header for user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify that the account_id belongs to the authenticated user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('alpaca_account_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    if (profile.alpaca_account_id !== account_id) {
      throw new Error('Unauthorized: Account does not belong to user');
    }
    
    const apiKey = Deno.env.get("ALPACA_API_KEY");
    const secretKey = Deno.env.get("ALPACA_SECRET_KEY");

    console.log(`=== GET TRANSFERS FOR USER ${user.id} ACCOUNT ${account_id} ===`);
    console.log('API Key exists:', !!apiKey);
    console.log('Secret Key exists:', !!secretKey);

    if (!apiKey || !secretKey) {
      throw new Error('Alpaca API credentials not configured');
    }

    const basicAuth = btoa(`${apiKey}:${secretKey}`);
    const headers = {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Try multiple endpoints to find transfer data
    const endpoints = [
      `${BROKER_BASE_URL}/v1/accounts/${account_id}/transfers`,
      `${BROKER_BASE_URL}/v1/trading/accounts/${account_id}/activities`,
      `${BROKER_BASE_URL}/v1/accounts/${account_id}/activities`,
      `${BROKER_BASE_URL}/v1/trading/accounts/${account_id}/activities?activity_types=TRANS,CSD,CSR,JNLC,JNLS`
    ];

    let transfers = [];

    for (const url of endpoints) {
      try {
        console.log(`Trying endpoint: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        console.log(`Response status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`Success! Data from ${url}:`, data);
          
          if (Array.isArray(data) && data.length > 0) {
            // Process the activities into transfer format
            const processedTransfers = data
              .filter(item => {
                // Filter for transfer-related activities
                const activityType = item.activity_type || item.type;
                const isTransfer = activityType === 'TRANS' ||
                                 activityType === 'CSD' ||
                                 activityType === 'CSR' ||
                                 activityType === 'JNLC' ||
                                 activityType === 'JNLS' ||
                                 activityType === 'ACH' ||
                                 activityType === 'WIRE' ||
                                 item.direction === 'INCOMING' ||
                                 item.direction === 'OUTGOING' ||
                                 (item.description && (
                                   item.description.toLowerCase().includes('deposit') ||
                                   item.description.toLowerCase().includes('withdrawal') ||
                                   item.description.toLowerCase().includes('transfer')
                                 ));
                
                console.log(`Item: ${JSON.stringify(item)} | isTransfer: ${isTransfer}`);
                return isTransfer;
              })
              .map(item => {
                const amount = item.amount || item.net_amount || item.qty || '0';
                const numericAmount = parseFloat(amount.toString());
                
                return {
                  id: item.id || item.transaction_id || `transfer-${Date.now()}-${Math.random()}`,
                  amount: Math.abs(numericAmount).toFixed(2),
                  direction: numericAmount >= 0 ? 'INCOMING' : 'OUTGOING',
                  status: item.status || 'COMPLETE',
                  created_at: item.created_at || item.transaction_time || item.activity_time || new Date().toISOString(),
                  transfer_type: item.activity_type || item.type || 'Transfer',
                  reason: item.description || `${item.activity_type || 'Transfer'} - ${item.amount || ''}`
                };
              });

            if (processedTransfers.length > 0) {
              transfers = processedTransfers;
              console.log(`Found ${transfers.length} transfers from ${url}`);
              break; // Stop trying endpoints once we find data
            }
          }
        } else {
          console.log(`Endpoint ${url} failed with status ${response.status}`);
        }
      } catch (endpointError) {
        console.log(`Error with endpoint ${url}:`, endpointError);
        continue;
      }
    }

    // If no real transfers found from Alpaca API, check our database
    if (transfers.length === 0) {
      console.log('No transfers found from Alpaca API, checking database for user transfer records...');

      // Get transfers from our user_transfers table
      const { data: userTransfers, error: dbError } = await supabase
        .from('user_transfers')
        .select('*')
        .eq('user_id', user.id)
        .eq('alpaca_account_id', account_id)
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('Database error fetching user transfers:', dbError);
        transfers = [];
      } else {
        console.log('Found user transfers:', userTransfers);
        
        // Format user transfers to match expected format
        transfers = (userTransfers || []).map(transfer => ({
          id: transfer.id,
          amount: transfer.amount.toString(),
          direction: transfer.direction,
          status: transfer.status,
          created_at: transfer.created_at,
          updated_at: transfer.updated_at,
          transfer_type: transfer.transfer_type,
          reason: transfer.reason
        }));
      }
    }

    // Sort transfers by date (newest first)
    transfers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return new Response(JSON.stringify({
      success: true,
      data: transfers,
      source: transfers.length > 0 ? 'database' : 'empty'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Get transfers error:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      data: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});