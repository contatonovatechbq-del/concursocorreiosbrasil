import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FUNNEL_STEPS = [
  'landing',
  'resultado-cep',
  'inscricao-cpf',
  'confirma-dados',
  'pagamento',
  'pix-generated',
  'payment-confirmed',
  'upsell-1',
  'upsell-2',
  'upsell-3',
  'upsell-4',
  'upsell-5',
  'upsell-6',
  'upsell-7',
  'upsell-8',
  'upsell-9',
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token, period = '24h', utmFilter = null } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Token is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    const { data: session, error: sessionError } = await supabase.from('admin_sessions').select('*').eq('token', token).gt('expires_at', new Date().toISOString()).maybeSingle();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid or expired session' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    let query = supabase.from('funnel_events').select('*').gte('created_at', startDate.toISOString()).order('created_at', { ascending: false });

    if (utmFilter) {
      if (utmFilter === 'direct' || utmFilter === 'direto') { query = query.is('utm_source', null); }
      else { query = query.ilike('utm_source', `%${utmFilter}%`); }
    }

    const { data: events, error: eventsError } = await query;

    if (eventsError) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch events' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const uniqueSessions = new Set(events?.map(e => e.session_id) || []);
    const stepCounts: Record<string, number> = {};
    for (const event of events || []) { stepCounts[event.step] = (stepCounts[event.step] || 0) + 1; }

    const funnelSteps = FUNNEL_STEPS.map(step => ({ step, count: stepCounts[step] || 0 }));

    const allEventsQuery = await supabase.from('funnel_events').select('utm_source').gte('created_at', startDate.toISOString());
    const allEvents = allEventsQuery.data || [];
    const utmSourceCounts: Record<string, number> = {};
    for (const event of allEvents) { const source = event.utm_source || 'direct'; utmSourceCounts[source] = (utmSourceCounts[source] || 0) + 1; }

    const utmSources = Object.entries(utmSourceCounts).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count).slice(0, 10);
    const availableSources = Object.keys(utmSourceCounts).filter(s => s !== 'direct');
    if (utmSourceCounts['direct']) availableSources.push('direct');

    const recentEvents = (events || []).slice(0, 50).map(e => ({ step: e.step, created_at: e.created_at, utm_source: e.utm_source, session_id: e.session_id }));
    const totalEvents = allEvents.length;

    return new Response(JSON.stringify({ success: true, data: { totalSessions: uniqueSessions.size, totalEvents, funnelSteps, recentEvents, utmSources, availableSources } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[admin-analytics] Error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
