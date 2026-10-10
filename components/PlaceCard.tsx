"use client";

import { useEffect, useState } from "react";
import type { PlaceData as ServerPlaceData } from "@/lib/places";

interface PlaceCardProps {
  url: string;
  /** Override the name pulled from Google. */
  name?: string;
  /** Your personal score (0–10). Shown next to Google's crowd rating. */
  ourRating?: number;
  /**
   * Render a round "Our pick" stamp where the score normally sits.
   * Use when you want to flag a recommended venue without scoring it
   * (e.g. the team writes "(our pick)" in Notion).
   */
  ourPick?: boolean;
  /** Your own photos (paths or URLs). Lead the carousel, badged "Original". */
  ownPhotos?: string[];
  /** Heading above your bullet points. Defaults to "Why we love it". */
  loveLabel?: string;
  /** Your bullet points - why you like it. */
  lovePoints?: string[];
  /**
   * Pre-resolved place data from the server (NotionRenderer passes
   * this in). When set, the component skips its own /api/place fetch
   * and renders directly - much faster when many cards share a page.
   */
  prefetched?: ServerPlaceData;
  /** Drop the card's own vertical margin + use a grid-friendly image
   *  aspect (when laid out two-up in a grid). */
  bare?: boolean;
}

interface CardPhoto {
  src: string;
  isOwn: boolean;
  /** Google contributor credit for copied Google photos. */
  author?: string;
  authorUri?: string;
}

interface PlaceData {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  photos: { src: string; author?: string; authorUri?: string }[];
  googleMapsUri: string;
}

interface FetchState {
  status: "idle" | "loading" | "ok" | "missing" | "error";
  place?: PlaceData;
}

export function PlaceCard({
  url,
  name: nameOverride,
  ourRating,
  ourPick,
  ownPhotos,
  lovePoints,
  prefetched,
  bare
}: PlaceCardProps) {
  const my = bare ? "" : "my-6";
  const imgAspect = bare
    ? "aspect-[16/10]"
    : "aspect-[16/9] sm:aspect-[21/9]";
  // If place data was resolved server-side, start in "ok" with the
  // data baked in - no client fetch, no loading flash, no API round-
  // trip. Falls through to the client fetch only when prefetched is
  // not supplied (legacy MDX content path).
  const [state, setState] = useState<FetchState>(() =>
    prefetched
      ? { status: "ok", place: prefetched as PlaceData }
      : { status: "idle" }
  );
  useEffect(() => {
    if (!url) return;
    // Already prefetched - nothing to do
    if (prefetched) return;
    let cancelled = false;
    setState({ status: "loading" });
    fetch(`/api/place?url=${encodeURIComponent(url)}`)
      .then(async (r) => {
        if (cancelled) return;
        if (r.ok) {
          const data = (await r.json()) as { place: PlaceData };
          setState({ status: "ok", place: data.place });
        } else if (r.status === 404) {
          setState({ status: "missing" });
        } else {
          setState({ status: "error" });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [url, prefetched]);

  // ----- Loading skeleton -----
  if (state.status === "loading" || state.status === "idle") {
    return (
      <div className={`rounded-3xl overflow-hidden border border-ink-100 bg-white shadow-card animate-pulse ${my}`}>
        <div className={`${imgAspect} w-full bg-sand-100`} />
        <div className="p-5 space-y-3">
          <div className="h-5 bg-sand-100 rounded w-2/3" />
          <div className="h-3 bg-sand-100 rounded w-1/3" />
          <div className="h-3 bg-sand-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  // ----- No data - clean fallback card -----
  // Venues not yet in data/places.json land here. The editor's notes
  // still show - they're the actual recommendation, photo or not.
  if (state.status !== "ok" || !state.place) {
    const notes = (lovePoints || []).filter((x) => x && x.trim().length > 0);
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={`block rounded-2xl border border-ink-100 bg-white shadow-card p-5 !no-underline hover:shadow-pop transition ${my}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold !my-0">
              {ourPick ? (
                <span className="text-electric-600">Our pick · </span>
              ) : null}
              Google Maps
            </p>
            <h4 className="font-display text-lg tracking-tight !mt-0.5 !mb-1 !text-ink-900">
              {nameOverride || "Open in Maps"}
            </h4>
            {notes.map((pt, i) => (
              <p
                key={i}
                className="!text-sm !text-ink-700 !leading-snug !mt-2 !mb-0"
              >
                {pt}
              </p>
            ))}
            <p className="text-sm text-ink-500 !mt-3 !mb-0">Open in Google Maps</p>
          </div>
          <span className="!text-electric-600 text-lg shrink-0">↗</span>
        </div>
      </a>
    );
  }

  // ----- Full rich card -----
  const p = state.place;
  const displayName = nameOverride || p.name;
  const photo = pickPhoto(p, ownPhotos);
  // One photo per card (Valeria, 2026-10-10) - no carousel. The editor's
  // notes aren't shown on a full card either: photo, name, rating,
  // address and the two buttons say enough.

  return (
    <div className={`rounded-3xl overflow-hidden border border-ink-100 bg-white shadow-card ${my}`}>
      {photo ? (
        <div className={`relative ${imgAspect} w-full overflow-hidden bg-ink-900`}>
          {/* Blurred fill behind the photo - handles portrait photos in a landscape frame */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60 pointer-events-none"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            alt={displayName}
            className="relative w-full h-full object-contain fade-up"
            loading="lazy"
          />

          {/* Photographer credit on copied Google photos */}
          {!photo.isOwn && photo.author ? (
            <div className="absolute top-3 left-3 max-w-[70%] truncate px-2 py-0.5 rounded-full bg-ink-900/55 backdrop-blur text-[10px] text-white/90">
              Photo:{" "}
              {photo.authorUri ? (
                <a
                  href={photo.authorUri}
                  target="_blank"
                  rel="noreferrer"
                  className="!text-white/90 !no-underline hover:!underline"
                >
                  {photo.author}
                </a>
              ) : (
                photo.author
              )}{" "}
              · Google
            </div>
          ) : null}

          {/* "Original" badge - only on photos the editor uploaded */}
          {photo.isOwn ? (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-electric-500/95 backdrop-blur text-[10px] font-bold text-white uppercase tracking-wider shadow-card flex items-center gap-1.5">
              <CameraTick />
              Original
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="p-5 sm:p-7 relative">
        {ourPick ? (
          <div
            className="absolute top-4 sm:top-5 right-4 sm:right-5 shrink-0"
            aria-label="Our pick"
          >
            <div
              className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-electric-500 text-white flex items-center justify-center text-center font-display tracking-tight shadow-card rotate-[-8deg]"
              style={{ lineHeight: 1.05 }}
            >
              <div>
                <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] font-semibold opacity-90">
                  Our
                </div>
                <div className="!text-[18px] sm:!text-[22px] font-semibold !leading-none mt-0.5">
                  Pick
                </div>
              </div>
              {/* Subtle stitched-stamp ring */}
              <div className="absolute inset-1.5 rounded-full border border-white/30 pointer-events-none" />
            </div>
          </div>
        ) : typeof ourRating === "number" ? (
          <div className="absolute top-5 sm:top-7 right-5 sm:right-7 text-right shrink-0">
            <div className="!text-[10px] uppercase !tracking-wider !text-electric-600 !font-semibold !my-0">
              Our score
            </div>
            <div className="font-display !text-3xl !text-electric-600 !leading-none mt-0.5">
              {ourRating.toFixed(1)}
              <span className="!text-base !text-ink-400 !font-normal">/10</span>
            </div>
          </div>
        ) : null}

        <h4
          className={`font-display !text-[20px] sm:!text-[24px] !tracking-tight !mt-0 !mb-0 !text-ink-900 !leading-tight ${
            ourPick || typeof ourRating === "number" ? "pr-20 sm:pr-24" : ""
          }`}
        >
          {displayName}
        </h4>

        {typeof p.rating === "number" ? (
          <div className="flex items-center flex-wrap gap-2 mt-[10px] mb-3">
            <GoogleG />
            <Stars rating={p.rating} />
            <span className="!font-semibold !text-ink-900 !text-[14px] !leading-none">
              {p.rating.toFixed(1)}
            </span>
            {p.userRatingCount ? (
              <span className="!text-[14px] !text-ink-500 !leading-none">
                ({formatCount(p.userRatingCount)} reviews)
              </span>
            ) : null}
          </div>
        ) : null}

        {p.address ? (
          <p className="!text-[12px] !text-ink-400 !my-0 !leading-snug flex items-center gap-1.5">
            <Pin />
            <span>{p.address}</span>
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(displayName)}&destination_place_id=${encodeURIComponent(p.placeId)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-electric-500 !text-white text-sm font-semibold hover:bg-electric-600 transition !no-underline shadow-card"
          >
            <DirectionsIcon />
            Directions
          </a>
          <a
            href={p.googleMapsUri}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-ink-200 !text-ink-800 text-sm font-semibold hover:border-ink-400 hover:bg-sand-50 transition !no-underline"
          >
            Open in Maps
            <span aria-hidden className="text-ink-400">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <FractionalStar key={i} fill={Math.max(0, Math.min(1, rating - (i - 1)))} />
      ))}
    </div>
  );
}

function FractionalStar({ fill }: { fill: number }) {
  return (
    <div className="relative w-[14px] h-[14px]" aria-hidden>
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-0 w-[14px] h-[14px] text-ink-200"
        fill="currentColor"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${fill * 100}%` }}
      >
        {/* Google's actual star gold - #FBBC04 */}
        <svg
          viewBox="0 0 24 24"
          className="w-[14px] h-[14px]"
          fill="#FBBC04"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    </div>
  );
}

/** Official Google G logo, simplified. Used as the rating attribution. */
function GoogleG() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="w-3.5 h-3.5 shrink-0"
      aria-label="Google rating"
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

function Pin() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-3 h-3 shrink-0 text-ink-300"
      aria-hidden
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
    </svg>
  );
}

function CameraTick() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-3 h-3"
      aria-hidden
    >
      <path d="M9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9zm3 15a5 5 0 110-10 5 5 0 010 10zm-1.41-3.59L8.41 11.24l-1.41 1.41L10.59 16l5.66-5.66-1.41-1.41-4.24 4.24z" />
    </svg>
  );
}

function DirectionsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4 -ml-0.5"
      aria-hidden
    >
      <path d="M21.71 11.29l-9-9a1 1 0 00-1.42 0l-9 9a1 1 0 000 1.42l9 9a1 1 0 001.42 0l9-9a1 1 0 000-1.42zM14 14.5V12h-4v3H8v-4a1 1 0 011-1h5V7.5l3.5 3.5z" />
    </svg>
  );
}

/**
 * The one photo a card shows: the editor's own photo, else the first
 * snapshot photo (lib/places.ts puts any hand-picked photo first).
 */
function pickPhoto(p: PlaceData, ownPhotos?: string[]): CardPhoto | null {
  const own = (ownPhotos || []).find((x) => x && x.trim().length > 0);
  if (own) return { src: own, isOwn: true };
  const first = (p.photos || [])[0];
  return first ? { ...first, isOwn: false } : null;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
