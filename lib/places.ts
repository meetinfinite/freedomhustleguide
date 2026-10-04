import snapshot from "@/data/places.json";
import { placeKey } from "./gmaps";

/**
 * Venue data for PlaceCards - read ONLY from the committed snapshot in
 * data/places.json. The live site never calls Google.
 *
 * Why: live Places lookups billed ~£178 (Aug 2026) because Vercel can't
 * keep a disk cache, so every page render re-queried Google. The snapshot
 * is captured once, locally, by `scripts/places-snapshot.ts` (see
 * docs/NOTION_CARDS.md), and photos are copied to public/places/.
 *
 * A venue that isn't in the snapshot yet renders as a plain
 * "Open in Google Maps" card until the script is re-run.
 */

export interface PlacePhoto {
  /** Our copy, e.g. /places/<placeId>-1.webp */
  src: string;
  /** Google contributor who took it - shown as the photo credit. */
  author?: string;
  authorUri?: string;
}

export interface PlaceData {
  placeId: string;
  name: string;
  address: string;
  /** Google rating at snapshot time - deliberately never refreshed. */
  rating?: number;
  userRatingCount?: number;
  photos: PlacePhoto[];
  googleMapsUri: string;
  /** ISO date the snapshot was taken. */
  fetchedAt: string;
}

const SNAPSHOT = snapshot as unknown as Record<string, PlaceData>;

export function getPlaceFromUrl(rawUrl: string): PlaceData | null {
  if (!rawUrl) return null;
  return SNAPSHOT[placeKey(rawUrl)] ?? null;
}
