"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { AreaDef, CityAreaMap } from "@/lib/areaMaps";

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
 * zoom).
 *
 * The areas are listed as tappable colour chips under the map, with the
 * selected area's take in a card below them - a hover popup was
 * unreadable on phones (Valeria, 2026-10-10). Tapping an area on the map
 * selects it too, and the map zooms to whichever area you pick.
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
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const loadedRef = useRef(false);
  const stayAreas = map.areas.filter((a) => !a.avoid);
  const avoidAreas = map.areas.filter((a) => a.avoid);
  const [selected, setSelected] = useState<string>(
    stayAreas[0]?.name ?? map.areas[0]?.name ?? ""
  );
  const selectedArea = map.areas.find((a) => a.name === selected);
  // Latest selection, readable inside the map's load handler
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

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
      mapRef.current = instance;
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
            "fill-opacity": fillOpacity(selectedRef.current)
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
        // Thick outline on the selected area
        instance.addLayer({
          id: "areas-selected",
          type: "line",
          source: "areas",
          filter: ["==", ["get", "name"], selectedRef.current],
          paint: { "line-color": ["get", "color"], "line-width": 4 }
        });

        instance.on("click", "areas-fill", (e) => {
          const name = e.features?.[0]?.properties?.name as string | undefined;
          if (name) setSelected(name);
        });
        instance.on("mouseenter", "areas-fill", () => {
          if (instance) instance.getCanvas().style.cursor = "pointer";
        });
        instance.on("mouseleave", "areas-fill", () => {
          if (instance) instance.getCanvas().style.cursor = "";
        });
        loadedRef.current = true;
      });
    })();

    return () => {
      disposed = true;
      loadedRef.current = false;
      mapRef.current = null;
      instance?.remove();
    };
  }, [map]);

  // Highlight the selected area on the map
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !loadedRef.current) return;
    m.setPaintProperty("areas-fill", "fill-opacity", fillOpacity(selected));
    m.setFilter("areas-selected", ["==", ["get", "name"], selected]);
  }, [selected]);

  // Picking from the list also moves the map to that area
  const pick = (area: AreaDef) => {
    setSelected(area.name);
    const m = mapRef.current;
    if (!m) return;
    const lats = area.polygon.map(([lat]) => lat);
    const lngs = area.polygon.map(([, lng]) => lng);
    m.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)]
      ],
      { padding: 60, maxZoom: map.zoom + 1.5, duration: 600 }
    );
  };

  const chip = (a: AreaDef) => {
    const active = a.name === selected;
    return (
      <button
        key={a.name}
        type="button"
        onClick={() => pick(a)}
        aria-pressed={active}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
          active
            ? "bg-ink-900 border-ink-900 text-sand-50"
            : a.avoid
              ? "bg-white border-ink-100 text-ink-500 hover:border-ink-300"
              : "bg-white border-ink-100 text-ink-800 hover:border-ink-300"
        }`}
      >
        <span
          aria-hidden
          className={`w-3 h-3 rounded-sm shrink-0 ${a.avoid ? "border border-dashed" : ""}`}
          style={
            a.avoid
              ? { borderColor: a.color, backgroundColor: `${a.color}40` }
              : { backgroundColor: a.color }
          }
        />
        {a.name}
      </button>
    );
  };

  return (
    <figure className="my-8">
      {showIntro && map.intro ? (
        <p className="text-ink-700 text-base sm:text-lg leading-relaxed mb-5">
          {map.intro}
        </p>
      ) : null}
      {/* isolate: MapLibre uses high z-indexes internally; without a
          contained stacking context it paints over the sticky site
          header on scroll (mobile bug, 2026-08-05) */}
      <div className="relative isolate z-0 rounded-2xl overflow-hidden border border-ink-100 shadow-card">
        <div ref={containerRef} className="h-[320px] sm:h-[440px] w-full z-0" />
      </div>

      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-semibold mb-2">
          Stay here - tap an area
        </p>
        <div className="flex flex-wrap gap-2">{stayAreas.map(chip)}</div>
        {avoidAreas.length ? (
          <>
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-semibold mt-4 mb-2">
              Visit, don&apos;t stay
            </p>
            <div className="flex flex-wrap gap-2">{avoidAreas.map(chip)}</div>
          </>
        ) : null}
      </div>

      {selectedArea ? (
        <div
          className="mt-4 rounded-2xl bg-white border border-ink-100 shadow-card p-4 sm:p-5 border-l-4"
          style={{ borderLeftColor: selectedArea.color }}
        >
          <p className="font-display text-lg tracking-tight text-ink-900 !my-0">
            {selectedArea.name}
          </p>
          {selectedArea.hint ? (
            <p className="text-sm text-ink-600 !mt-1 !mb-0">{selectedArea.hint}</p>
          ) : null}
          {selectedArea.bestFor ? (
            <p className="text-sm text-ink-800 !mt-2 !mb-0">
              <strong>Best for:</strong> {selectedArea.bestFor}
            </p>
          ) : null}
          {selectedArea.avoid ? (
            <p className="text-sm text-ink-500 !mt-2 !mb-0">
              Worth a visit, but not where we&apos;d stay.
            </p>
          ) : null}
        </div>
      ) : null}

      <figcaption className="text-xs text-ink-400 mt-3">
        Borders are approximate - real neighbourhoods blur into each other.
      </figcaption>
    </figure>
  );
}

/** Selected area stands out; avoid-zones stay faint. */
function fillOpacity(selected: string) {
  return [
    "case",
    ["==", ["get", "name"], selected],
    0.55,
    ["get", "avoid"],
    0.12,
    0.28
  ] as unknown as number;
}
