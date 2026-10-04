/**
 * Google Maps link helpers shared by the Notion fetcher, the renderer
 * (client) and scripts/places-snapshot.ts. Kept dependency-free so the
 * client bundle doesn't pull in the place snapshot.
 */

/** Links the team pastes for venues. A bold bullet starting with one of
 *  these becomes a PlaceCard. */
export const GMAPS_HOST_RE =
  /^https?:\/\/(www\.)?(google\.[^/]+\/maps|maps\.google\.[^/]+|maps\.app\.goo\.gl|goo\.gl\/maps|share\.google)/i;

/** Snapshot key for a Maps link - the link exactly as pasted in Notion. */
export function placeKey(url: string): string {
  return url.trim().toLowerCase();
}
