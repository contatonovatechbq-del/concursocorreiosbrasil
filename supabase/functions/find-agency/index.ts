import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function safeFetch(url: string, label: string): Promise<any | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CorreiosConsulta/1.0' },
    });
    const text = await res.text();
    if (res.status !== 200) {
      console.error(`${label} returned status ${res.status}: ${text.substring(0, 150)}`);
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      console.error(`${label} returned non-JSON: ${text.substring(0, 150)}`);
      return null;
    }
  } catch (e) {
    console.error(`${label} fetch failed: ${e.message}`);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cep, localidade, uf } = await req.json();
    if (!cep) {
      return new Response(JSON.stringify({ found: false, reason: 'missing_cep' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanCep = cep.replace(/\D/g, '');
    let lat: number | null = null;
    let lon: number | null = null;

    // Strategy 1: Geocode using ViaCEP city+state (avoids Nominatim rate limits)
    if (localidade && uf) {
      const query = encodeURIComponent(`${localidade}, ${uf}, Brasil`);
      const geoData = await safeFetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        'Nominatim-city'
      );
      if (geoData && Array.isArray(geoData) && geoData.length > 0) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
      }
    }

    // Strategy 2: Fallback to CEP geocoding
    if (lat === null) {
      const geoData = await safeFetch(
        `https://nominatim.openstreetmap.org/search?q=${cleanCep}+Brasil&format=json&limit=1`,
        'Nominatim-cep'
      );
      if (geoData && Array.isArray(geoData) && geoData.length > 0) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
      }
    }

    // Strategy 3: Use Overpass area search by city name (no coordinates needed)
    if (lat === null && localidade) {
      const overpassQuery = `[out:json][timeout:10];area["name"="${localidade}"]["admin_level"]->.a;node["amenity"="post_office"](area.a);out body 1;`;
      const overpassData = await safeFetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`,
        'Overpass-area'
      );
      if (overpassData?.elements?.length > 0) {
        const el = overpassData.elements[0];
        const tags = el.tags || {};
        return new Response(JSON.stringify({
          found: true,
          agency: {
            name: tags.name || tags['official_name'] || 'Agência dos Correios',
            endereco: buildEndereco(tags, localidade, uf),
          },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ found: false, reason: 'no_agencies_nearby' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (lat === null || lon === null) {
      return new Response(JSON.stringify({ found: false, reason: 'geocoding_failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Search for post offices near coordinates
    let agencies: any[] = [];
    for (const radius of [10000, 30000]) {
      const overpassQuery = `[out:json][timeout:10];(node["amenity"="post_office"](around:${radius},${lat},${lon});way["amenity"="post_office"](around:${radius},${lat},${lon}););out body center;`;
      const overpassData = await safeFetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`,
        'Overpass'
      );
      if (overpassData?.elements?.length > 0) {
        agencies = overpassData.elements;
        break;
      }
    }

    if (agencies.length === 0) {
      return new Response(JSON.stringify({ found: false, reason: 'no_agencies_nearby' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find closest
    let closest = agencies[0];
    let minDist = Infinity;
    for (const ag of agencies) {
      const agLat = ag.lat ?? ag.center?.lat;
      const agLon = ag.lon ?? ag.center?.lon;
      if (agLat && agLon) {
        const dist = haversineDistance(lat, lon, agLat, agLon);
        if (dist < minDist) { minDist = dist; closest = ag; }
      }
    }

    const tags = closest.tags || {};
    return new Response(JSON.stringify({
      found: true,
      agency: {
        name: tags.name || tags['official_name'] || 'Agência dos Correios',
        endereco: buildEndereco(tags, localidade, uf),
        distanceKm: Math.round(minDist * 10) / 10,
      },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error finding agency:', error);
    return new Response(JSON.stringify({ found: false, reason: 'error', message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildEndereco(tags: Record<string, string>, fallbackCity?: string, fallbackState?: string): string {
  const street = tags['addr:street'] || '';
  const number = tags['addr:housenumber'] || '';
  const city = tags['addr:city'] || fallbackCity || '';
  const state = tags['addr:state'] || fallbackState || '';
  if (!street) return city && state ? `${city}/${state}` : '';
  let addr = street;
  if (number) addr += `, ${number}`;
  if (city) addr += ` — ${city}`;
  if (state) addr += `/${state}`;
  return addr;
}
