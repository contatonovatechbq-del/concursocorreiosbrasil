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

let lastExternalCallAt = 0;
const overpassCache = new Map<string, any[]>();
const cityAreaCache = new Map<string, number | null>();

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

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeOverpassValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

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
  const exponential = 800 * Math.pow(2, attempt - 1);
  const jitter = Math.floor(Math.random() * 500);
  return Math.min(exponential + jitter, 10000);
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
      timeoutId = setTimeout(() => controller.abort(), 13000);

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
        if (attempt < attempts) {
          const retryAfterMs = parseRetryAfterMs(res.headers.get("Retry-After"));
          await sleep(retryAfterMs ?? computeBackoffMs(attempt));
          continue;
        }

        return null;
      }

      if (res.status >= 500) {
        if (attempt < attempts) {
          await sleep(computeBackoffMs(attempt));
          continue;
        }

        return null;
      }

      if (!res.ok) {
        return null;
      }

      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    } catch {
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

function osmToAreaId(osmType: string, osmId: number): number | null {
  if (!Number.isFinite(osmId)) return null;

  if (osmType === "relation") return 3600000000 + osmId;
  if (osmType === "way") return 2400000000 + osmId;

  return null;
}

async function resolveCityAreaId(city: string, uf: string): Promise<number | null> {
  const key = `${normalizeText(city)}:${uf}`;

  if (cityAreaCache.has(key)) {
    return cityAreaCache.get(key) ?? null;
  }

  const params = new URLSearchParams({
    q: `${city}, ${uf}, Brasil`,
    format: "jsonv2",
    limit: "8",
    countrycodes: "br",
    addressdetails: "1",
  });

  const data = await safeFetchJson(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    "Nominatim-city-area",
  );

  if (!Array.isArray(data) || data.length === 0) {
    cityAreaCache.set(key, null);
    return null;
  }

  const normalizedCity = normalizeText(city);
  let bestAreaId: number | null = null;
  let bestScore = -1;

  for (const item of data) {
    const osmType = String(item?.osm_type || "");
    const osmId = Number(item?.osm_id);
    const areaId = osmToAreaId(osmType, osmId);
    if (!areaId) continue;

    const address = item?.address || {};
    const stateCode = String(address?.state_code || "")
      .replace(/^br-/i, "")
      .toUpperCase();
    const cityName = String(
      address?.city ||
        address?.town ||
        address?.municipality ||
        address?.village ||
        address?.city_district ||
        "",
    );

    const normalizedResultCity = normalizeText(cityName);

    let score = 0;
    if (stateCode === uf) score += 4;
    if (normalizedResultCity === normalizedCity) score += 4;
    if (["administrative", "city", "town", "municipality"].includes(String(item?.type || ""))) score += 1;

    if (score > bestScore) {
      bestScore = score;
      bestAreaId = areaId;
    }
  }

  cityAreaCache.set(key, bestAreaId);
  return bestAreaId;
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

function buildSchoolQueryFromAreaId(areaId: number): string {
  return `[out:json][timeout:25];area(${areaId})->.a;(node["amenity"="school"](area.a);way["amenity"="school"](area.a);relation["amenity"="school"](area.a););out body center 200;`;
}

function buildSchoolQueryFromCityName(city: string): string {
  const safeCity = escapeOverpassValue(city);
  return `[out:json][timeout:25];area["name"="${safeCity}"]["boundary"="administrative"]["admin_level"~"7|8"]->.a;(node["amenity"="school"](area.a);way["amenity"="school"](area.a);relation["amenity"="school"](area.a););out body center 200;`;
}

function buildSchoolName(tags: Record<string, string>): string {
  return (
    tags.name ||
    tags["official_name"] ||
    tags["short_name"] ||
    tags["name:pt"] ||
    generateFallbackSchoolName()
  );
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
    const areaId = await resolveCityAreaId(city, state);

    let schools: any[] = [];

    if (areaId) {
      schools = await queryOverpass(buildSchoolQueryFromAreaId(areaId), "Overpass-school-area-id");
    }

    if (schools.length === 0) {
      schools = await queryOverpass(buildSchoolQueryFromCityName(city), "Overpass-school-city-name");
    }

    if (schools.length === 0) {
      return new Response(
        JSON.stringify({
          found: true,
          agency: {
            name: generateFallbackSchoolName(),
            endereco: cityDisplay,
          },
          reason: "city_without_mapped_schools",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const picked = randomFrom(schools);
    const tags = picked?.tags || {};

    return new Response(
      JSON.stringify({
        found: true,
        agency: {
          name: buildSchoolName(tags),
          endereco: cityDisplay,
        },
        metadata: {
          city: cityDisplay,
          source: areaId ? "area-id" : "city-name",
          totalSchoolsFound: schools.length,
          cep: cleanCep || null,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error finding school:", error);

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
