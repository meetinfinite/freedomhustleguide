"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { CityAreaMap } from "@/lib/areaMaps";

/**
 * Interactive neighbourhood map for "Best Areas to Stay".
 *
 * Preferred engine: Google Maps JS API with `language=en` - an
 * English-labelled, familiar basemap (matches the reference maps the
 * team likes). Used whenever NEXT_PUBLIC_GOOGLE_MAPS_KEY is set.
 *
 * Fallback engine: Leaflet + OpenStreetMap (no key needed) so the map
 * still renders before the key exists / if Google fails to load. OSM
 * labels are in the local language, which is why Google is preferred.
 */

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

/** Load the Google Maps JS API once, in English. */
function loadGoogleMaps(key: string): Promise<void> {
  const w = window as any;
  if (w.google?.maps) return Promise.resolve();
  const existing = document.getElementById(
    "gmaps-js"
  ) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve());
      if (w.google?.maps) resolve();
    });
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.id = "gmaps-js";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&language=en&loading=async`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(s);
  });
}

export function AreaMap({ map }: { map: CityAreaMap }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let leafletMap: import("leaflet").Map | null = null;

    async function initGoogle(key: string) {
      await loadGoogleMaps(key);
      if (disposed || !containerRef.current) return;
      const g = (window as any).google;

      const gmap = new g.maps.Map(containerRef.current, {
        center: { lat: map.center[0], lng: map.center[1] },
        zoom: map.zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: "cooperative",
        clickableIcons: false
      });

      const info = new g.maps.InfoWindow();
      for (const area of map.areas) {
        const poly = new g.maps.Polygon({
          paths: area.polygon.map(([lat, lng]) => ({ lat, lng })),
          strokeColor: area.color,
          strokeWeight: 2,
          strokeOpacity: 0.9,
          fillColor: area.color,
          fillOpacity: 0.35,
          map: gmap
        });
        poly.addListener("click", (e: any) => {
          info.setContent(
            `<div><strong>${area.name}</strong>${
              area.hint ? `<br/>${area.hint}` : ""
            }</div>`
          );
          info.setPosition(e.latLng);
          info.open(gmap);
        });
      }
    }

    async function initLeaflet() {
      const L = (await import("leaflet")).default;
      if (disposed || !containerRef.current) return;

      leafletMap = L.map(containerRef.current, {
        center: map.center,
        zoom: map.zoom,
        scrollWheelZoom: false,
        attributionControl: true
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap);

      for (const area of map.areas) {
        const poly = L.polygon(area.polygon, {
          color: area.color,
          weight: 2,
          fillColor: area.color,
          fillOpacity: 0.35
        }).addTo(leafletMap);
        poly.bindTooltip(
          `<strong>${area.name}</strong>${area.hint ? `<br/>${area.hint}` : ""}`,
          { sticky: true }
        );
      }
    }

    if (GOOGLE_KEY) {
      initGoogle(GOOGLE_KEY).catch(() => {
        // Key missing scopes / blocked referrer - keep the section usable.
        if (!disposed) initLeaflet();
      });
    } else {
      initLeaflet();
    }

    return () => {
      disposed = true;
      leafletMap?.remove();
      // Google Maps has no destroy API; unmounting the DOM node is enough.
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
              <li
                key={a.name}
                className="flex items-center gap-2 text-xs text-ink-800"
              >
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
