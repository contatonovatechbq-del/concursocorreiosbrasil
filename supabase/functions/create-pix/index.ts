const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CreatePixRequest {
  amount: number;
  buyer: {
    name: string;
    email: string;
    document?: string;
    phone?: string;
  };
  product_id?: string;
  tracking?: {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiToken = Deno.env.get('FRUITFY_API_TOKEN');
    const storeId = Deno.env.get('FRUITFY_STORE_ID');
    const defaultProductId = Deno.env.get('FRUITFY_PRODUCT_ID');

    if (!apiToken || !storeId) {
      console.error('FRUITFY_API_TOKEN or FRUITFY_STORE_ID not configured');
      return new Response(
        JSON.stringify({ error: 'API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: CreatePixRequest = await req.json();
    console.log('=== CREATE PIX (Fruitfy) ===');
    console.log('Received body:', JSON.stringify(body, null, 2));

    // --- Buyer sanitization ---
    const generateFallbackCpf = (): string => {
      const rnd = () => Math.floor(Math.random() * 9) + 1;
      const d = Array.from({ length: 9 }, rnd);
      let s = 0;
      for (let i = 0; i < 9; i++) s += d[i] * (10 - i);
      let r = s % 11;
      d.push(r < 2 ? 0 : 11 - r);
      s = 0;
      for (let i = 0; i < 10; i++) s += d[i] * (11 - i);
      r = s % 11;
      d.push(r < 2 ? 0 : 11 - r);
      return d.join('');
    };

    const rawDoc = (body.buyer?.document ?? '').replace(/\D/g, '');
    const buyerCpf = /^\d{11}$/.test(rawDoc) ? rawDoc : generateFallbackCpf();

    const rawName = (body.buyer?.name ?? '')
      .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const buyerName = rawName.length >= 3 ? rawName : 'Usuario Pagador';

    const emailBase = buyerName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .trim()
      .replace(/\s+/g, '.') || 'usuario';
    const buyerEmail = body.buyer?.email && body.buyer.email.includes('@')
      ? body.buyer.email
      : `${emailBase}@api.com`;

    const generateRandomPhone = (): string => {
      const ddd = [11,21,31,41,51,61,71,81,85,62,67,27,48,47,19,15,14,16,17,18,13,12,24,22,32,34,35,37,38,33,43,44,45,46,42][Math.floor(Math.random() * 35)];
      const num = Math.floor(90000000 + Math.random() * 10000000);
      return `55${ddd}9${num}`;
    };
    const rawPhone = (body.buyer?.phone ?? '').replace(/\D/g, '');
    const buyerPhone = (rawPhone.length >= 10 && rawPhone.length <= 13) ? rawPhone : generateRandomPhone();

    const productId = body.product_id || defaultProductId || '';

    console.log('Sanitized buyer:', JSON.stringify({ name: buyerName, email: buyerEmail, cpf: buyerCpf, phone: buyerPhone }));

    // Build UTM object
    const utm: Record<string, string> = {};
    if (body.tracking?.utm_source) utm.utm_source = body.tracking.utm_source;
    if (body.tracking?.utm_medium) utm.utm_medium = body.tracking.utm_medium;
    if (body.tracking?.utm_campaign) utm.utm_campaign = body.tracking.utm_campaign;
    if (body.tracking?.utm_content) utm.utm_content = body.tracking.utm_content;
    if (body.tracking?.utm_term) utm.utm_term = body.tracking.utm_term;

    console.log('UTM to Fruitfy:', JSON.stringify(utm));

    // Build Fruitfy request body
    const requestBody = {
      name: buyerName,
      email: buyerEmail,
      phone: buyerPhone,
      cpf: buyerCpf,
      items: [
        {
          id: productId,
          value: body.amount, // already in cents
          quantity: 1,
        },
      ],
      ...(Object.keys(utm).length > 0 ? { utm } : {}),
    };

    console.log('=== FULL REQUEST TO FRUITFY ===');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.fruitfy.io/api/pix/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
        'Store-Id': storeId,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('Fruitfy response status:', response.status);
    console.log('Fruitfy response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || 'Failed to create PIX', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating PIX:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
