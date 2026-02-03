import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePixRequest {
  amount: number;
  buyer: {
    name: string;
    email: string;
    document?: string;
    phone?: string;
  };
  external_id: string;
  product?: {
    id: string | null;
    name: string | null;
  };
  tracking?: {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
    utm_id?: string | null;
    src?: string | null;
    sck?: string | null;
    ref?: string | null;
  };
}

serve(async (req) => {
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

    const body: CreatePixRequest = await req.json();
    console.log('=== CREATE PIX REQUEST ===');
    console.log('Received body:', JSON.stringify(body, null, 2));
    console.log('Tracking received:', JSON.stringify(body.tracking, null, 2));

    // Build tracking payload - log what we're sending
    const trackingPayload = {
      utm_source: body.tracking?.utm_source || '',
      utm_medium: body.tracking?.utm_medium || '',
      utm_campaign: body.tracking?.utm_campaign || '',
      utm_content: body.tracking?.utm_content || '',
      utm_term: body.tracking?.utm_term || '',
      utm_id: body.tracking?.utm_id || '',
      src: body.tracking?.src || '',
      sck: body.tracking?.sck || '',
      ref: body.tracking?.ref || '',
    };
    
    console.log('=== TRACKING PAYLOAD TO BUCKPAY ===');
    console.log('Tracking being sent:', JSON.stringify(trackingPayload, null, 2));

    const requestBody = {
      external_id: body.external_id,
      payment_method: 'pix',
      amount: body.amount,
      buyer: {
        name: body.buyer.name,
        email: body.buyer.email,
        document: body.buyer.document,
        phone: body.buyer.phone,
      },
      product: body.product,
      tracking: trackingPayload,
    };

    console.log('=== FULL REQUEST TO BUCKPAY ===');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.realtechdev.com.br/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': userAgent,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('BuckPay response status:', response.status);
    console.log('BuckPay response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error || 'Failed to create PIX' }),
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
