import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    console.log(`Starting account deletion for user: ${user.id}`)

    // Create admin client for user deletion
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete user data from all tables in the correct order
    // 1. Delete user stock articles
    console.log('Deleting user stock articles...')
    const { error: articlesError } = await supabaseAdmin
      .from('user_stock_articles')
      .delete()
      .eq('user_id', user.id)

    if (articlesError) {
      console.error('Error deleting user stock articles:', articlesError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 2. Delete user stocks
    console.log('Deleting user stocks...')
    const { error: stocksError } = await supabaseAdmin
      .from('user_stocks')
      .delete()
      .eq('user_id', user.id)

    if (stocksError) {
      console.error('Error deleting user stocks:', stocksError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 3. Delete profile image from storage if exists
    console.log('Deleting profile image...')
    const { error: storageError } = await supabaseAdmin.storage
      .from('profiles')
      .remove([`${user.id}/profile.jpg`, `${user.id}/profile.png`, `${user.id}/profile.jpeg`])

    // Storage errors are not critical for account deletion
    if (storageError) {
      console.log('Storage cleanup error (non-critical):', storageError)
    }

    // 4. Delete user profile
    console.log('Deleting user profile...')
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Error deleting user profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user profile' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 5. Finally, delete the user from auth.users
    console.log('Deleting user from auth...')
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error('Error deleting user from auth:', deleteUserError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`Successfully deleted account for user: ${user.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deleted successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error during account deletion:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})