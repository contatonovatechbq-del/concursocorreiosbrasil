const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const USER_AGENT =
  Deno.env.get("BUCKPAY_USER_AGENT") ||
  "Concorreios/1.0 (city-school-lookup; concorreios.lovable.app)";
const MIN_REQUEST_INTERVAL_MS = 1200;
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const RADIUS_METERS = 30000; // 30km

let lastExternalCallAt = 0;
const overpassCache = new Map<string, any[]>();
const geocodeCache = new Map<string, { lat: number; lon: number } | null>();

const SCHOOL_PREFIXES = [
  "Escola Municipal", "Escola Estadual", "Centro Educacional",
  "Colégio Estadual", "Escola de Ensino Fundamental",
];
const SCHOOL_SUFFIXES = [
  "São José", "Nossa Senhora Aparecida", "Dom Pedro II",
  "Presidente Vargas", "Tiradentes", "Castro Alves",
  "Santos Dumont", "Rui Barbosa", "Machado de Assis", "Monteiro Lobato",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFallbackSchoolName(): string {
  return `${randomFrom(SCHOOL_PREFIXES)} ${randomFrom(SCHOOL_SUFFIXES)}`;
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

function computeBackoffMs(attempt: number): number {
  return Math.min(800 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 500), 10000);
}

function parseRetryAfterMs(retryAfter: string | null): number | null {
  if (!retryAfter) return null;
  const seconds = Number.parseInt(retryAfter, 10);
  if (Number.isFinite(seconds)) return Math.max(250, seconds * 1000);
  const dateMs = Date.parse(retryAfter);
  if (Number.isFinite(dateMs)) return Math.max(250, dateMs - Date.now());
  return null;
}

async function safeFetchJson(
  url: string,
  _label: string,
  init: RequestInit = {},
  attempts = 3,
): Promise<any | null> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let timeoutId: number | undefined;
    try {
      await waitRateLimit();
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 13000);

      const res = await fetch(url, {
        ...init,
        headers: { "User-Agent": USER_AGENT, Accept: "application/json,text/plain,*/*", ...(init.headers || {}) },
        signal: controller.signal,
      });
      const text = await res.text();

      if (res.status === 429) {
        if (attempt < attempts) { await sleep(parseRetryAfterMs(res.headers.get("Retry-After")) ?? computeBackoffMs(attempt)); continue; }
        return null;
      }
      if (res.status >= 500) {
        if (attempt < attempts) { await sleep(computeBackoffMs(attempt)); continue; }
        return null;
      }
      if (!res.ok) return null;
      try { return JSON.parse(text); } catch { return null; }
    } catch {
      if (attempt < attempts) { await sleep(computeBackoffMs(attempt)); continue; }
      return null;
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }
  }
  return null;
}

// Haversine distance in km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Geocode a CEP or city to lat/lon via Nominatim
async function geocode(query: string): Promise<{ lat: number; lon: number } | null> {
  if (geocodeCache.has(query)) return geocodeCache.get(query) ?? null;

  const params = new URLSearchParams({
    q: `${query}, Brasil`,
    format: "jsonv2",
    limit: "1",
    countrycodes: "br",
  });

  const data = await safeFetchJson(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    "Nominatim-geocode",
  );

  if (!Array.isArray(data) || data.length === 0) {
    geocodeCache.set(query, null);
    return null;
  }

  const result = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  if (!Number.isFinite(result.lat) || !Number.isFinite(result.lon)) {
    geocodeCache.set(query, null);
    return null;
  }

  geocodeCache.set(query, result);
  return result;
}

// Query Overpass for schools within radius around a point
async function queryOverpassAround(lat: number, lon: number, radiusM: number): Promise<any[]> {
  const query = `[out:json][timeout:25];(node["amenity"="school"](around:${radiusM},${lat},${lon});way["amenity"="school"](around:${radiusM},${lat},${lon});relation["amenity"="school"](around:${radiusM},${lat},${lon}););out body center 200;`;

  const cacheKey = `around:${lat.toFixed(4)}:${lon.toFixed(4)}:${radiusM}`;
  const cached = overpassCache.get(cacheKey);
  if (cached) return cached;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const data = await safeFetchJson(
      endpoint,
      "Overpass-around",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body: `data=${encodeURIComponent(query)}`,
      },
      3,
    );
    if (data && Array.isArray(data.elements)) {
      overpassCache.set(cacheKey, data.elements);
      return data.elements;
    }
  }
  return [];
}

function getElementCoords(el: any): { lat: number; lon: number } | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
  return null;
}

function buildSchoolName(tags: Record<string, string>): string {
  return tags.name || tags["official_name"] || tags["short_name"] || tags["name:pt"] || generateFallbackSchoolName();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cep, localidade, uf } = await req.json();
    const cleanCep = String(cep || "").replace(/\D/g, "");
    const city = String(localidade || "").trim();
    const state = String(uf || "").trim().toUpperCase();

    if (!city) {
      return new Response(JSON.stringify({ found: false, reason: "missing_city" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cityDisplay = state ? `${city}/${state}` : city;

    // 1. Geocode the CEP first, fallback to city name
    let origin = cleanCep ? await geocode(cleanCep) : null;
    if (!origin) {
      origin = await geocode(`${city}, ${state}`);
    }

    if (!origin) {
      // Can't geocode at all — return fallback
      return new Response(JSON.stringify({
        found: true,
        agency: { name: generateFallbackSchoolName(), endereco: cityDisplay },
        reason: "geocode_failed",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. Query schools within 30km radius
    const schools = await queryOverpassAround(origin.lat, origin.lon, RADIUS_METERS);

    if (schools.length === 0) {
      return new Response(JSON.stringify({
        found: true,
        agency: { name: generateFallbackSchoolName(), endereco: cityDisplay },
        reason: "no_schools_in_radius",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3. Sort by distance and pick the closest
    const withDistance = schools
      .map((s) => {
        const coords = getElementCoords(s);
        if (!coords) return null;
        return { school: s, distKm: haversineKm(origin!.lat, origin!.lon, coords.lat, coords.lon) };
      })
      .filter(Boolean) as { school: any; distKm: number }[];

    withDistance.sort((a, b) => a.distKm - b.distKm);

    const nearest = withDistance[0];
    if (!nearest) {
      return new Response(JSON.stringify({
        found: true,
        agency: { name: generateFallbackSchoolName(), endereco: cityDisplay },
        reason: "no_coords_on_schools",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const tags = nearest.school?.tags || {};

    // Build full address from OSM tags
    const street = tags["addr:street"] || tags["addr:full"] || "";
    const houseNumber = tags["addr:housenumber"] || "";
    const suburb = tags["addr:suburb"] || tags["addr:neighbourhood"] || "";
    const addressParts = [
      street && houseNumber ? `${street}, ${houseNumber}` : street,
      suburb,
      cityDisplay,
    ].filter(Boolean);
    const fullAddress = addressParts.join(" — ") || cityDisplay;

    return new Response(JSON.stringify({
      found: true,
      agency: {
        name: buildSchoolName(tags),
        endereco: fullAddress,
        cidade: cityDisplay,
      },
      metadata: {
        city: cityDisplay,
        source: "radius-30km",
        distanceKm: Math.round(nearest.distKm * 10) / 10,
        totalSchoolsFound: withDistance.length,
        cep: cleanCep || null,
      },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error finding school:", error);
    return new Response(JSON.stringify({
      found: false, reason: "error",
      message: error instanceof Error ? error.message : String(error),
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
