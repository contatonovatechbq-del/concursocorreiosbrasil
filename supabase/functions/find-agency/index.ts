

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const USER_AGENT =
  Deno.env.get("BUCKPAY_USER_AGENT") ||
  "Concorreios/1.0 (nearest-agency-lookup; concorreios.lovable.app)";
const MIN_REQUEST_INTERVAL_MS = 1500;
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

let lastExternalCallAt = 0;
const geocodeCache = new Map<string, { lat: number; lon: number }>();
const overpassCache = new Map<string, any[]>();
const reverseAddressCache = new Map<string, string>();

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
  if (Number.isFinite(seconds)) {
    return Math.max(250, seconds * 1000);
  }

  const dateMs = Date.parse(retryAfter);
  if (Number.isFinite(dateMs)) {
    return Math.max(250, dateMs - Date.now());
  }

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

      const res = await fetch(url, {
        ...init,
        headers: mergedHeaders,
        signal: controller.signal,
      });

      const text = await res.text();

      if (res.status === 429) {
        console.error(`${label} returned status 429: ${text.substring(0, 150)}`);

        if (attempt < attempts) {
          const retryAfterMs = parseRetryAfterMs(res.headers.get("Retry-After"));
          await sleep(retryAfterMs ?? computeBackoffMs(attempt));
          continue;
        }

        return null;
      }

      if (res.status >= 500) {
        console.error(`${label} returned status ${res.status}: ${text.substring(0, 150)}`);

        if (attempt < attempts) {
          await sleep(computeBackoffMs(attempt));
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
        await sleep(computeBackoffMs(attempt));
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

function escapeOverpassValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
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
      3,
    );

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

function isGenericAddress(address: string, fallbackCity?: string, fallbackState?: string): boolean {
  const cleaned = (address || "").trim();
  if (!cleaned) return true;

  if (fallbackCity && fallbackState) {
    if (cleaned === `${fallbackCity}/${fallbackState}` || cleaned === `${fallbackCity} — ${fallbackState}`) {
      return true;
    }
  }

  if (fallbackCity && cleaned === fallbackCity) return true;

  return !cleaned.includes(",") && !/\d/.test(cleaned);
}

async function reverseGeocodeAddress(
  lat: number,
  lon: number,
  fallbackCity?: string,
  fallbackState?: string,
): Promise<string | null> {
  const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  const cached = reverseAddressCache.get(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "jsonv2",
    addressdetails: "1",
    zoom: "18",
  });

  const data = await safeFetchJson(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    "Nominatim-reverse",
    {},
    2,
  );

  const addr = data?.address || {};
  const street = addr.road || addr.pedestrian || addr.residential || addr.cycleway || "";
  const number = addr.house_number || "";
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.city_district ||
    fallbackCity ||
    "";
  const state = fallbackState || addr.state_code || addr.state || "";

  let formatted = "";

  if (street) {
    formatted = street;
    if (number) formatted += `, ${number}`;
    if (city) formatted += ` — ${city}`;
    if (state) formatted += `/${state}`;
  } else if (data?.display_name) {
    formatted = String(data.display_name).split(",").slice(0, 3).join(",").trim();
  }

  if (!formatted) return null;

  reverseAddressCache.set(key, formatted);
  return formatted;
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

    if (!coords && localidade) {
      const areaQuery = `[out:json][timeout:20];area["name"="${safeLocalidade}"]["boundary"="administrative"]->.a;(node["amenity"="post_office"](area.a);way["amenity"="post_office"](area.a);relation["amenity"="post_office"](area.a););out body center 1;`;
      const elements = await queryOverpass(areaQuery, "Overpass-area");

      if (elements.length > 0) {
        const el = elements[0];
        const tags = el.tags || {};
        const elCoords = extractElementCoords(el);
        let endereco = buildEndereco(tags, localidade, uf);

        if (elCoords && isGenericAddress(endereco, localidade, uf)) {
          const reverseAddr = await reverseGeocodeAddress(elCoords.lat, elCoords.lon, localidade, uf);
          if (reverseAddr) endereco = reverseAddr;
        }

        return new Response(
          JSON.stringify({
            found: true,
            agency: {
              name: tags.name || tags["official_name"] || "Agência dos Correios",
              endereco,
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

    for (const radius of [5000, 15000, 30000, 60000]) {
      const overpassQuery = `[out:json][timeout:20];(node["amenity"="post_office"](around:${radius},${coords.lat},${coords.lon});way["amenity"="post_office"](around:${radius},${coords.lat},${coords.lon});relation["amenity"="post_office"](around:${radius},${coords.lat},${coords.lon}););out body center;`;
      const elements = await queryOverpass(overpassQuery, `Overpass-${radius}`);
      if (elements.length > 0) {
        agencies = elements;
        break;
      }
    }

    if (agencies.length === 0 && localidade) {
      const areaQuery = `[out:json][timeout:20];area["name"="${safeLocalidade}"]["boundary"="administrative"]->.a;(node["amenity"="post_office"](area.a);way["amenity"="post_office"](area.a);relation["amenity"="post_office"](area.a););out body center 40;`;
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
      const agCoords = extractElementCoords(ag);
      if (agCoords) {
        const dist = haversineDistance(coords.lat, coords.lon, agCoords.lat, agCoords.lon);
        if (dist < minDist) {
          minDist = dist;
          closest = ag;
        }
      }
    }

    const tags = closest?.tags || {};
    const closestCoords = extractElementCoords(closest);
    let endereco = buildEndereco(tags, localidade, uf);

    if (closestCoords && isGenericAddress(endereco, localidade, uf)) {
      const reverseAddr = await reverseGeocodeAddress(closestCoords.lat, closestCoords.lon, localidade, uf);
      if (reverseAddr) {
        endereco = reverseAddr;
      }
    }

    const agency: Record<string, string | number> = {
      name: tags.name || tags["official_name"] || "Agência dos Correios",
      endereco,
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
  const full = tags["addr:full"] || "";
  if (full) return full;

  const street =
    tags["addr:street"] ||
    tags["contact:street"] ||
    tags["street"] ||
    tags["addr:place"] ||
    "";

  const number =
    tags["addr:housenumber"] ||
    tags["contact:housenumber"] ||
    tags["addr:unit"] ||
    "";

  const city =
    tags["addr:city"] ||
    tags["contact:city"] ||
    tags["addr:municipality"] ||
    fallbackCity ||
    "";

  const state = tags["addr:state"] || tags["contact:state"] || fallbackState || "";

  if (!street) return city && state ? `${city}/${state}` : city || "";

  let addr = street;
  if (number) addr += `, ${number}`;
  if (city) addr += ` — ${city}`;
  if (state) addr += `/${state}`;
  return addr;
}
