const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('BUCKPAY_API_KEY');
    const userAgent = Deno.env.get('BUCKPAY_USER_AGENT') || 'Lovable/1.0';

    if (!apiKey) {
      console.error('BUCKPAY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { external_id } = await req.json();
    
    if (!external_id) {
      return new Response(
        JSON.stringify({ error: 'external_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking PIX status for external_id:', external_id);

    // Add timeout to prevent edge function from hanging on slow API responses
    // Reduced to 5 seconds to give margin before edge function timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let response: Response;
    try {
      response = await fetch(`https://api.realtechdev.com.br/v1/transactions/external_id/${external_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': userAgent,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const isTimeout = fetchError instanceof Error && fetchError.name === 'AbortError';
      console.error('Fetch error:', isTimeout ? 'Request timeout' : fetchError);
      // Return 200 with pending status on timeout - lets frontend retry gracefully
      return new Response(
        JSON.stringify({ data: { status: 'pending' }, timeout: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('BuckPay status response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error || 'Failed to check status' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking PIX status:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
