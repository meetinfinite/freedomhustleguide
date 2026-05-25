import Link from "next/link";
import { listGuides } from "@/lib/guides";

interface MoreCitiesProps {
  /** Slug of the guide we're currently on — excluded from the list. */
  currentSlug: string;
  /** How many other cities to show. Default 3. */
  count?: number;
}

/**
 * "Where next?" panel rendered at the bottom of every slug page.
 * Picks up the wrap-around in `listGuides` order so a reader is never a
 * dead-end click away from the next guide.
 */
export function MoreCities({ currentSlug, count = 3 }: MoreCitiesProps) {
  const all = listGuides();
  const currentIdx = all.findIndex((g) => g.slug === currentSlug);
  if (currentIdx === -1) return null;

  // Wrap around — start at the next guide after the current one.
  const next: typeof all = [];
  for (let i = 1; i <= count; i++) {
    next.push(all[(currentIdx + i) % all.length]);
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
          Where next?
        </p>
        <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
          Keep exploring.
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {next.map((g) => {
          const isLive = g.status === "live";
          return (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group relative aspect-[5/4] rounded-3xl shadow-card hover:shadow-pop transition [clip-path:inset(0_round_1.5rem)]"
            >
              {g.cardImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={g.cardImage}
                  alt={`${g.city}, ${g.country}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-ink-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-ink-900/10" />

              {!isLive ? (
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-ink-900/60 backdrop-blur text-sand-200">
                    {g.progressLabel ?? "Coming soon"}
                  </span>
                </div>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex items-center gap-2 text-sand-100/80 text-[11px] uppercase tracking-wider font-semibold mb-1.5">
                  <span className="text-base leading-none">{g.flag}</span>
                  <span>{g.country}</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl tracking-tight text-sand-50 leading-none">
                  {g.city}
                </h3>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-sand-100/90 mt-3 group-hover:translate-x-0.5 transition">
                  {isLive ? "Explore →" : "Take a look →"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
