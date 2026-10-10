import snapshot from "@/data/places.json";
import photoPicks from "@/data/place-photo-picks.json";
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

const PICKS = photoPicks as Record<string, number | string>;

/**
 * Cards show one photo - the first in the list (Valeria, 2026-10-10).
 * data/place-photo-picks.json, keyed by Google place id, chooses it:
 * a number picks which snapshot photo leads, a string is a hosted image
 * path (e.g. /uploads/places/...) that replaces the Google photos.
 */
function withPickedPhoto(place: PlaceData): PlaceData {
  const pick = PICKS[place.placeId];
  if (typeof pick === "string") return { ...place, photos: [{ src: pick }] };
  if (typeof pick === "number" && place.photos?.[pick]) {
    const chosen = place.photos[pick];
    return {
      ...place,
      photos: [chosen, ...place.photos.filter((_, i) => i !== pick)]
    };
  }
  return place;
}

export function getPlaceFromUrl(rawUrl: string): PlaceData | null {
  if (!rawUrl) return null;
  const place = SNAPSHOT[placeKey(rawUrl)];
  return place ? withPickedPhoto(place) : null;
}
