import Image from "next/image";

export type FoundersStripImage = { src: string; alt: string };

/**
 * Auto-scrolling strip of the founders' own photos in one city - the
 * visual proof behind the trust cards. Same marquee treatment as the
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

  // Duplicate so the -50% translate loops seamlessly
  const doubled = [...images, ...images];

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

      <div className="relative overflow-hidden marquee-mask">
        <div className="flex gap-4 w-max animate-marquee">
          {doubled.map((img, i) => (
            <div
              key={i}
              className="relative w-[180px] sm:w-[220px] aspect-[4/5] shrink-0 rounded-2xl overflow-hidden shadow-card"
            >
              <Image
                src={img.src}
                alt={i < images.length ? img.alt : ""}
                fill
                sizes="(min-width: 640px) 220px, 180px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
