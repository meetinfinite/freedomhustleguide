import Image from "next/image";
import { SwipeMarquee } from "./SwipeMarquee";

const IMAGES = Array.from(
  { length: 12 },
  (_, i) => `/uploads/wfa${i + 1}-web.jpg`
);

export function WorkFromAnywhereStrip() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-electric-600 font-semibold">
          Work from Anywhere
        </p>
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight mt-2">
          Real places. Real work. Both of us.
        </h2>
      </div>

      {/* ~3.5s per photo - a little faster than the old 5s, and swipeable
          (Valeria, 2026-10-23) */}
      <SwipeMarquee secondsPerItem={3.5}>
        {IMAGES.map((src) => (
          <div
            key={src}
            className="relative w-[180px] sm:w-[220px] aspect-[4/5] shrink-0 rounded-2xl overflow-hidden shadow-card"
          >
            <Image
              src={src}
              alt=""
              fill
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
