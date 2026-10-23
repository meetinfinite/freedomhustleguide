import Image from "next/image";
import { SwipeMarquee } from "./SwipeMarquee";

export type FoundersStripImage = { src: string; alt: string };

/**
 * Auto-scrolling strip of the founders' own photos in one city - the
 * visual proof behind the trust cards. Same swipeable marquee as the
 * homepage WorkFromAnywhereStrip, but per-guide.
 */
export function FoundersCityStrip({
  city,
  images
}: {
  city: string;
  images: FoundersStripImage[];
}) {
  if (!images.length) return null;

  return (
    <section className="pt-12 pb-4 sm:pt-16 sm:pb-6">
      {/* Left-aligned to match the "What's inside" heading below it */}
      <div className="max-w-6xl mx-auto px-6 mb-6 sm:mb-8">
        {/* Same size and style as the "Everything we wish we knew..."
            heading below, so the page reads as one system */}
        <h2 className="font-display text-4xl sm:text-5xl tracking-tight">
          Discover the best of {city}.
        </h2>
      </div>

      {/* ~2.5s per photo (a bit faster again, Valeria 2026-10-23), the
          same speed whatever the number of photos - and swipeable */}
      <SwipeMarquee secondsPerItem={2.5}>
        {images.map((img) => (
          <div
            key={img.src}
            className="relative w-[180px] sm:w-[220px] aspect-[4/5] shrink-0 rounded-2xl overflow-hidden shadow-card bg-sand-100"
          >
            {/* Photos are pre-sized for the strip (440x550 WebP, ~40 KB
                in public/uploads/strip), so skip on-the-fly resizing and
                load them straight away - lazy loading left blank tiles
                as the marquee scrolled them into view (Valeria,
                2026-10-11). The second copy reuses the same files. */}
            <Image
              src={img.src}
              alt={img.alt}
              fill
              unoptimized
              loading="eager"
              draggable={false}
              sizes="(min-width: 640px) 220px, 180px"
              className="object-cover"
            />
          </div>
        ))}
      </SwipeMarquee>
    </section>
  );
}
