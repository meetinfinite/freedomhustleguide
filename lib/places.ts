import fs from "node:fs/promises";
import https from "node:https";
import path from "node:path";

/**
 * Google Places integration.
 *
 * Takes any Google Maps URL → resolves to a Place ID → fetches details
 * (name, address, rating, photo). Caches results to disk so we don't hit
 * the API on every request.
 *
 * Requires GOOGLE_PLACES_API_KEY. Without it, returns null so PlaceCard can
 * fall back to a basic link card.
 */

export interface PlaceData {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: number;
  /** Photo reference names (max 10). Each fetched on demand via /api/place-photo. */
  photoNames: string[];
  googleMapsUri: string;
  fetchedAt: number;
}

interface CacheFile {
  [cacheKey: string]: PlaceData;
}

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const CACHE_PATH = path.join(process.cwd(), "tina", ".place-cache.json");

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

let memoryCache: CacheFile | null = null;
let memoryCacheLoaded = false;

async function loadCache(): Promise<CacheFile> {
  if (memoryCacheLoaded && memoryCache) return memoryCache;
  try {
    const raw = await fs.readFile(CACHE_PATH, "utf8");
    memoryCache = JSON.parse(raw) as CacheFile;
  } catch {
    memoryCache = {};
  }
  memoryCacheLoaded = true;
  return memoryCache;
}

async function saveCache(cache: CacheFile): Promise<void> {
  try {
    await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
    await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
    memoryCache = cache;
  } catch (err) {
    console.warn("[places] failed to write cache:", err);
  }
}

function cacheKeyFor(url: string): string {
  return url.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// URL resolution & parsing
// ---------------------------------------------------------------------------

/**
 * Follows short Google links (maps.app.goo.gl, goo.gl/maps) to their final URL.
 *
 * Manually walks the redirect chain: Next.js wraps `fetch` in a way that
 * suppresses `redirect: 'follow'` for these URLs, so we hop Location headers
 * ourselves with `redirect: 'manual'` + `cache: 'no-store'`.
 */
/** Read the Location header of a single hop without following it.
 *  Uses node:https because Next.js's fetch wrapper auto-follows redirects
 *  and swallows the 30x status, leaving us with no Location header to chase. */
function headLocation(targetUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const u = new URL(targetUrl);
      const req = https.request(
        {
          method: "HEAD",
          host: u.host,
          path: u.pathname + u.search,
          // Google's short-link service serves the redirect to simple UAs
          // but renders the destination page (200) for full browser UAs.
          // Keep this minimal.
          headers: { "User-Agent": "Mozilla/5.0" }
        },
        (res) => {
          res.resume();
          const loc = res.headers.location;
          resolve(typeof loc === "string" ? loc : null);
        }
      );
      req.on("error", () => resolve(null));
      req.end();
    } catch {
      resolve(null);
    }
  });
}

async function resolveShortUrl(url: string): Promise<string> {
  if (!/goo\.gl|maps\.app\.goo\.gl/.test(url)) return url;
  let current = url;
  for (let hops = 0; hops < 5; hops++) {
    const loc = await headLocation(current);
    if (!loc) return current;
    current = new URL(loc, current).toString();
    if (!/goo\.gl|maps\.app\.goo\.gl/.test(current)) return current;
  }
  return current;
}

/** Pulls a place_id from a Maps URL if it's directly present. */
function extractPlaceId(url: string): string | null {
  const m = url.match(/[?&]place_id=([^&]+)/);
  if (m) return decodeURIComponent(m[1]);
  return null;
}

/** Pulls a coordinate pair (lat,lng) from a Maps URL if present. */
function extractCoords(url: string): { lat: number; lng: number } | null {
  const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}

/** Pulls the place name from a /place/<name>/ URL segment. */
function extractName(url: string): string | null {
  const m = url.match(/\/place\/([^/?@]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]).replace(/\+/g, " ");
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Google Places API (New)
// ---------------------------------------------------------------------------

const PLACES_API = "https://places.googleapis.com/v1";

const PLACE_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "rating",
  "userRatingCount",
  "priceLevel",
  "googleMapsUri",
  "photos"
].join(",");

async function getApiKey(): Promise<string | null> {
  return process.env.GOOGLE_PLACES_API_KEY || null;
}

async function findPlaceByText(
  query: string,
  bias?: { lat: number; lng: number }
): Promise<string | null> {
  const key = await getApiKey();
  if (!key) return null;
  try {
    const body: Record<string, unknown> = { textQuery: query };
    if (bias) {
      body.locationBias = {
        circle: {
          center: { latitude: bias.lat, longitude: bias.lng },
          radius: 500
        }
      };
    }
    const res = await fetch(`${PLACES_API}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id"
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      console.warn("[places] searchText failed", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { places?: { id: string }[] };
    return data.places?.[0]?.id || null;
  } catch (err) {
    console.warn("[places] searchText error", err);
    return null;
  }
}

async function fetchPlaceDetails(placeId: string): Promise<PlaceData | null> {
  const key = await getApiKey();
  if (!key) return null;
  try {
    const res = await fetch(
      `${PLACES_API}/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": PLACE_FIELDS
        }
      }
    );
    if (!res.ok) {
      console.warn("[places] details failed", res.status, await res.text());
      return null;
    }
    const p = (await res.json()) as {
      id: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      rating?: number;
      userRatingCount?: number;
      priceLevel?: string;
      googleMapsUri?: string;
      photos?: { name: string }[];
    };
    const priceLevelMap: Record<string, number> = {
      PRICE_LEVEL_FREE: 0,
      PRICE_LEVEL_INEXPENSIVE: 1,
      PRICE_LEVEL_MODERATE: 2,
      PRICE_LEVEL_EXPENSIVE: 3,
      PRICE_LEVEL_VERY_EXPENSIVE: 4
    };
    return {
      placeId: p.id,
      name: p.displayName?.text || "Unknown place",
      address: p.formattedAddress || "",
      rating: p.rating,
      userRatingCount: p.userRatingCount,
      priceLevel: p.priceLevel ? priceLevelMap[p.priceLevel] : undefined,
      photoNames: (p.photos || []).slice(0, 10).map((ph) => ph.name),
      googleMapsUri:
        p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${p.id}`,
      fetchedAt: Date.now()
    };
  } catch (err) {
    console.warn("[places] details error", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Given any Google Maps URL, return the Place data. Cached on disk.
 * Returns null if no API key is set OR if the URL can't be resolved.
 */
export async function getPlaceFromUrl(
  rawUrl: string,
  opts: { forceRefresh?: boolean } = {}
): Promise<PlaceData | null> {
  if (!rawUrl) return null;
  const key = cacheKeyFor(rawUrl);
  const cache = await loadCache();
  const cached = cache[key];
  if (
    !opts.forceRefresh &&
    cached &&
    Date.now() - cached.fetchedAt < CACHE_TTL_MS
  ) {
    return cached;
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    // No API key — return null so the UI shows a basic fallback.
    return null;
  }

  // 1. Resolve short links
  const resolved = await resolveShortUrl(rawUrl);

  // 2. Find Place ID
  let placeId = extractPlaceId(resolved);
  if (!placeId) {
    const name = extractName(resolved);
    const coords = extractCoords(resolved);
    if (name) {
      placeId = await findPlaceByText(name, coords ?? undefined);
    } else if (coords) {
      placeId = await findPlaceByText(`${coords.lat},${coords.lng}`, coords);
    }
  }
  if (!placeId) return null;

  // 3. Fetch details
  const details = await fetchPlaceDetails(placeId);
  if (!details) return null;

  // 4. Cache
  cache[key] = details;
  await saveCache(cache);
  return details;
}

/**
 * Fetch the raw image bytes for a Place photo. Used by /api/place-photo to
 * proxy through our server so we never expose the API key to the browser.
 */
export async function fetchPlacePhoto(
  photoName: string,
  maxWidthPx = 800
): Promise<{ bytes: ArrayBuffer; contentType: string } | null> {
  const key = await getApiKey();
  if (!key || !photoName) return null;
  try {
    const url = `${PLACES_API}/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${key}`;
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      console.warn(
        "[places] photo failed",
        res.status,
        photoName.slice(0, 60)
      );
      return null;
    }
    const bytes = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return { bytes, contentType };
  } catch (err) {
    console.warn("[places] photo error", err);
    return null;
  }
}
