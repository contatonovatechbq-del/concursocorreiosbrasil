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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cep } = await req.json();
    if (!cep) {
      return new Response(JSON.stringify({ error: 'CEP é obrigatório' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const cleanCep = cep.replace(/\D/g, '');

    // Step 1: Geocode CEP using Nominatim
    const geoUrl = `https://nominatim.openstreetmap.org/search?q=${cleanCep}+Brasil&format=json&limit=1`;
    const geoRes = await fetch(geoUrl, {
      headers: { 'User-Agent': 'CorreiosConsulta/1.0' },
    });
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return new Response(JSON.stringify({ found: false, reason: 'geocoding_failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);

    // Step 2: Search for post offices using Overpass API
    let agencies: any[] = [];

    for (const radius of [10000, 30000]) {
      const overpassQuery = `[out:json][timeout:10];(node["amenity"="post_office"](around:${radius},${lat},${lon});way["amenity"="post_office"](around:${radius},${lat},${lon}););out body center;`;
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

      const overpassRes = await fetch(overpassUrl, {
        headers: { 'User-Agent': 'CorreiosConsulta/1.0' },
      });
      const overpassData = await overpassRes.json();

      if (overpassData.elements && overpassData.elements.length > 0) {
        agencies = overpassData.elements;
        break;
      }
    }

    if (agencies.length === 0) {
      return new Response(JSON.stringify({ found: false, reason: 'no_agencies_nearby' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find the closest agency
    let closest = agencies[0];
    let minDist = Infinity;

    for (const ag of agencies) {
      const agLat = ag.lat ?? ag.center?.lat;
      const agLon = ag.lon ?? ag.center?.lon;
      if (agLat && agLon) {
        const dist = haversineDistance(lat, lon, agLat, agLon);
        if (dist < minDist) {
          minDist = dist;
          closest = ag;
        }
      }
    }

    const tags = closest.tags || {};
    const name = tags.name || tags['official_name'] || 'Agência dos Correios';
    const street = tags['addr:street'] || '';
    const number = tags['addr:housenumber'] || '';
    const city = tags['addr:city'] || '';
    const state = tags['addr:state'] || '';
    const postcode = tags['addr:postcode'] || '';

    let endereco = '';
    if (street) {
      endereco = street;
      if (number) endereco += `, ${number}`;
      if (city) endereco += ` — ${city}`;
      if (state) endereco += `/${state}`;
    }

    return new Response(JSON.stringify({
      found: true,
      agency: {
        name,
        endereco,
        distanceKm: Math.round(minDist * 10) / 10,
        lat: closest.lat ?? closest.center?.lat,
        lon: closest.lon ?? closest.center?.lon,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error finding agency:', error);
    return new Response(JSON.stringify({ found: false, reason: 'error', message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
