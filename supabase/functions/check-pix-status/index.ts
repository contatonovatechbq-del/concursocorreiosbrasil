const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiToken = Deno.env.get('FRUITFY_API_TOKEN');
    const storeId = Deno.env.get('FRUITFY_STORE_ID');

    if (!apiToken || !storeId) {
      console.error('FRUITFY credentials not configured');
      return new Response(
        JSON.stringify({ error: 'API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { order_uuid } = await req.json();

    if (!order_uuid) {
      return new Response(
        JSON.stringify({ error: 'order_uuid is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking PIX status for order_uuid:', order_uuid);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let response: Response;
    try {
      response = await fetch(`https://api.fruitfy.io/api/order/${order_uuid}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
          'Store-Id': storeId,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const isTimeout = fetchError instanceof Error && fetchError.name === 'AbortError';
      console.error('Fetch error:', isTimeout ? 'Request timeout' : fetchError);
      return new Response(
        JSON.stringify({ success: true, data: { status: 'waiting_payment' }, timeout: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Fruitfy order response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || 'Failed to check status' }),
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
