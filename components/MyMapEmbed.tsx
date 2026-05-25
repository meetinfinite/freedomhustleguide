interface MyMapEmbedProps {
  /** The `mid` value from a Google My Maps embed URL. */
  mid: string;
  /** City name — shown in the small caption + the larger-map link label. */
  city: string;
}

/**
 * Responsive Google My Maps embed for the guide dashboard.
 *
 * Renders a single map per city — colour-coded layers for cafés,
 * restaurants, nightlife, etc. Built so the in-use experience is
 * "open guide → see whole city → drill into section content as needed",
 * rather than a separate map per section.
 *
 * Lazy-loads the iframe so it doesn't block the dashboard render.
 */
export function MyMapEmbed({ mid, city }: MyMapEmbedProps) {
  const embedUrl = `https://www.google.com/maps/d/embed?mid=${encodeURIComponent(mid)}&ehbc=2E312F`;
  const viewerUrl = `https://www.google.com/maps/d/viewer?mid=${encodeURIComponent(mid)}`;

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-electric-600 font-semibold mb-1">
            Your {city} map
          </p>
          <h2 className="font-display text-xl tracking-tight !mt-0 !mb-0">
            Cafés, food, bars, gyms — all the picks, on one map.
          </h2>
        </div>
        <a
          href={viewerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-electric-600 hover:text-electric-700 transition shrink-0"
        >
          Open larger →
        </a>
      </div>

      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-card border border-ink-100 bg-sand-100">
        <iframe
          src={embedUrl}
          title={`${city} — interactive map`}
          loading="lazy"
          allow="fullscreen"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 w-full h-full"
        />
      </div>

      <p className="text-xs text-ink-500 mt-3 leading-relaxed">
        Toggle layers (Cafés, Restaurants, Nightlife, etc.) using the menu
        inside the map. Tap a pin to open it in Google Maps.
      </p>
    </section>
  );
}
