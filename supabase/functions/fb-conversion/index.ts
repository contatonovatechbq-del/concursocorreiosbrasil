const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PIXEL_ID = '1188132760156339';

interface ConversionEvent {
  event_name: string;
  event_time?: number;
  event_source_url?: string;
  action_source?: string;
  user_data?: {
    em?: string; // email (hashed)
    ph?: string; // phone (hashed)
    fn?: string; // first name (hashed)
    ln?: string; // last name (hashed)
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID
    fbp?: string; // Facebook browser ID
    external_id?: string; // CPF or unique ID (hashed)
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    contents?: Array<{ id: string; quantity: number }>;
  };
}

// Hash function for PII (SHA256)
async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('FB_PIXEL_ACCESS_TOKEN');

    if (!accessToken) {
      console.error('FB_PIXEL_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Facebook access token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    console.log('Received FB conversion event:', JSON.stringify(body, null, 2));

    const {
      event_name,
      email,
      phone,
      first_name,
      last_name,
      cpf,
      value,
      currency = 'BRL',
      content_name,
      content_category,
      event_source_url,
      fbc,
      fbp,
    } = body;

    // Build user data with hashed PII
    const userData: ConversionEvent['user_data'] = {
      client_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      client_user_agent: req.headers.get('user-agent') || undefined,
    };

    if (email) userData.em = await hashData(email);
    if (phone) userData.ph = await hashData(phone.replace(/\D/g, ''));
    if (first_name) userData.fn = await hashData(first_name);
    if (last_name) userData.ln = await hashData(last_name);
    if (cpf) userData.external_id = await hashData(cpf.replace(/\D/g, ''));
    if (fbc) userData.fbc = fbc;
    if (fbp) userData.fbp = fbp;

    // Build custom data
    const customData: ConversionEvent['custom_data'] = {};
    if (value) customData.value = value;
    if (currency) customData.currency = currency;
    if (content_name) customData.content_name = content_name;
    if (content_category) customData.content_category = content_category;

    // Build the event
    const eventData: ConversionEvent = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: event_source_url || undefined,
      action_source: 'website',
      user_data: userData,
      custom_data: Object.keys(customData).length > 0 ? customData : undefined,
    };

    console.log('Sending to Facebook:', JSON.stringify(eventData, null, 2));

    // Send to Facebook Conversions API
    const fbResponse = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [eventData],
        }),
      }
    );

    const fbData = await fbResponse.json();
    console.log('Facebook API response:', JSON.stringify(fbData, null, 2));

    if (!fbResponse.ok) {
      console.error('Facebook API error:', fbData);
      return new Response(
        JSON.stringify({ error: 'Failed to send event to Facebook', details: fbData }),
        { status: fbResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, fb_response: fbData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending FB conversion:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
