"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { CityAreaMap } from "@/lib/areaMaps";

/**
 * Interactive neighbourhood map for "Best Areas to Stay".
 *
 * MapLibre GL + OpenFreeMap vector tiles - free, no API key. Every
 * label is forced to English (name:en) with a Latin transliteration
 * fallback (name:latin), so the basemap reads in English worldwide -
 * verified against Chiang Mai, which the raster options rendered in
 * Thai.
 *
 * cooperativeGestures keeps normal page scrolling (Cmd/two-finger to
 * zoom). Areas are clickable for a one-line take.
 */
export function AreaMap({
  map,
  showIntro = true
}: {
  map: CityAreaMap;
  /**
   * The map's built-in intro caption predates Notion-authored sections.
   * Pages whose prose comes from Notion pass false - Valeria's Notion
   * copy owns all narrative text there (it duplicated on Chiang Mai).
   */
  showIntro?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let instance: import("maplibre-gl").Map | null = null;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (disposed || !containerRef.current) return;

      instance = new maplibregl.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [map.center[1], map.center[0]],
        zoom: map.zoom - 0.4,
        cooperativeGestures: true
      });
      instance.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
      );

      // Force English labels (fall back to Latin transliteration, then
      // whatever the local name is). Re-applied on every styledata event
      // so late-loading style layers get covered too.
      const anglicise = () => {
        if (!instance) return;
        for (const layer of instance.getStyle().layers) {
          if (layer.type !== "symbol") continue;
          if (!instance.getLayoutProperty(layer.id, "text-field")) continue;
          instance.setLayoutProperty(layer.id, "text-field", [
            "coalesce",
            ["get", "name:en"],
            ["get", "name:latin"],
            ["get", "name"]
          ]);
        }
      };
      instance.on("styledata", anglicise);

      instance.on("load", () => {
        if (!instance) return;

        instance.addSource("areas", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: map.areas.map((a) => ({
              type: "Feature" as const,
              properties: {
                name: a.name,
                hint: a.hint ?? "",
                bestFor: a.bestFor ?? "",
                color: a.color,
                avoid: a.avoid ?? false
              },
              geometry: {
                type: "Polygon" as const,
                // GeoJSON wants [lng, lat] and a closed ring
                coordinates: [
                  [...a.polygon, a.polygon[0]].map(([lat, lng]) => [lng, lat])
                ]
              }
            }))
          }
        });

        instance.addLayer({
          id: "areas-fill",
          type: "fill",
          source: "areas",
          paint: {
            "fill-color": ["get", "color"],
            // Avoid-zones stay faint - present but clearly not the point
            "fill-opacity": ["case", ["get", "avoid"], 0.16, 0.35]
          }
        });
        instance.addLayer({
          id: "areas-line",
          type: "line",
          source: "areas",
          filter: ["!=", ["get", "avoid"], true],
          paint: { "line-color": ["get", "color"], "line-width": 2 }
        });
        // line-dasharray can't be data-driven, so avoid-zones get their
        // own dashed outline layer.
        instance.addLayer({
          id: "areas-line-avoid",
          type: "line",
          source: "areas",
          filter: ["==", ["get", "avoid"], true],
          paint: {
            "line-color": ["get", "color"],
            "line-width": 1.5,
            "line-dasharray": [2, 2]
          }
        });

        // One shared popup: follows the cursor on desktop hover, and
        // opens on tap for touch devices (no hover there).
        const popup = new maplibregl.Popup({
          closeButton: false,
          maxWidth: "280px"
        });
        const showCard = (e: maplibregl.MapLayerMouseEvent) => {
          const f = e.features?.[0];
          if (!f || !instance) return;
          const { name, hint, bestFor } = f.properties as {
            name: string;
            hint: string;
            bestFor: string;
          };
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="line-height:1.45">` +
                `<strong style="font-size:13px">${name}</strong>` +
                (hint
                  ? `<br/><em style="color:#5a5346">${hint}</em>`
                  : "") +
                (bestFor
                  ? `<br/><span><strong>Best for:</strong> ${bestFor}</span>`
                  : "") +
                `</div>`
            )
            .addTo(instance);
        };
        instance.on("click", "areas-fill", showCard);
        instance.on("mousemove", "areas-fill", (e) => {
          if (instance) instance.getCanvas().style.cursor = "pointer";
          showCard(e);
        });
        instance.on("mouseleave", "areas-fill", () => {
          if (!instance) return;
          instance.getCanvas().style.cursor = "";
          popup.remove();
        });
      });
    })();

    return () => {
      disposed = true;
      instance?.remove();
    };
  }, [map]);

  return (
    <figure className="my-8">
      {showIntro && map.intro ? (
        <p className="text-ink-700 text-base sm:text-lg leading-relaxed mb-5">
          {map.intro}
        </p>
      ) : null}
      {/* isolate: MapLibre + the legend use high z-indexes internally;
          without a contained stacking context they paint over the
          sticky site header on scroll (mobile bug, 2026-08-05) */}
      <div className="relative isolate z-0 rounded-2xl overflow-hidden border border-ink-100 shadow-card">
        <div ref={containerRef} className="h-[380px] sm:h-[460px] w-full z-0" />

        {/* Legend */}
        <div className="absolute bottom-3 right-3 z-[500] rounded-xl bg-white/95 backdrop-blur border border-ink-100 shadow-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-ink-400 font-semibold mb-2">
            Stay here
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {map.areas
              .filter((a) => !a.avoid)
              .map((a) => (
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
          {map.areas.some((a) => a.avoid) ? (
            <>
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-400 font-semibold mt-3 mb-2">
                Visit, don&apos;t stay
              </p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {map.areas
                  .filter((a) => a.avoid)
                  .map((a) => (
                    <li
                      key={a.name}
                      className="flex items-center gap-2 text-xs text-ink-500"
                    >
                      <span
                        aria-hidden
                        className="w-3 h-3 rounded-sm shrink-0 border border-dashed"
                        style={{ borderColor: a.color, backgroundColor: `${a.color}40` }}
                      />
                      <span>{a.name}</span>
                    </li>
                  ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
      <figcaption className="text-xs text-ink-400 mt-2">
        Tap an area for a quick take. Borders are approximate - real
        neighbourhoods blur into each other.
      </figcaption>
    </figure>
  );
}
