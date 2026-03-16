import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const USER_AGENT =
  Deno.env.get("BUCKPAY_USER_AGENT") ||
  "Concorreios/1.0 (nearest-agency-lookup)";
const MIN_REQUEST_INTERVAL_MS = 1100;
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

let lastExternalCallAt = 0;
const geocodeCache = new Map<string, { lat: number; lon: number }>();
const overpassCache = new Map<string, any[]>();

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitRateLimit() {
  const elapsed = Date.now() - lastExternalCallAt;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
  }
  lastExternalCallAt = Date.now();
}

async function safeFetchJson(
  url: string,
  label: string,
  init: RequestInit = {},
  attempts = 2,
): Promise<any | null> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let timeoutId: number | undefined;

    try {
      await waitRateLimit();

      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 12000);

      const mergedHeaders = {
        "User-Agent": USER_AGENT,
        Accept: "application/json,text/plain,*/*",
        ...(init.headers || {}),
      };

      const res = await fetch(url, {
        ...init,
        headers: mergedHeaders,
        signal: controller.signal,
      });

      const text = await res.text();

      if (res.status === 429 || res.status >= 500) {
        console.error(`${label} returned status ${res.status}: ${text.substring(0, 150)}`);
        if (attempt < attempts) {
          await sleep(600 * attempt);
          continue;
        }
        return null;
      }

      if (!res.ok) {
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
      console.error(`${label} fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      if (attempt < attempts) {
        await sleep(600 * attempt);
        continue;
      }
      return null;
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }
  }

  return null;
}

async function geocodeNominatim(query: string, label: string): Promise<{ lat: number; lon: number } | null> {
  const cacheKey = `nominatim:${query}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
    countrycodes: "br",
    addressdetails: "0",
  });

  const data = await safeFetchJson(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    label,
  );

  if (Array.isArray(data) && data.length > 0) {
    const lat = Number.parseFloat(data[0]?.lat);
    const lon = Number.parseFloat(data[0]?.lon);

    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      const result = { lat, lon };
      geocodeCache.set(cacheKey, result);
      return result;
    }
  }

  return null;
}

async function geocodePhoton(query: string, label: string): Promise<{ lat: number; lon: number } | null> {
  const cacheKey = `photon:${query}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: query,
    limit: "1",
    lang: "pt",
  });

  const data = await safeFetchJson(`https://photon.komoot.io/api/?${params.toString()}`, label);

  const coords = data?.features?.[0]?.geometry?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    const lon = Number(coords[0]);
    const lat = Number(coords[1]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      const result = { lat, lon };
      geocodeCache.set(cacheKey, result);
      return result;
    }
  }

  return null;
}

async function queryOverpass(query: string, label: string): Promise<any[]> {
  const cacheKey = `overpass:${query}`;
  const cached = overpassCache.get(cacheKey);
  if (cached) return cached;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const data = await safeFetchJson(
      endpoint,
      `${label}-${new URL(endpoint).host}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: `data=${encodeURIComponent(query)}`,
      },
      2,
    );

    if (data && Array.isArray(data.elements)) {
      overpassCache.set(cacheKey, data.elements);
      return data.elements;
    }
  }

  return [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cep, localidade, uf } = await req.json();

    if (!cep) {
      return new Response(JSON.stringify({ found: false, reason: "missing_cep" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanCep = String(cep).replace(/\D/g, "");

    let coords: { lat: number; lon: number } | null = null;

    if (localidade && uf) {
      coords = await geocodeNominatim(`${localidade}, ${uf}, Brasil`, "Nominatim-city");
      if (!coords) {
        coords = await geocodePhoton(`${localidade}, ${uf}, Brasil`, "Photon-city");
      }
    }

    if (!coords) {
      coords = await geocodeNominatim(`${cleanCep}, Brasil`, "Nominatim-cep");
      if (!coords) {
        const composed = [cleanCep, localidade, uf, "Brasil"].filter(Boolean).join(", ");
        coords = await geocodePhoton(composed, "Photon-cep");
      }
    }

    if (!coords && localidade) {
      const areaQuery = `[out:json][timeout:15];area["name"="${localidade}"]["admin_level"]->.a;node["amenity"="post_office"](area.a);out body 1;`;
      const elements = await queryOverpass(areaQuery, "Overpass-area");

      if (elements.length > 0) {
        const el = elements[0];
        const tags = el.tags || {};

        return new Response(
          JSON.stringify({
            found: true,
            agency: {
              name: tags.name || tags["official_name"] || "Agência dos Correios",
              endereco: buildEndereco(tags, localidade, uf),
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(JSON.stringify({ found: false, reason: "no_agencies_nearby" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!coords) {
      return new Response(JSON.stringify({ found: false, reason: "geocoding_failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let agencies: any[] = [];

    for (const radius of [5000, 15000, 30000]) {
      const overpassQuery = `[out:json][timeout:15];(node["amenity"="post_office"](around:${radius},${coords.lat},${coords.lon});way["amenity"="post_office"](around:${radius},${coords.lat},${coords.lon}););out body center;`;
      const elements = await queryOverpass(overpassQuery, `Overpass-${radius}`);
      if (elements.length > 0) {
        agencies = elements;
        break;
      }
    }

    if (agencies.length === 0 && localidade) {
      const areaQuery = `[out:json][timeout:15];area["name"="${localidade}"]["admin_level"]->.a;node["amenity"="post_office"](area.a);out body 25;`;
      agencies = await queryOverpass(areaQuery, "Overpass-area-fallback");
    }

    if (agencies.length === 0) {
      return new Response(JSON.stringify({ found: false, reason: "no_agencies_nearby" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let closest = agencies[0];
    let minDist = Infinity;

    for (const ag of agencies) {
      const agLat = Number(ag.lat ?? ag.center?.lat);
      const agLon = Number(ag.lon ?? ag.center?.lon);
      if (Number.isFinite(agLat) && Number.isFinite(agLon)) {
        const dist = haversineDistance(coords.lat, coords.lon, agLat, agLon);
        if (dist < minDist) {
          minDist = dist;
          closest = ag;
        }
      }
    }

    const tags = closest?.tags || {};
    const agency: Record<string, string | number> = {
      name: tags.name || tags["official_name"] || "Agência dos Correios",
      endereco: buildEndereco(tags, localidade, uf),
    };

    if (Number.isFinite(minDist)) {
      agency.distanceKm = Math.round(minDist * 10) / 10;
    }

    return new Response(JSON.stringify({ found: true, agency }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error finding agency:", error);
    return new Response(
      JSON.stringify({
        found: false,
        reason: "error",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

function buildEndereco(tags: Record<string, string>, fallbackCity?: string, fallbackState?: string): string {
  const street = tags["addr:street"] || "";
  const number = tags["addr:housenumber"] || "";
  const city = tags["addr:city"] || fallbackCity || "";
  const state = tags["addr:state"] || fallbackState || "";

  if (!street) return city && state ? `${city}/${state}` : city || "";

  let addr = street;
  if (number) addr += `, ${number}`;
  if (city) addr += ` — ${city}`;
  if (state) addr += `/${state}`;
  return addr;
}
