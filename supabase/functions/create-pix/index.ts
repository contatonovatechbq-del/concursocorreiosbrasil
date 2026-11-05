import QRCode from 'npm:qrcode@1.5.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const VELANI_BASE = 'https://api.velanipagamentos.com.br/api/v1/api-gateway/v1';

interface CreatePixRequest {
  amount: number;
  product_name?: string;
  buyer: { name: string; email: string; document?: string; phone?: string };
  tracking?: Record<string, string | null | undefined>;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const generateFallbackCpf = (): string => {
  const d = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9) + 1);
  let s = 0;
  for (let i = 0; i < 9; i++) s += d[i] * (10 - i);
  let r = s % 11; d.push(r < 2 ? 0 : 11 - r);
  s = 0;
  for (let i = 0; i < 10; i++) s += d[i] * (11 - i);
  r = s % 11; d.push(r < 2 ? 0 : 11 - r);
  return d.join('');
};

const generateRandomPhone = (): string => {
  const ddds = [11, 21, 31, 41, 51, 61, 71, 81, 85, 62, 67, 27, 48, 47, 19];
  const ddd = ddds[Math.floor(Math.random() * ddds.length)];
  return `${ddd}9${Math.floor(10000000 + Math.random() * 89999999)}`;
};

async function toDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return '';
    const buf = new Uint8Array(await res.arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    return `data:${res.headers.get('content-type') || 'image/png'};base64,${btoa(bin)}`;
  } catch { return ''; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('VELANI_API_KEY');
    if (!apiKey) return json({ error: 'VELANI_API_KEY not configured' }, 500);

    const body: CreatePixRequest = await req.json();
    const amount = Math.round(Number(body.amount));
    if (!Number.isFinite(amount) || amount < 500) return json({ error: 'Valor inválido (mínimo R$ 5,00)' }, 400);

    const productName = String(body.product_name || 'FRONT').slice(0, 60);

    const rawDoc = (body.buyer?.document ?? '').replace(/\D/g, '');
    const cpf = /^\d{11}$/.test(rawDoc) ? rawDoc : generateFallbackCpf();
    const rawName = (body.buyer?.name ?? '').replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '').replace(/\s+/g, ' ').trim();
    const name = rawName.length >= 3 ? rawName : 'Usuario Pagador';
    const emailBase = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '.') || 'usuario';
    const email = body.buyer?.email?.includes('@') ? body.buyer.email : `${emailBase}@gmail.com`;
    const rawPhone = (body.buyer?.phone ?? '').replace(/\D/g, '');
    const phone = rawPhone.length >= 10 && rawPhone.length <= 11 ? rawPhone : generateRandomPhone();

    const tracking: Record<string, string> = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck']) {
      const v = body.tracking?.[k];
      if (v) tracking[k] = String(v);
    }

    const externalId = `${productName.replace(/\s+/g, '-')}-${crypto.randomUUID()}`;
    const payload = {
      paymentMethod: 'pix',
      amount,
      customer: { name, email, phone, document: { type: 'cpf', number: cpf } },
      items: [{ title: productName, unitPrice: amount, quantity: 1 }],
      description: productName,
      externalId,
      ...(Object.keys(tracking).length ? { tracking } : {}),
    };
    console.log('[create-pix] Velani payload:', JSON.stringify({ ...payload, customer: { name } }));

    const res = await fetch(`${VELANI_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'x-idempotency-key': externalId },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    console.log('[create-pix] Velani status:', res.status, JSON.stringify(data).slice(0, 500));

    if (!res.ok || !data?.success) {
      return json({ error: data?.error?.message || 'Falha ao gerar PIX', details: data }, res.status >= 400 ? res.status : 502);
    }

    const tx = data.data;
    let qr = tx.pixQrCodeImage ? await toDataUrl(tx.pixQrCodeImage) : '';
    if (!qr && tx.pixQrCode) {
      try { qr = await QRCode.toDataURL(tx.pixQrCode, { width: 320, margin: 1 }); } catch { /* ignore */ }
    }
    // Normalized shape consumed by the frontend
    return json({
      success: true,
      data: {
        order_id: tx.id,
        status: tx.status,
        pix: { code: tx.pixQrCode, qr_code_base64: qr, qr_code_url: tx.pixQrCodeImage },
        product_name: productName,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating PIX:', msg);
    return json({ error: msg }, 500);
  }
});
