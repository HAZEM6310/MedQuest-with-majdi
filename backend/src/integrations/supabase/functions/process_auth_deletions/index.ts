// Import statements at the top
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define the handler function
async function processAuthDeletions(req: Request) {
  // Create a Supabase client with the Admin key
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  )
  
  // Get unprocessed deletion requests
  const { data: requests, error } = await supabaseAdmin
    .from('auth_delete_requests')
    .select('*')
    .eq('processed', false)
    .limit(10)
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  const results = []
  
  // Process each request
  for (const request of requests || []) {
    try {
      // Delete the auth user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
        request.user_id
      )
      
      if (deleteError) {
        results.push({
          user_id: request.user_id,
          success: false,
          error: deleteError.message
        })
      } else {
        // Mark as processed
        await supabaseAdmin
          .from('auth_delete_requests')
          .update({ 
            processed: true,
            processed_at: new Date().toISOString()
          })
          .eq('id', request.id)
        
        results.push({
          user_id: request.user_id,
          success: true
        })
      }
    } catch (err) {
      results.push({
        user_id: request.user_id,
        success: false,
        error: err.message
      })
    }
  }
  
  return new Response(
    JSON.stringify({ processed: results.length, results }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

// Set up the scheduled job
Deno.cron("Process Auth Deletions", "0 * * * *", async () => {
  try {
    const response = await fetch(Deno.env.get('SUPABASE_FUNCTION_URL') + '/process-auth-deletions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
    });
    console.log("Scheduled deletion process completed:", await response.text());
  } catch (error) {
    console.error("Error in scheduled deletion process:", error);
  }
});

// Serve the function
serve(processAuthDeletions);