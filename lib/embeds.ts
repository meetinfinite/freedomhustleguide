import fs from "node:fs/promises";
import https from "node:https";
import path from "node:path";

/**
 * Link-embed integration — the Airbnb / GetYourGuide counterpart to the
 * Google-Places flow in lib/places.ts.
 *
 * Takes an accommodation (Airbnb) or activity (GetYourGuide) URL and
 * resolves it to a small card payload (title, photo, rating, etc.), so
 * NotionRenderer can render a native EmbedCard instead of a raw link.
 *
 * Data sources, per host:
 *   - Airbnb        → Open Graph tags on the listing page (no key needed).
 *   - GetYourGuide  → the page is bot-protected (403 to server fetches), so
 *                     we render a clean branded link card. When a partner
 *                     key is configured (GETYOURGUIDE_PARTNER_ID + the
 *                     official Partner API), this is where rich GYG data
 *                     would slot in — the card already upgrades itself the
 *                     moment `image`/`rating` are present.
 *
 * Results are cached to disk (best-effort; ephemeral on serverless, which
 * is fine — the section route revalidates every 60s).
 */

export type EmbedKind = "airbnb" | "getyourguide";

export interface EmbedData {
  kind: EmbedKind;
  /** The URL the card's CTA links to (affiliate-tagged when configured). */
  url: string;
  /** Card heading. */
  title: string;
  /** Secondary line — e.g. "Tiny home in Mickleton" for an Airbnb. */
  subtitle?: string;
  /** Hero image (og:image). Absent for link-only cards (e.g. GYG today). */
  image?: string;
  /** Star rating 0–5 when the source exposes one. */
  rating?: number;
  /** Compact detail string — e.g. "1 bedroom · 1 bed · 1 bath". */
  details?: string;
  fetchedAt: number;
}

// ---------------------------------------------------------------------------
// Host matching
// ---------------------------------------------------------------------------

const AIRBNB_HOST_RE =
  /^https?:\/\/(www\.)?(airbnb\.[a-z.]+|abnb\.me)\//i;
const GYG_HOST_RE =
  /^https?:\/\/(www\.)?(getyourguide\.[a-z.]+|gyg\.me)\//i;

/** Classify a URL as an embeddable host, or null if it's neither. */
export function embedKindForUrl(url: string): EmbedKind | null {
  if (!url) return null;
  if (AIRBNB_HOST_RE.test(url)) return "airbnb";
  if (GYG_HOST_RE.test(url)) return "getyourguide";
  return null;
}

/**
 * Pull what the GetYourGuide activity widget needs straight out of one of
 * Valeria's affiliate links — both pieces are already in the URL:
 *   .../<slug>-t177729/?partner_id=JGBJRKR&...
 *                ^tourId          ^partnerId
 * Falls back to GETYOURGUIDE_PARTNER_ID for the partner id when the link
 * doesn't carry one. Returns null if there's no tour id to render.
 */
export function parseGetYourGuide(
  url: string
): { tourId: string; partnerId: string } | null {
  if (embedKindForUrl(url) !== "getyourguide") return null;
  const m = url.match(/-t(\d+)(?:\/|\?|#|$)/);
  if (!m) return null;
  let partnerId = process.env.GETYOURGUIDE_PARTNER_ID || "";
  try {
    const fromUrl = new URL(url).searchParams.get("partner_id");
    if (fromUrl) partnerId = fromUrl;
  } catch {
    /* leave partnerId as the env fallback */
  }
  return { tourId: m[1], partnerId };
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheFile {
  [cacheKey: string]: EmbedData;
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_PATH = path.join(process.cwd(), "tina", ".embed-cache.json");

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
    console.warn("[embeds] failed to write cache:", err);
  }
}

function cacheKeyFor(url: string): string {
  return url.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Short-link resolution (abnb.me / gyg.me) — same trick as lib/places.ts:
// Next's fetch wrapper swallows 30x, so we read Location via node:https.
// ---------------------------------------------------------------------------

function headLocation(targetUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const u = new URL(targetUrl);
      const req = https.request(
        {
          method: "HEAD",
          host: u.host,
          path: u.pathname + u.search,
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
  if (!/abnb\.me|gyg\.me/.test(url)) return url;
  let current = url;
  for (let hops = 0; hops < 5; hops++) {
    const loc = await headLocation(current);
    if (!loc) return current;
    current = new URL(loc, current).toString();
    if (!/abnb\.me|gyg\.me/.test(current)) return current;
  }
  return current;
}

// ---------------------------------------------------------------------------
// HTML / Open Graph parsing
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#39": "'"
};

/** Decode the handful of HTML entities Airbnb actually emits in meta tags. */
function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === "#") {
      const num =
        code[1] === "x" || code[1] === "X"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isFinite(num) ? String.fromCodePoint(num) : m;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? m;
  });
}

/** Read a single <meta property|name="og:KEY" content="…"> value. */
function metaContent(html: string, prop: string): string | undefined {
  const tagRe = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*>`,
    "i"
  );
  const tag = html.match(tagRe)?.[0];
  if (!tag) return undefined;
  const m = tag.match(/content=(["'])([\s\S]*?)\1/i);
  return m ? decodeEntities(m[2]).trim() : undefined;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        // A browser-like UA — Airbnb serves OG tags to these but not to
        // bare bots.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml"
      }
    });
    if (!res.ok) {
      console.warn(`[embeds] fetch ${res.status} for ${url.slice(0, 80)}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn("[embeds] fetch error", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Per-host resolvers
// ---------------------------------------------------------------------------

/**
 * Airbnb listing → EmbedData from Open Graph tags. The OG title is a
 * structured summary like "Tiny home in Mickleton · ★4.9 · 1 bedroom ·
 * 1 bed · 1 bath"; the OG description is the catchy listing name. We use
 * the listing name as the heading and lift the rating + the property/
 * location segment out of the title.
 */
async function resolveAirbnb(resolvedUrl: string): Promise<EmbedData | null> {
  const html = await fetchHtml(resolvedUrl);
  if (!html) return null;

  const ogTitle = metaContent(html, "og:title");
  const ogDesc = metaContent(html, "og:description");
  const ogImage = metaContent(html, "og:image");
  if (!ogTitle && !ogDesc) return null;

  const segments = (ogTitle || "")
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  let rating: number | undefined;
  const detailParts: string[] = [];
  let subtitle: string | undefined;
  segments.forEach((seg, i) => {
    const star = seg.match(/★\s*([\d.]+)/);
    if (star) {
      const n = parseFloat(star[1]);
      if (Number.isFinite(n)) rating = n;
      return;
    }
    if (i === 0) subtitle = seg; // "Tiny home in Mickleton"
    else detailParts.push(seg); // bedrooms / beds / baths
  });

  const title = ogDesc || subtitle || "Airbnb stay";
  return {
    kind: "airbnb",
    url: resolvedUrl,
    title,
    subtitle: subtitle && subtitle !== title ? subtitle : undefined,
    image: ogImage,
    rating,
    details: detailParts.length ? detailParts.join(" · ") : undefined,
    fetchedAt: Date.now()
  };
}

/**
 * GetYourGuide → link-only card today (the page is bot-protected). When a
 * partner key is configured we append it for affiliate attribution, and
 * this is the seam where the official Partner API response would populate
 * image/rating/price to upgrade the card to rich automatically.
 */
function resolveGetYourGuide(
  originalUrl: string,
  fallbackTitle?: string
): EmbedData {
  const partnerId = process.env.GETYOURGUIDE_PARTNER_ID;
  let url = originalUrl;
  if (partnerId) {
    try {
      const u = new URL(originalUrl);
      if (!u.searchParams.has("partner_id")) {
        u.searchParams.set("partner_id", partnerId);
        url = u.toString();
      }
    } catch {
      /* leave url as-is */
    }
  }
  return {
    kind: "getyourguide",
    url,
    title: fallbackTitle?.trim() || "GetYourGuide activity",
    fetchedAt: Date.now()
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolve an Airbnb / GetYourGuide URL into card data. `fallbackTitle` is
 * the link text the editor wrote in Notion — used when we can't (or don't)
 * fetch a richer title. Returns null only when the URL isn't a supported
 * host or an Airbnb fetch yields nothing usable.
 */
export async function getEmbedFromUrl(
  rawUrl: string,
  opts: { fallbackTitle?: string; forceRefresh?: boolean } = {}
): Promise<EmbedData | null> {
  const kind = embedKindForUrl(rawUrl);
  if (!kind) return null;

  // GetYourGuide does no network fetch — it's pure URL manipulation
  // (incl. the affiliate param), so resolve it fresh every time rather
  // than caching a URL that would go stale the moment a partner key is
  // added.
  if (kind === "getyourguide") {
    const resolved = await resolveShortUrl(rawUrl);
    return resolveGetYourGuide(resolved, opts.fallbackTitle);
  }

  // Airbnb — cache the fetched Open Graph data on disk.
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

  const resolvedUrl = await resolveShortUrl(rawUrl);
  const data: EmbedData = (await resolveAirbnb(resolvedUrl)) ?? {
    // Fall back to a bare link card if the listing couldn't be read.
    kind: "airbnb",
    url: resolvedUrl,
    title: opts.fallbackTitle?.trim() || "Airbnb stay",
    fetchedAt: Date.now()
  };

  cache[key] = data;
  await saveCache(cache);
  return data;
}
