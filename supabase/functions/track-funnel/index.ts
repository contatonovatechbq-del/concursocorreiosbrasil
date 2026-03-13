const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const {
      session_id,
      step,
      cpf_hash,
      step_data,
      user_agent,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
    } = body;

    if (!session_id || !step) {
      return new Response(
        JSON.stringify({ error: 'session_id and step are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use direct SQL via the database URL to bypass PostgREST schema cache issues
    const dbUrl = Deno.env.get('SUPABASE_DB_URL');
    
    if (!dbUrl) {
      console.error('[track-funnel] SUPABASE_DB_URL not set');
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the Supabase REST API directly with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const insertData = {
      session_id,
      step,
      cpf_hash: cpf_hash || null,
      step_data: step_data || {},
      user_agent: user_agent || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_term: utm_term || null,
      utm_content: utm_content || null,
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/funnel_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(insertData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[track-funnel] Insert error:', response.status, errorText);
      
      // If table not found in cache, try to reload and retry
      if (response.status === 406 || errorText.includes('PGRST205')) {
        // Reload PostgREST schema cache
        await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
        });
        
        // Retry insert
        const retryResponse = await fetch(`${supabaseUrl}/rest/v1/funnel_events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(insertData),
        });
        
        if (!retryResponse.ok) {
          const retryError = await retryResponse.text();
          console.error('[track-funnel] Retry failed:', retryError);
          return new Response(
            JSON.stringify({ error: 'Failed to track event after retry' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Failed to track event' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('[track-funnel] Event tracked:', { session_id, step });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[track-funnel] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
