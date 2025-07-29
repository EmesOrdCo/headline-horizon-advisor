import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlpacaAccount {
  id: string;
  equity: string;
  cash: string;
  long_market_value: string;
  buying_power: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting automated portfolio snapshot collection...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY');
    const alpacaSecretKey = Deno.env.get('ALPACA_SECRET_KEY');

    if (!alpacaApiKey || !alpacaSecretKey) {
      throw new Error('Missing Alpaca API credentials');
    }

    // Get all users with Alpaca accounts
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, alpaca_account_id')
      .not('alpaca_account_id', 'is', null);

    if (profilesError) {
      console.error('Failed to fetch user profiles:', profilesError);
      throw profilesError;
    }

    console.log(`📊 Found ${profiles?.length || 0} users with Alpaca accounts`);

    let successCount = 0;
    let errorCount = 0;

    // Process each user's account
    for (const profile of profiles || []) {
      try {
        console.log(`Processing user ${profile.id} with account ${profile.alpaca_account_id}`);
        
        // Get account details from Alpaca
        const alpacaResponse = await fetch(
          `https://broker-api.sandbox.alpaca.markets/v1/accounts/${profile.alpaca_account_id}`,
          {
            headers: {
              'Authorization': `Basic ${btoa(`${alpacaApiKey}:${alpacaSecretKey}`)}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!alpacaResponse.ok) {
          console.error(`Failed to fetch account data for user ${profile.id}: ${alpacaResponse.status}`);
          errorCount++;
          continue;
        }

        const accountData: AlpacaAccount = await alpacaResponse.json();
        
        // Store portfolio snapshot
        const snapshotData = {
          user_id: profile.id,
          account_id: profile.alpaca_account_id,
          snapshot_date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
          total_equity: parseFloat(accountData.equity || '0'),
          cash: parseFloat(accountData.cash || '0'),
          long_market_value: parseFloat(accountData.long_market_value || '0'),
          buying_power: parseFloat(accountData.buying_power || '0')
        };

        const { error: insertError } = await supabase
          .from('portfolio_snapshots')
          .upsert(snapshotData, { 
            onConflict: 'user_id,account_id,snapshot_date',
            ignoreDuplicates: false 
          });

        if (insertError) {
          console.error(`Failed to store snapshot for user ${profile.id}:`, insertError);
          errorCount++;
        } else {
          console.log(`✅ Stored snapshot for user ${profile.id}: $${accountData.equity}`);
          successCount++;
        }

      } catch (userError) {
        console.error(`Error processing user ${profile.id}:`, userError);
        errorCount++;
      }
    }

    console.log(`📈 Snapshot collection complete: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: profiles?.length || 0,
        successful: successCount,
        errors: errorCount,
        message: 'Portfolio snapshots updated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Portfolio snapshot function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});