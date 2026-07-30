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
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-electric-600 font-semibold">
          Discover the best of {city}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight mt-2">
          Straight from our camera roll.
        </h2>
        <p className="text-ink-600 mt-3 max-w-xl mx-auto leading-relaxed">
          The best of what you see here is pinned inside the guide - ready
          for you to experience yourself.
        </p>
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
