const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('VELANI_API_KEY');
    if (!apiKey) return json({ error: 'VELANI_API_KEY not configured' }, 500);

    const { order_uuid } = await req.json();
    if (!order_uuid || typeof order_uuid !== 'string' || !/^[\w-]{6,80}$/.test(order_uuid)) {
      return json({ error: 'order_uuid is required' }, 400);
    }

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 6000);
    let res: Response;
    try {
      res = await fetch(`https://api.velanipagamentos.com.br/api/v1/api-gateway/v1/transactions/${order_uuid}`, {
        headers: { 'x-api-key': apiKey, Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch {
      return json({ success: true, data: { status: 'waiting_payment' }, timeout: true });
    } finally { clearTimeout(t); }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return json({ error: data?.error?.message || 'Failed to check status' }, res.status);

    const status = data?.data?.status === 'paid' ? 'paid' : (data?.data?.status || 'pending');
    return json({ success: true, data: { status, id: data?.data?.id } });
  } catch (error: unknown) {
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
