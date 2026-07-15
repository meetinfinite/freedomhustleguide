"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { CityAreaMap } from "@/lib/areaMaps";

/**
 * Interactive neighbourhood map for "Best Areas to Stay".
 *
 * Real OpenStreetMap basemap with brand-coloured area polygons and a
 * legend. Scroll-wheel zoom stays off so the page keeps scrolling
 * normally; pinch/double-click zoom still work.
 *
 * Leaflet is loaded inside useEffect (dynamic import) because it
 * touches `window` and can't run during server rendering.
 */
export function AreaMap({ map }: { map: CityAreaMap }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let instance: import("leaflet").Map | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !containerRef.current) return;

      instance = L.map(containerRef.current, {
        center: map.center,
        zoom: map.zoom,
        scrollWheelZoom: false,
        attributionControl: true
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(instance);

      for (const area of map.areas) {
        const poly = L.polygon(area.polygon, {
          color: area.color,
          weight: 2,
          fillColor: area.color,
          fillOpacity: 0.35
        }).addTo(instance);
        poly.bindTooltip(
          `<strong>${area.name}</strong>${area.hint ? `<br/>${area.hint}` : ""}`,
          { sticky: true }
        );
      }
    })();

    return () => {
      disposed = true;
      instance?.remove();
    };
  }, [map]);

  return (
    <figure className="my-8">
      <div className="relative rounded-2xl overflow-hidden border border-ink-100 shadow-card">
        <div ref={containerRef} className="h-[380px] sm:h-[460px] w-full z-0" />

        {/* Legend */}
        <div className="absolute bottom-3 right-3 z-[500] rounded-xl bg-white/95 backdrop-blur border border-ink-100 shadow-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-ink-400 font-semibold mb-2">
            Areas
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {map.areas.map((a) => (
              <li key={a.name} className="flex items-center gap-2 text-xs text-ink-800">
                <span
                  aria-hidden
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: a.color }}
                />
                <span>{a.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="text-xs text-ink-400 mt-2">
        Tap an area for a quick take. Borders are approximate - real
        neighbourhoods blur into each other.
      </figcaption>
    </figure>
  );
}
