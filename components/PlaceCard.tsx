"use client";

import { useEffect, useState } from "react";

interface PlaceCardProps {
  url: string;
  /** Override the name pulled from Google. */
  name?: string;
  /** Your personal score (0–10). Shown next to Google's crowd rating. */
  ourRating?: number;
  /** Your own photos (paths or URLs). Lead the carousel, badged "Original". */
  ownPhotos?: string[];
  /** Heading above your bullet points. Defaults to "Why we love it". */
  loveLabel?: string;
  /** Your bullet points — why you like it. */
  lovePoints?: string[];
}

interface CarouselPhoto {
  src: string;
  isOwn: boolean;
}

interface PlaceData {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: number;
  photoNames: string[];
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
  ownPhotos,
  loveLabel,
  lovePoints
}: PlaceCardProps) {
  const [state, setState] = useState<FetchState>({ status: "idle" });
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setState({ status: "loading" });
    setPhotoIdx(0);
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
  }, [url]);

  // ----- Loading skeleton -----
  if (state.status === "loading" || state.status === "idle") {
    return (
      <div className="rounded-3xl overflow-hidden border border-ink-100 bg-white shadow-card my-6 animate-pulse">
        <div className="aspect-[16/9] w-full bg-sand-100" />
        <div className="p-5 space-y-3">
          <div className="h-5 bg-sand-100 rounded w-2/3" />
          <div className="h-3 bg-sand-100 rounded w-1/3" />
          <div className="h-3 bg-sand-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  // ----- No data — clean fallback card -----
  if (state.status !== "ok" || !state.place) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="block rounded-2xl border border-ink-100 bg-white shadow-card p-5 my-5 !no-underline hover:shadow-pop transition"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
              Google Maps
            </p>
            <h4 className="font-display text-lg tracking-tight !mt-0.5 !mb-1 !text-ink-900">
              {nameOverride || "Open in Maps"}
            </h4>
            <p className="text-sm text-ink-500 !my-0 break-all">{url}</p>
            {state.status === "missing" || state.status === "error" ? (
              <p className="text-[11px] text-ink-400 mt-2 !my-0">
                Set <code>GOOGLE_PLACES_API_KEY</code> to auto-fill name,
                rating, and photo.
              </p>
            ) : null}
          </div>
          <span className="!text-electric-600 text-lg shrink-0">↗</span>
        </div>
      </a>
    );
  }

  // ----- Full rich card -----
  const p = state.place;
  const displayName = nameOverride || p.name;
  const ownList = (ownPhotos || []).filter((x) => x && x.trim().length > 0);
  const googleList = p.photoNames || [];
  const photos: CarouselPhoto[] = [
    ...ownList.map((src) => ({ src, isOwn: true })),
    ...googleList.map((name) => ({
      src: `/api/place-photo?name=${encodeURIComponent(name)}&w=1400`,
      isOwn: false
    }))
  ];
  const hasPhotos = photos.length > 0;
  const safeIdx = Math.min(photoIdx, Math.max(0, photos.length - 1));
  const currentPhoto = hasPhotos ? photos[safeIdx] : null;
  const label = loveLabel || "Why we love this place";
  const points = (lovePoints || []).filter((x) => x && x.trim().length > 0);

  return (
    <div className="rounded-3xl overflow-hidden border border-ink-100 bg-white shadow-card my-6">
      {hasPhotos && currentPhoto ? (
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-ink-900 group">
          {/* Blurred fill behind the photo — handles portrait photos in a landscape frame */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPhoto.src}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60 pointer-events-none"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentPhoto.src}
            src={currentPhoto.src}
            alt={`${displayName} — photo ${safeIdx + 1} of ${photos.length}`}
            className="relative w-full h-full object-contain fade-up"
            loading="lazy"
          />

          {/* "Original" badge — only on photos the editor uploaded */}
          {currentPhoto.isOwn ? (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-electric-500/95 backdrop-blur text-[10px] font-bold text-white uppercase tracking-wider shadow-card flex items-center gap-1.5">
              <CameraTick />
              Original
            </div>
          ) : null}

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)
                }
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white grid place-items-center shadow-card opacity-0 group-hover:opacity-100 transition"
              >
                <Chevron dir="left" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setPhotoIdx((i) => (i + 1) % photos.length)
                }
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white grid place-items-center shadow-card opacity-0 group-hover:opacity-100 transition"
              >
                <Chevron dir="right" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-ink-900/50 backdrop-blur">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoIdx(i)}
                    aria-label={`Go to photo ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === safeIdx
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>

              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-ink-900/60 backdrop-blur text-[11px] font-semibold text-white">
                {safeIdx + 1} / {photos.length}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="p-5 sm:p-7 relative">
        {typeof ourRating === "number" ? (
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
            typeof ourRating === "number" ? "pr-20 sm:pr-24" : ""
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

        {points.length > 0 ? (
          <div className="mt-5 rounded-2xl bg-sand-50 p-4 sm:p-5">
            <div className="!text-[11px] !uppercase !tracking-wider !text-electric-600 !font-semibold !my-0 !mb-2">
              {label}
            </div>
            <ul className="!space-y-1 list-none !pl-0 !my-0">
              {points.map((pt, i) => (
                <li
                  key={i}
                  className="!pl-0 before:hidden flex gap-2 items-start !text-sm !text-ink-700 !leading-snug"
                >
                  <span className="!text-electric-600 !font-semibold shrink-0">
                    +
                  </span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
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
        {/* Google's actual star gold — #FBBC04 */}
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

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-5 h-5 text-ink-900"
      aria-hidden
    >
      <path
        d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
