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
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Starting admin account deletion for email: ${email}`)

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find the user by email
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (getUserError) {
      console.error('Error fetching users:', getUserError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.log(`User with email ${email} not found`)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    console.log(`Found user: ${user.id} with email: ${email}`)

    // Delete user data from all tables in the correct order
    // 1. Delete user stock articles
    console.log('Deleting user stock articles...')
    const { error: articlesError } = await supabaseAdmin
      .from('user_stock_articles')
      .delete()
      .eq('user_id', user.id)

    if (articlesError) {
      console.error('Error deleting user stock articles:', articlesError)
    }

    // 2. Delete user stocks
    console.log('Deleting user stocks...')
    const { error: stocksError } = await supabaseAdmin
      .from('user_stocks')
      .delete()
      .eq('user_id', user.id)

    if (stocksError) {
      console.error('Error deleting user stocks:', stocksError)
    }

    // 3. Delete profile image from storage if exists
    console.log('Deleting profile image...')
    const { error: storageError } = await supabaseAdmin.storage
      .from('profiles')
      .remove([`${user.id}/profile.jpg`, `${user.id}/profile.png`, `${user.id}/profile.jpeg`])

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
    }

    // 5. Finally, delete the user from auth.users
    console.log('Deleting user from auth...')
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error('Error deleting user from auth:', deleteUserError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account from auth' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`Successfully deleted account for user: ${user.id} (${email})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Account for ${email} deleted successfully`,
        userId: user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error during admin account deletion:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})