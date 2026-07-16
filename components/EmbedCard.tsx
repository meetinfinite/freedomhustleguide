"use client";

import { useEffect, useState } from "react";
import type { EmbedData, EmbedKind } from "@/lib/embeds";

interface EmbedCardProps {
  url: string;
  /** Host, when known up front (lets us brand the loading/fallback state). */
  kind?: EmbedKind;
  /** Editor's link text from Notion - used as the title fallback. */
  name?: string;
  /** Heading above the notes list. Defaults to "Good to know". */
  notesLabel?: string;
  /** Editor's bullet notes - why they recommend it. */
  notes?: string[];
  /** Round "Our pick" stamp - set when the editor writes "(our pick)". */
  ourPick?: boolean;
  /** Server-resolved data (NotionRenderer passes this in to skip the fetch). */
  prefetched?: EmbedData;
  /** Drop the card's own vertical margin (when laid out in a grid). */
  bare?: boolean;
}

interface FetchState {
  status: "idle" | "loading" | "ok" | "missing" | "error";
  embed?: EmbedData;
}

const BRAND: Record<
  EmbedKind,
  { label: string; cta: string; accent: string; chip: string; logo: string; logoClass: string }
> = {
  airbnb: {
    label: "Airbnb",
    cta: "View on Airbnb",
    accent: "#FF5A5F",
    chip: "bg-[#FF5A5F]/10 text-[#E0484D]",
    logo: "/uploads/airbnb.png",
    logoClass: "h-5" // wide wordmark
  },
  getyourguide: {
    label: "GetYourGuide",
    cta: "Book on GetYourGuide",
    accent: "#FF5533",
    chip: "bg-[#FF5533]/10 text-[#D8431F]",
    logo: "/uploads/gyg-logo.png",
    logoClass: "h-9" // stacked mark
  },
  booking: {
    label: "Booking.com",
    cta: "View on Booking.com",
    accent: "#003b95",
    chip: "bg-[#003b95]/10 text-[#003b95]",
    logo: "", // no asset - badge falls back to the wordmark text
    logoClass: ""
  }
};

/** Soft dark vignette anchored in the top-left corner - gives the white
 *  logo something to sit on, fading to nothing toward the card centre. */
const CORNER_GRADIENT =
  "radial-gradient(ellipse 55% 65% at top left, rgba(17,24,39,0.62), rgba(17,24,39,0))";

export function EmbedCard({
  url,
  kind,
  name: nameOverride,
  notesLabel,
  notes,
  prefetched,
  bare,
  ourPick
}: EmbedCardProps) {
  const my = bare ? "" : "my-6";
  const [state, setState] = useState<FetchState>(() =>
    prefetched ? { status: "ok", embed: prefetched } : { status: "idle" }
  );

  useEffect(() => {
    if (!url || prefetched) return;
    let cancelled = false;
    setState({ status: "loading" });
    const q = new URLSearchParams({ url });
    if (nameOverride) q.set("title", nameOverride);
    fetch(`/api/embed?${q.toString()}`)
      .then(async (r) => {
        if (cancelled) return;
        if (r.ok) {
          const data = (await r.json()) as { embed: EmbedData };
          setState({ status: "ok", embed: data.embed });
        } else if (r.status === 404) {
          setState({ status: "missing" });
        } else {
          setState({ status: "error" });
        }
      })
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [url, nameOverride, prefetched]);

  const resolvedKind: EmbedKind = state.embed?.kind || kind || "airbnb";
  const brand = BRAND[resolvedKind];
  const points = (notes || []).filter((p) => p && p.trim().length > 0);
  const label = notesLabel || "Good to know";

  // ----- Loading skeleton -----
  if (state.status === "loading" || state.status === "idle") {
    return (
      <div className={`rounded-2xl overflow-hidden border border-ink-100 bg-white shadow-card animate-pulse ${my}`}>
        <div className="aspect-[16/10] w-full bg-sand-100" />
        <div className="p-5 space-y-3">
          <div className="h-5 bg-sand-100 rounded w-2/3" />
          <div className="h-3 bg-sand-100 rounded w-1/3" />
        </div>
      </div>
    );
  }

  const e = state.embed;
  const title = e?.title || nameOverride || brand.cta;
  const href = e?.url || url;
  const hasImage = Boolean(e?.image);

  const NotesBox =
    points.length > 0 ? (
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
              <span className="!text-electric-600 !font-semibold shrink-0">+</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>
    ) : null;


  const PickStamp = ourPick ? (
    <div
      className="absolute top-4 right-4 shrink-0 z-10"
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
        <div className="absolute inset-1.5 rounded-full border border-white/30 pointer-events-none" />
      </div>
    </div>
  ) : null;

  const HostChip = (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${brand.chip}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: brand.accent }}
      />
      {brand.label}
    </span>
  );

  // Badge shown over the photo: the host's white logo on a soft corner
  // gradient (legible over any image).
  const ImageBadge = (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: CORNER_GRADIENT }}
      />
      {brand.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logo}
          alt={brand.label}
          className={`absolute top-3 left-3 w-auto ${brand.logoClass}`}
          style={{ filter: "brightness(0) invert(1)" }}
        />
      ) : (
        <span className="absolute top-3 left-3 text-white font-semibold text-sm tracking-tight">
          {brand.label}
        </span>
      )}
    </>
  );

  const Cta = (
    <a
      href={href}
      target="_blank"
      rel="noreferrer nofollow sponsored"
      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full !text-white text-sm font-semibold transition !no-underline shadow-card hover:brightness-110"
      style={{ backgroundColor: brand.accent }}
    >
      {brand.cta}
      <span aria-hidden>↗</span>
    </a>
  );

  // ----- Rich card (has a photo) -----
  if (hasImage) {
    return (
      <div className={`flex flex-col rounded-2xl overflow-hidden border border-ink-100 bg-white shadow-card ${my}`}>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={e!.image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          {ImageBadge}
          {PickStamp}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h4 className="font-display !text-[18px] sm:!text-[20px] !tracking-tight !mt-0 !mb-1 !text-ink-900 !leading-tight">
            {title}
          </h4>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
            {typeof e?.rating === "number" ? (
              <Stars rating={e.rating} count={e?.reviewCount} />
            ) : null}
            {e?.subtitle ? (
              <span className="!text-[13px] !text-ink-500">{e.subtitle}</span>
            ) : null}
          </div>
          {e?.details || e?.price ? (
            <p className="!text-[12px] !text-ink-500 !mt-1.5 !mb-0">
              {[e?.details, e?.price ? `from ${e.price}` : null]
                .filter(Boolean)
                .join("  ·  ")}
            </p>
          ) : null}
          {NotesBox}
          <div className="mt-auto pt-4">{Cta}</div>
        </div>
      </div>
    );
  }

  // ----- Link card (no photo - GetYourGuide today, or Airbnb fetch miss) -----
  return (
    <div className={`relative rounded-2xl border border-ink-100 bg-white shadow-card p-5 sm:p-6 ${my}`}>
      {PickStamp}
      <div className="mb-2">{HostChip}</div>
      <h4 className="font-display !text-[18px] sm:!text-[20px] !tracking-tight !mt-0 !mb-1 !text-ink-900 !leading-tight">
        {title}
      </h4>
      {e?.subtitle ? (
        <p className="!text-[13px] !text-ink-500 !mt-0 !mb-0">{e.subtitle}</p>
      ) : null}
      {NotesBox}
      <div className="mt-5">{Cta}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      aria-label={`${rating.toFixed(2)} out of 5${count ? `, ${count} reviews` : ""}`}
    >
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} fill={Math.max(0, Math.min(1, rating - (i - 1)))} />
        ))}
      </span>
      <span className="!font-semibold !text-ink-900 !text-[13px] !leading-none">
        {rating.toFixed(2)}
      </span>
      {count ? (
        <span className="!text-[13px] !text-ink-500 !leading-none">
          ({count.toLocaleString()})
        </span>
      ) : null}
    </span>
  );
}

function Star({ fill }: { fill: number }) {
  return (
    <span className="relative inline-block w-[13px] h-[13px]" aria-hidden>
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-0 w-[13px] h-[13px] text-ink-200"
        fill="currentColor"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${fill * 100}%` }}
      >
        <svg viewBox="0 0 24 24" className="w-[13px] h-[13px]" fill="#FF5A5F">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </span>
    </span>
  );
}
