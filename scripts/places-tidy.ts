/**
 * Keep ONE photo per venue and delete the rest - free, no Google calls.
 *
 *   npx tsx scripts/places-tidy.ts            # dry run: what it would delete
 *   npx tsx scripts/places-tidy.ts --commit   # do it
 *
 * Cards (web + app) only ever show the first photo. For each venue in
 * data/places.json it keeps the photo chosen in data/place-photo-picks.json
 * (place id → index), or the first one, makes it the venue's only photo,
 * clears the now-redundant number picks, and deletes every file in
 * public/places/ that no venue uses. Run it after picking people-free
 * photos (step 7 in docs/NOTION_CARDS.md) so spare candidates don't bloat
 * every Vercel deployment.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const SNAPSHOT_PATH = path.join(ROOT, "data", "places.json");
const PICKS_PATH = path.join(ROOT, "data", "place-photo-picks.json");
const PHOTO_DIR = path.join(ROOT, "public", "places");
const COMMIT = process.argv.includes("--commit");

interface PlacePhoto {
  src: string;
  author?: string;
  authorUri?: string;
}
type Snapshot = Record<string, { placeId: string; photos: PlacePhoto[] }>;

const snapshot: Snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
const picks: Record<string, number | string> = JSON.parse(
  fs.readFileSync(PICKS_PATH, "utf8")
);

let trimmed = 0;
for (const place of Object.values(snapshot)) {
  const pick = picks[place.placeId];
  const idx = typeof pick === "number" && place.photos[pick] ? pick : 0;
  if (place.photos.length > 1 || idx !== 0) {
    place.photos = place.photos[idx] ? [place.photos[idx]] : [];
    trimmed++;
  }
}
// Number picks are now baked in; keep any hosted-image (string) picks.
const keptPicks = Object.fromEntries(
  Object.entries(picks).filter(([, v]) => typeof v === "string")
);

const used = new Set(
  Object.values(snapshot).flatMap((p) => p.photos.map((ph) => path.basename(ph.src)))
);
const unused = fs.readdirSync(PHOTO_DIR).filter((f) => !used.has(f));
const mb =
  unused.reduce((sum, f) => sum + fs.statSync(path.join(PHOTO_DIR, f)).size, 0) / 1e6;

console.log(
  `${trimmed} venues trimmed to one photo · ${unused.length} unused files (${mb.toFixed(1)} MB) to delete`
);
if (!COMMIT) {
  console.log("Dry run - nothing changed. Re-run with --commit.");
} else {
  for (const f of unused) fs.unlinkSync(path.join(PHOTO_DIR, f));
  const sorted = Object.fromEntries(
    Object.entries(snapshot).sort(([a], [b]) => a.localeCompare(b))
  );
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(sorted, null, 2) + "\n");
  fs.writeFileSync(PICKS_PATH, JSON.stringify(keptPicks, null, 2) + "\n");
  console.log("Done. Commit data/places.json, data/place-photo-picks.json and public/places/.");
}
