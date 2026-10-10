/**
 * Snapshot Google Places data for every venue card, so the live site
 * never calls Google (see lib/places.ts for why).
 *
 *   npx tsx scripts/places-snapshot.ts            # dry run: what's missing + this month's usage
 *   npx tsx scripts/places-snapshot.ts --commit   # fetch the missing venues
 *
 * For each NEW venue it fetches 1 photo + stars, rating count and address
 * (Arni, 2026-10-11). The name always comes from Notion.
 *
 * Options:
 *   --city <slug>      only this guide (e.g. --city bangkok)
 *   --ratings          top up stars/rating count/address for venues already
 *                      in the snapshot that lack them (keeps their photo)
 *   --photos-only      skip stars/address: the lookup is then free and only
 *                      the photo download counts
 *   --photos <n>       photos per venue (default 1 - cards show one)
 *   --refresh          re-fetch venues already in the snapshot
 *   --prune            drop snapshot entries no longer linked from Notion
 *   --spend-up-to <£>  allow going past Google's free 1,000 a month, up to
 *                      this many pounds at list price. Default £0. Only
 *                      with Arni's explicit OK.
 *
 * MONTHLY COUNTER (data/places-usage.json): every billable Google call is
 * counted BEFORE it is made, per Google billing month. The run stops at
 * 900 of the free 1,000 (a 100 buffer) unless --spend-up-to allows more.
 * The counter is shared through git, so: one person runs at a time, the
 * script refuses --commit unless you're up to date with origin/main, and
 * you commit + push data/places-usage.json straight after the run.
 * Reconcile it with Google's Billing → Reports ("SKUs – this month") now
 * and then - if Google's number is higher, raise ours to match.
 *
 * Reads GOOGLE_PLACES_API_KEY + NOTION_TOKEN from .env.local. Writes
 * data/places.json, data/places-usage.json and public/places/<placeId>-<n>.webp.
 *
 * Only this script talks to Google. Never import it from app code.
 */
import { execSync } from "node:child_process";
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
const flag = (name: string) => args.includes(name);
const value = (name: string) =>
  args.includes(name) ? args[args.indexOf(name) + 1] : null;

const COMMIT = flag("--commit");
const REFRESH = flag("--refresh");
const PRUNE = flag("--prune");
const RATINGS = flag("--ratings");
const PHOTOS_ONLY = flag("--photos-only");
const CITY = value("--city");
const PHOTOS_PER_PLACE = Math.max(1, Number(value("--photos")) || 1);
const SPEND_GBP = Math.max(0, Number(value("--spend-up-to")) || 0);
if (flag("--allow-paid")) {
  throw new Error("--allow-paid is gone - use --spend-up-to <£> (Arni's OK only).");
}

const SNAPSHOT_PATH = path.join(ROOT, "data", "places.json");
const USAGE_PATH = path.join(ROOT, "data", "places-usage.json");
const PHOTO_DIR = path.join(ROOT, "public", "places");
const PHOTO_WIDTH = 1000;
const API = "https://places.googleapis.com/v1";

// rating/userRatingCount make the lookup "Place Details Enterprise"; the
// address and Maps link ride along at no extra cost (one charge per
// lookup, at the highest tier asked for). No displayName: Notion names it.
const ENTERPRISE_FIELDS = "id,formattedAddress,googleMapsUri,rating,userRatingCount";
const DETAIL_FIELDS = PHOTOS_ONLY
  ? "id,photos" // "Place Details Essentials (IDs Only)" - unlimited, free
  : `${ENTERPRISE_FIELDS},photos`;

// Google's free monthly allowance per SKU, and where we stop inside it.
const FREE_PER_MONTH = 1000;
const SAFE_PER_MONTH = 900;
// List price per call in GBP, rounded UP (USD $0.007 / $0.02).
const GBP_EACH = { photos: 0.006, enterprise: 0.017 };

type Sku = "photos" | "enterprise";

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

// ---- monthly counter -------------------------------------------------------

/** Google bills Maps usage by calendar month in US Pacific time. */
function billingMonth(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit"
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value;
  return `${get("year")}-${get("month")}`;
}

class LimitReached extends Error {}

class Usage {
  private file: Record<string, Record<string, unknown>>;
  readonly month = billingMonth();
  constructor() {
    this.file = JSON.parse(fs.readFileSync(USAGE_PATH, "utf8"));
    this.file[this.month] ??= { photos: 0, enterprise: 0 };
  }
  used(sku: Sku): number {
    return Number(this.file[this.month][sku] ?? 0);
  }
  /** Most calls allowed this month: 900 free, or past 1,000 with --spend-up-to. */
  ceiling(sku: Sku): number {
    if (SPEND_GBP <= 0) return SAFE_PER_MONTH;
    return FREE_PER_MONTH + Math.floor(SPEND_GBP / GBP_EACH[sku]);
  }
  left(sku: Sku): number {
    return Math.max(0, this.ceiling(sku) - this.used(sku));
  }
  /** Count a call BEFORE making it (a failed call still counts - safer). */
  take(sku: Sku): void {
    if (this.used(sku) + 1 > this.ceiling(sku)) {
      throw new LimitReached(
        `${sku}: ${this.used(sku)} used this month, limit ${this.ceiling(sku)}`
      );
    }
    this.file[this.month][sku] = this.used(sku) + 1;
    fs.writeFileSync(USAGE_PATH, JSON.stringify(this.file, null, 2) + "\n");
  }
  summary(): string {
    return (["photos", "enterprise"] as Sku[])
      .map((k) => `${k} ${this.used(k)}/${FREE_PER_MONTH} free`)
      .join(" · ");
  }
}

/** --commit only from an up-to-date main, so the shared counter is current. */
function assertUpToDate() {
  try {
    execSync("git fetch -q origin main", { cwd: ROOT, stdio: "ignore" });
    execSync("git merge-base --is-ancestor origin/main HEAD", {
      cwd: ROOT,
      stdio: "ignore"
    });
  } catch {
    throw new Error(
      "Not up to date with origin/main - run `git pull` first so the usage counter (data/places-usage.json) is current."
    );
  }
}

async function main() {
  const { listGuides } = await import("../lib/guides");
  const { fetchSectionPage } = await import("../lib/notion");
  const { GMAPS_HOST_RE, placeKey } = await import("../lib/gmaps");

  const snapshot: Record<string, PlaceData> = JSON.parse(
    await fsp.readFile(SNAPSHOT_PATH, "utf8")
  );
  const usage = new Usage();

  // 1. Every venue link the site renders (same rule as lib/notion.ts).
  const guides = listGuides().filter((g) => !CITY || g.slug === CITY);
  const linked = new Map<string, string>(); // key → url as pasted
  const linkedName = new Map<string, string>(); // key → bold name in Notion
  for (const g of guides) {
    let n = 0;
    for (const s of g.sections) {
      if (!s.notionPageId) continue;
      const page = await fetchSectionPage(s.notionPageId);
      for (const b of page?.blocks ?? []) {
        if (b.type !== "bulleted_list_item") continue;
        const first = (
          b.data as {
            rich_text?: {
              href?: string | null;
              plain_text?: string;
              annotations?: { bold?: boolean };
            }[];
          }
        )?.rich_text?.[0];
        if (!first?.annotations?.bold || !first.href) continue;
        if (!GMAPS_HOST_RE.test(first.href)) continue;
        linked.set(placeKey(first.href), first.href);
        if (first.plain_text) linkedName.set(placeKey(first.href), first.plain_text.trim());
        n++;
      }
    }
    if (n) console.log(`${g.slug}: ${n} venue links`);
  }

  // 2. What this run would do, and what it would cost.
  const todo = [...linked.entries()].filter(([key]) => REFRESH || !snapshot[key]);
  // --ratings: venues we already have but without stars/address. Distinct
  // places only - several Notion links can share one.
  const ratingIds = new Set<string>();
  if (RATINGS) {
    for (const [k] of linked) {
      const p = snapshot[k];
      if (p?.placeId && !p.address) ratingIds.add(p.placeId);
    }
  }
  const need: Record<Sku, number> = {
    photos: todo.length * PHOTOS_PER_PLACE,
    enterprise: (PHOTOS_ONLY ? 0 : todo.length) + ratingIds.size
  };
  console.log(
    `\n${linked.size} distinct venues · ${linked.size - todo.length} already in snapshot · ${todo.length} new` +
      (RATINGS ? ` · ${ratingIds.size} to top up with stars/address` : "")
  );
  console.log(`This month (${usage.month}) so far: ${usage.summary()}`);
  console.log(
    `This run: up to ${need.photos} photo downloads + ${need.enterprise} star/address lookups`
  );

  const over = (["photos", "enterprise"] as Sku[]).filter(
    (k) => need[k] > usage.left(k)
  );
  if (over.length) {
    for (const k of over) {
      console.log(
        `\nStopping: ${k} would reach ${usage.used(k) + need[k]}, past this month's limit of ${usage.ceiling(k)}.`
      );
    }
    console.log(
      "Options: --city to do one guide at a time, wait until next month, or (Arni's OK only) --spend-up-to <£>."
    );
    return;
  }
  const extra = (["photos", "enterprise"] as Sku[]).reduce(
    (sum, k) =>
      sum +
      Math.max(0, usage.used(k) + need[k] - FREE_PER_MONTH) * GBP_EACH[k],
    0
  );
  console.log(
    extra > 0
      ? `Estimated cost: up to £${extra.toFixed(2)} (allowed by --spend-up-to £${SPEND_GBP}).`
      : "Estimated cost: £0 - inside Google's free monthly allowance."
  );

  const stale = CITY ? [] : Object.keys(snapshot).filter((k) => !linked.has(k));
  if (stale.length) {
    console.log(
      `${stale.length} snapshot entries no longer linked from Notion${PRUNE ? " - pruning" : " (run with --prune to drop)"}`
    );
  }

  if (!COMMIT) {
    for (const [, url] of todo.slice(0, 20)) console.log("  would fetch", url);
    if (todo.length > 20) console.log(`  …and ${todo.length - 20} more`);
    console.log("\nDry run - nothing fetched, nothing counted. Re-run with --commit.");
    return;
  }

  assertUpToDate();
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY missing from .env.local");
  await fsp.mkdir(PHOTO_DIR, { recursive: true });

  // 3. Fetch. Several Notion links can point at one place - reuse it.
  const byPlaceId = new Map<string, PlaceData>();
  for (const p of Object.values(snapshot)) byPlaceId.set(p.placeId, p);
  const failed: string[] = [];
  let stopped: string | null = null;
  let done = 0;
  const queue = todo.slice();
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (queue.length && !stopped) {
        const [k, url] = queue.shift()!;
        try {
          const placeId = await resolvePlaceId(url, key);
          if (!placeId) throw new Error("no place found");
          let data = !REFRESH ? byPlaceId.get(placeId) : undefined;
          if (!data) {
            data = await fetchPlace(placeId, key, usage, linkedName.get(k));
            byPlaceId.set(placeId, data);
          }
          snapshot[k] = data;
        } catch (err) {
          if (err instanceof LimitReached) stopped = err.message;
          else failed.push(`${url}  (${err instanceof Error ? err.message : err})`);
        }
        done++;
        if (done % 25 === 0) {
          console.log(`  ${done}/${todo.length}`);
          await save(snapshot); // checkpoint so a crash doesn't waste calls
        }
      }
    })
  );

  // 4. --ratings: top up stars/address on places we already have.
  let toppedUp = 0;
  for (const placeId of ratingIds) {
    if (stopped) break;
    try {
      const extraData = await fetchRatings(placeId, key, usage);
      for (const p of Object.values(snapshot)) {
        if (p.placeId !== placeId) continue;
        if (!p.address) p.address = extraData.address;
        if (typeof extraData.rating === "number") p.rating = extraData.rating;
        if (extraData.userRatingCount) p.userRatingCount = extraData.userRatingCount;
      }
      toppedUp++;
    } catch (err) {
      if (err instanceof LimitReached) stopped = err.message;
      else failed.push(`${placeId}  (${err instanceof Error ? err.message : err})`);
    }
  }

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
    `\nDone: ${done - failed.length} new fetched, ${toppedUp} topped up, ${failed.length} failed.`
  );
  if (stopped) console.log(`STOPPED at the monthly limit - ${stopped}.`);
  console.log(`This month (${usage.month}) now: ${usage.summary()}`);
  console.log(
    "Commit + push data/places-usage.json (and the snapshot/photos) now, so the next run sees this month's count."
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

async function fetchPlace(
  placeId: string,
  key: string,
  usage: Usage,
  notionName?: string
): Promise<PlaceData> {
  if (!PHOTOS_ONLY) usage.take("enterprise");
  const res = await fetch(`${API}/places/${encodeURIComponent(placeId)}`, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": DETAIL_FIELDS }
  });
  if (!res.ok) throw new Error(`details ${res.status}: ${(await res.text()).slice(0, 120)}`);
  const p = (await res.json()) as {
    id: string;
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
    usage.take("photos");
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
    name: notionName || "Unknown place",
    address: p.formattedAddress || "",
    ...(typeof p.rating === "number" ? { rating: p.rating } : {}),
    ...(p.userRatingCount ? { userRatingCount: p.userRatingCount } : {}),
    photos,
    googleMapsUri:
      p.googleMapsUri ||
      // Google's documented Maps URL: opens this exact place
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        notionName || p.id
      )}&query_place_id=${p.id}`,
    fetchedAt: new Date().toISOString().slice(0, 10)
  };
}

/** Stars, rating count and address for a place we already have (no photo). */
async function fetchRatings(
  placeId: string,
  key: string,
  usage: Usage
): Promise<{ address: string; rating?: number; userRatingCount?: number }> {
  usage.take("enterprise");
  const res = await fetch(`${API}/places/${encodeURIComponent(placeId)}`, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": ENTERPRISE_FIELDS }
  });
  if (!res.ok) throw new Error(`details ${res.status}: ${(await res.text()).slice(0, 120)}`);
  const p = (await res.json()) as {
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
  };
  return {
    address: p.formattedAddress || "",
    rating: p.rating,
    userRatingCount: p.userRatingCount
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
