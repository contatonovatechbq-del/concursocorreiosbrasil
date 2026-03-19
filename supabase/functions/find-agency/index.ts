const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const USER_AGENT =
  Deno.env.get("BUCKPAY_USER_AGENT") ||
  "Concorreios/1.0 (nearest-school-lookup; concorreios.lovable.app)";
const MIN_REQUEST_INTERVAL_MS = 1500;
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

function parseRetryAfterMs(retryAfter: string | null): number | null {
  if (!retryAfter) return null;
  const seconds = Number.parseInt(retryAfter, 10);
  if (Number.isFinite(seconds)) return Math.max(250, seconds * 1000);
  const dateMs = Date.parse(retryAfter);
  if (Number.isFinite(dateMs)) return Math.max(250, dateMs - Date.now());
  return null;
}

function computeBackoffMs(attempt: number): number {
  const exponential = 1000 * Math.pow(2, attempt - 1);
  const jitter = Math.floor(Math.random() * 800);
  return Math.min(exponential + jitter, 12000);
}

async function safeFetchJson(
  url: string,
  label: string,
  init: RequestInit = {},
  attempts = 3,
): Promise<any | null> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let timeoutId: number | undefined;
    try {
      await waitRateLimit();
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 14000);
      const mergedHeaders = {
        "User-Agent": USER_AGENT,
        Accept: "application/json,text/plain,*/*",
        ...(init.headers || {}),
      };
      const res = await fetch(url, { ...init, headers: mergedHeaders, signal: controller.signal });
      const text = await res.text();

      if (res.status === 429) {
        console.error(`${label} 429: ${text.substring(0, 150)}`);
        if (attempt < attempts) { await sleep(parseRetryAfterMs(res.headers.get("Retry-After")) ?? computeBackoffMs(attempt)); continue; }
        return null;
      }
      if (res.status >= 500) {
        console.error(`${label} ${res.status}: ${text.substring(0, 150)}`);
        if (attempt < attempts) { await sleep(computeBackoffMs(attempt)); continue; }
        return null;
      }
      if (!res.ok) { console.error(`${label} ${res.status}: ${text.substring(0, 150)}`); return null; }
      try { return JSON.parse(text); } catch { console.error(`${label} non-JSON: ${text.substring(0, 150)}`); return null; }
    } catch (e) {
      console.error(`${label} fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      if (attempt < attempts) { await sleep(computeBackoffMs(attempt)); continue; }
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
  const params = new URLSearchParams({ q: query, format: "json", limit: "1", countrycodes: "br", addressdetails: "0" });
  const data = await safeFetchJson(`https://nominatim.openstreetmap.org/search?${params.toString()}`, label);
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
  const params = new URLSearchParams({ q: query, limit: "1" });
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

function escapeOverpassValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function queryOverpass(query: string, label: string): Promise<any[]> {
  const cacheKey = `overpass:${query}`;
  const cached = overpassCache.get(cacheKey);
  if (cached) return cached;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const data = await safeFetchJson(endpoint, `${label}-${new URL(endpoint).host}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: `data=${encodeURIComponent(query)}`,
    }, 3);
    if (data && Array.isArray(data.elements)) {
      overpassCache.set(cacheKey, data.elements);
      return data.elements;
    }
  }
  return [];
}

function extractElementCoords(element: any): { lat: number; lon: number } | null {
  const lat = Number(element?.lat ?? element?.center?.lat);
  const lon = Number(element?.lon ?? element?.center?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

// School-specific Overpass query helper
function buildSchoolOverpassQuery(lat: number, lon: number, radius: number): string {
  return `[out:json][timeout:20];(node["amenity"="school"](around:${radius},${lat},${lon});way["amenity"="school"](around:${radius},${lat},${lon});relation["amenity"="school"](around:${radius},${lat},${lon}););out body center;`;
}

function buildSchoolAreaQuery(cityName: string): string {
  return `[out:json][timeout:20];area["name"="${cityName}"]["boundary"="administrative"]->.a;(node["amenity"="school"](area.a);way["amenity"="school"](area.a);relation["amenity"="school"](area.a););out body center 40;`;
}

// School name fallback list for when no school is found via API
const SCHOOL_PREFIXES = [
  "Escola Municipal",
  "Escola Estadual",
  "Centro Educacional",
  "Colégio Estadual",
  "Escola de Ensino Fundamental",
];
const SCHOOL_SUFFIXES = [
  "São José",
  "Nossa Senhora Aparecida",
  "Dom Pedro II",
  "Presidente Vargas",
  "Tiradentes",
  "Castro Alves",
  "Santos Dumont",
  "Rui Barbosa",
  "Machado de Assis",
  "Monteiro Lobato",
];

function generateFallbackSchoolName(): string {
  const prefix = SCHOOL_PREFIXES[Math.floor(Math.random() * SCHOOL_PREFIXES.length)];
  const suffix = SCHOOL_SUFFIXES[Math.floor(Math.random() * SCHOOL_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
}

Deno.serve(async (req) => {
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
    const safeLocalidade = localidade ? escapeOverpassValue(String(localidade)) : "";
    const cityDisplay = localidade && uf ? `${localidade}/${uf}` : localidade || "";

    // Geocode the CEP/city
    let coords: { lat: number; lon: number } | null = null;

    if (cleanCep.length >= 8) {
      coords = await geocodeNominatim(`${cleanCep}, Brasil`, "Nominatim-cep");
    }
    if (!coords && localidade && uf) {
      coords = await geocodeNominatim(`${localidade}, ${uf}, Brasil`, "Nominatim-city");
    }
    if (!coords) {
      const composed = [cleanCep, localidade, uf, "Brasil"].filter(Boolean).join(", ");
      coords = await geocodePhoton(composed, "Photon-cep-city");
    }

    // If we can't geocode at all, return fallback school
    if (!coords && !localidade) {
      return new Response(JSON.stringify({ found: false, reason: "geocoding_failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Search for schools
    let schools: any[] = [];

    if (coords) {
      for (const radius of [5000, 15000, 30000, 60000]) {
        const query = buildSchoolOverpassQuery(coords.lat, coords.lon, radius);
        const elements = await queryOverpass(query, `Overpass-school-${radius}`);
        if (elements.length > 0) {
          schools = elements;
          break;
        }
      }
    }

    // Fallback: search by city area
    if (schools.length === 0 && localidade) {
      const areaQuery = buildSchoolAreaQuery(safeLocalidade);
      schools = await queryOverpass(areaQuery, "Overpass-school-area");
    }

    // If no schools found via API, use generated fallback
    if (schools.length === 0) {
      return new Response(JSON.stringify({
        found: true,
        agency: {
          name: generateFallbackSchoolName(),
          endereco: cityDisplay,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find closest school
    let closest = schools[0];
    let minDist = Infinity;

    if (coords) {
      for (const s of schools) {
        const sc = extractElementCoords(s);
        if (sc) {
          const dist = haversineDistance(coords.lat, coords.lon, sc.lat, sc.lon);
          if (dist < minDist) { minDist = dist; closest = s; }
        }
      }
    }

    const tags = closest?.tags || {};
    const schoolName = tags.name || tags["official_name"] || generateFallbackSchoolName();

    const result: Record<string, string | number> = {
      name: schoolName,
      endereco: cityDisplay,
    };

    if (coords && Number.isFinite(minDist)) {
      result.distanceKm = Math.round(minDist * 10) / 10;
    }

    return new Response(JSON.stringify({ found: true, agency: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error finding school:", error);
    return new Response(
      JSON.stringify({ found: false, reason: "error", message: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
