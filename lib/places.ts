import snapshot from "@/data/places.json";
import photoPicks from "@/data/place-photo-picks.json";
import placePhotos from "@/data/place-photos.json";
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
  /** Where the credit points - "Google" when absent (snapshot photos). */
  via?: string;
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

/**
 * Photos we choose ourselves (Valeria's own, Unsplash, the venue's own):
 * data/place-photos.json maps the Notion link (as pasted) to a photo we
 * host. It replaces Google's photo when the snapshot has the place, and
 * stands in for Google entirely when it doesn't (photo + credit, Notion
 * name, Open in Maps, Directions - no stars or address).
 */
interface FreePhoto {
  src: string;
  /** Credit line, e.g. the venue's name or the photographer. */
  credit?: string;
  creditUri?: string;
  /** Text after the credit, e.g. "website". Omit for none. */
  via?: string;
}
const FREE = placePhotos as Record<string, FreePhoto>;

export function getPlaceFromUrl(rawUrl: string): PlaceData | null {
  if (!rawUrl) return null;
  const key = placeKey(rawUrl);
  const place = SNAPSHOT[key];
  const free = FREE[key];
  // A photo we chose (Valeria's own, Unsplash, the venue's) beats Google's;
  // Google's name, stars and address still show when we have them.
  if (place && free) return { ...place, photos: [freePhoto(free)] };
  if (place) return withPickedPhoto(place);
  if (!free) return null;
  return {
    placeId: "",
    name: "",
    address: "",
    photos: [freePhoto(free)],
    googleMapsUri: rawUrl,
    fetchedAt: ""
  };
}

function freePhoto(free: FreePhoto): PlacePhoto {
  return {
    src: free.src,
    ...(free.credit ? { author: free.credit } : {}),
    ...(free.creditUri ? { authorUri: free.creditUri } : {}),
    via: free.via ?? ""
  };
}
