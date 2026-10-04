/**
 * Snapshot Google Places data for every venue card, so the live site
 * never calls Google (see lib/places.ts for why).
 *
 *   npx tsx scripts/places-snapshot.ts            # dry run: what's missing + est. cost
 *   npx tsx scripts/places-snapshot.ts --commit   # fetch the missing venues
 *
 * Options:
 *   --city <slug>   only this guide (e.g. --city bangkok)
 *   --refresh       re-fetch venues already in the snapshot (costs money)
 *   --prune         drop snapshot entries no longer linked from Notion
 *
 * Reads GOOGLE_PLACES_API_KEY + NOTION_TOKEN from .env.local. Writes
 * data/places.json and public/places/<placeId>-<n>.webp. Commit both.
 *
 * Only this script talks to Google. Never import it from app code.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import sharp from "sharp";

// ---- env -----------------------------------------------------------------
const ROOT = path.resolve(__dirname, "..");
for (const line of fs
  .readFileSync(path.join(ROOT, ".env.local"), "utf8")
  .split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const args = process.argv.slice(2);
const COMMIT = args.includes("--commit");
const REFRESH = args.includes("--refresh");
const PRUNE = args.includes("--prune");
const CITY = args.includes("--city") ? args[args.indexOf("--city") + 1] : null;

const SNAPSHOT_PATH = path.join(ROOT, "data", "places.json");
const PHOTO_DIR = path.join(ROOT, "public", "places");
const PHOTOS_PER_PLACE = 2;
const PHOTO_WIDTH = 1000;
const API = "https://places.googleapis.com/v1";
// Rating + review count are Enterprise-tier fields; Arni chose to keep
// them (captured once, never refreshed). No priceLevel - nothing shows it.
const DETAIL_FIELDS =
  "id,displayName,formattedAddress,googleMapsUri,rating,userRatingCount,photos";
// Approx. list prices (USD per lookup), before Google's free allowance.
const COST = { details: 0.02, photo: 0.007 };

interface PlacePhoto {
  src: string;
  author?: string;
  authorUri?: string;
}
interface PlaceData {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  photos: PlacePhoto[];
  googleMapsUri: string;
  fetchedAt: string;
}

async function main() {
  const { listGuides } = await import("../lib/guides");
  const { fetchSectionPage } = await import("../lib/notion");
  const { GMAPS_HOST_RE, placeKey } = await import("../lib/gmaps");

  const snapshot: Record<string, PlaceData> = JSON.parse(
    await fsp.readFile(SNAPSHOT_PATH, "utf8")
  );

  // 1. Every venue link the site renders (same rule as lib/notion.ts).
  const guides = listGuides().filter((g) => !CITY || g.slug === CITY);
  const linked = new Map<string, string>(); // key → url as pasted
  for (const g of guides) {
    let n = 0;
    for (const s of g.sections) {
      if (!s.notionPageId) continue;
      const page = await fetchSectionPage(s.notionPageId);
      for (const b of page?.blocks ?? []) {
        if (b.type !== "bulleted_list_item") continue;
        const first = (
          b.data as {
            rich_text?: { href?: string | null; annotations?: { bold?: boolean } }[];
          }
        )?.rich_text?.[0];
        if (!first?.annotations?.bold || !first.href) continue;
        if (!GMAPS_HOST_RE.test(first.href)) continue;
        linked.set(placeKey(first.href), first.href);
        n++;
      }
    }
    if (n) console.log(`${g.slug}: ${n} venue links`);
  }

  const todo = [...linked.entries()].filter(
    ([key]) => REFRESH || !snapshot[key]
  );
  const est = todo.length * (COST.details + PHOTOS_PER_PLACE * COST.photo);
  console.log(
    `\n${linked.size} distinct venues · ${linked.size - todo.length} already in snapshot · ${todo.length} to fetch (≈ $${est.toFixed(2)} at list price)`
  );

  const stale = CITY
    ? []
    : Object.keys(snapshot).filter((k) => !linked.has(k));
  if (stale.length) {
    console.log(
      `${stale.length} snapshot entries no longer linked from Notion${PRUNE ? " - pruning" : " (run with --prune to drop)"}`
    );
  }

  if (!COMMIT) {
    for (const [, url] of todo.slice(0, 20)) console.log("  would fetch", url);
    if (todo.length > 20) console.log(`  …and ${todo.length - 20} more`);
    console.log("\nDry run - nothing fetched. Re-run with --commit.");
    return;
  }

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY missing from .env.local");
  await fsp.mkdir(PHOTO_DIR, { recursive: true });

  // 2. Fetch. Several Notion links can point at one place - reuse it.
  const byPlaceId = new Map<string, PlaceData>();
  for (const p of Object.values(snapshot)) byPlaceId.set(p.placeId, p);
  const failed: string[] = [];
  let done = 0;
  const queue = todo.slice();
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (queue.length) {
        const [k, url] = queue.shift()!;
        try {
          const placeId = await resolvePlaceId(url, key);
          if (!placeId) throw new Error("no place found");
          let data = !REFRESH ? byPlaceId.get(placeId) : undefined;
          if (!data) {
            data = await fetchPlace(placeId, key);
            byPlaceId.set(placeId, data);
          }
          snapshot[k] = data;
        } catch (err) {
          failed.push(`${url}  (${err instanceof Error ? err.message : err})`);
        }
        done++;
        if (done % 25 === 0) {
          console.log(`  ${done}/${todo.length}`);
          await save(snapshot); // checkpoint so a crash doesn't waste calls
        }
      }
    })
  );

  if (PRUNE) {
    for (const k of stale) delete snapshot[k];
    const used = new Set(
      Object.values(snapshot).flatMap((p) => p.photos.map((ph) => path.basename(ph.src)))
    );
    for (const f of await fsp.readdir(PHOTO_DIR)) {
      if (!used.has(f)) await fsp.unlink(path.join(PHOTO_DIR, f));
    }
  }

  await save(snapshot);
  console.log(
    `\nDone: ${todo.length - failed.length} fetched, ${failed.length} failed.`
  );
  for (const f of failed) console.log("  ✗", f);
  if (failed.length) {
    console.log(
      "Failed links render as plain 'Open in Google Maps' cards. Usually the Notion link is a search or list link - swap it for the place's own Share link."
    );
  }
}

async function save(snapshot: Record<string, PlaceData>) {
  const sorted = Object.fromEntries(
    Object.entries(snapshot).sort(([a], [b]) => a.localeCompare(b))
  );
  await fsp.writeFile(SNAPSHOT_PATH, JSON.stringify(sorted, null, 2) + "\n");
}

// ---- Google ----------------------------------------------------------------

async function fetchPlace(placeId: string, key: string): Promise<PlaceData> {
  const res = await fetch(`${API}/places/${encodeURIComponent(placeId)}`, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": DETAIL_FIELDS }
  });
  if (!res.ok) throw new Error(`details ${res.status}: ${(await res.text()).slice(0, 120)}`);
  const p = (await res.json()) as {
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    googleMapsUri?: string;
    rating?: number;
    userRatingCount?: number;
    photos?: {
      name: string;
      authorAttributions?: { displayName?: string; uri?: string }[];
    }[];
  };

  const photos: PlacePhoto[] = [];
  for (const [i, ph] of (p.photos ?? []).slice(0, PHOTOS_PER_PLACE).entries()) {
    const file = `${safeName(p.id)}-${i + 1}.webp`;
    const img = await fetch(
      `${API}/${ph.name}/media?maxWidthPx=${PHOTO_WIDTH}&key=${key}`
    );
    if (!img.ok) continue;
    await sharp(Buffer.from(await img.arrayBuffer()))
      .resize({ width: PHOTO_WIDTH, withoutEnlargement: true })
      .webp({ quality: 62 })
      .toFile(path.join(PHOTO_DIR, file));
    const a = ph.authorAttributions?.[0];
    photos.push({
      src: `/places/${file}`,
      ...(a?.displayName ? { author: a.displayName } : {}),
      ...(a?.uri ? { authorUri: a.uri } : {})
    });
  }

  return {
    placeId: p.id,
    name: p.displayName?.text || "Unknown place",
    address: p.formattedAddress || "",
    ...(typeof p.rating === "number" ? { rating: p.rating } : {}),
    ...(p.userRatingCount ? { userRatingCount: p.userRatingCount } : {}),
    photos,
    googleMapsUri:
      p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${p.id}`,
    fetchedAt: new Date().toISOString().slice(0, 10)
  };
}

function safeName(placeId: string) {
  return placeId.replace(/[^A-Za-z0-9_-]/g, "");
}

/** Maps link → place ID. Text Search with only `places.id` is the free
 *  "IDs only" tier. */
async function resolvePlaceId(rawUrl: string, key: string): Promise<string | null> {
  const url = await resolveShortUrl(rawUrl);
  const direct = url.match(/[?&]place_id=([^&]+)/) || url.match(/query_place_id=([^&]+)/);
  if (direct) return decodeURIComponent(direct[1]);

  const coords = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const bias = coords ? { lat: +coords[1], lng: +coords[2] } : null;
  const query =
    decodeSeg(url.match(/\/place\/([^/?@]+)/)?.[1]) ||
    decodeSeg(url.match(/\/maps\/search\/([^/?@]+)/)?.[1]) ||
    decodeSeg(url.match(/[?&](?:query|q)=([^&]+)/)?.[1]) ||
    (bias ? `${bias.lat},${bias.lng}` : null);
  if (!query) return null;

  const res = await fetch(`${API}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id"
    },
    body: JSON.stringify({
      textQuery: query,
      ...(bias
        ? {
            locationBias: {
              circle: { center: { latitude: bias.lat, longitude: bias.lng }, radius: 500 }
            }
          }
        : {})
    })
  });
  if (!res.ok) throw new Error(`search ${res.status}: ${(await res.text()).slice(0, 120)}`);
  const data = (await res.json()) as { places?: { id: string }[] };
  return data.places?.[0]?.id ?? null;
}

function decodeSeg(s?: string): string | null {
  if (!s) return null;
  try {
    return decodeURIComponent(s).replace(/\+/g, " ");
  } catch {
    return s;
  }
}

const SHORT_RE = /goo\.gl|maps\.app\.goo\.gl|share\.google/;

/** Follow maps.app.goo.gl / share.google redirects by hand (HEAD hops). */
async function resolveShortUrl(url: string): Promise<string> {
  let current = url;
  for (let hops = 0; hops < 5 && SHORT_RE.test(current); hops++) {
    const loc = await headLocation(current);
    if (!loc) break;
    current = new URL(loc, current).toString();
  }
  return current;
}

function headLocation(target: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const u = new URL(target);
      const req = https.request(
        {
          method: "HEAD",
          host: u.host,
          path: u.pathname + u.search,
          // Google serves the redirect to simple UAs, a page to browsers.
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
