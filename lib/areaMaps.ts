/**
 * Neighbourhood overlay data for the "Best Areas to Stay" maps.
 *
 * Each city gets a set of named, coloured polygons drawn over a real
 * street map (see components/AreaMap.tsx). Coordinates are [lat, lng].
 *
 * IMPORTANT: neighbourhood borders are informal everywhere - these
 * polygons are drafts drawn from landmarks and main roads, and should
 * be corrected by someone who has lived there (Valeria + Arni) before
 * a city's map is considered final. Refine by editing the coordinate
 * lists; more points = more organic shapes.
 */

export interface AreaDef {
  name: string;
  /** Fill/stroke colour for the polygon + legend swatch. */
  color: string;
  /** One-liner shown in the polygon tooltip, e.g. "Cafés + nomad hub". */
  hint?: string;
  /** Polygon outline as [lat, lng] pairs. */
  polygon: [number, number][];
}

export interface CityAreaMap {
  center: [number, number];
  zoom: number;
  areas: AreaDef[];
}

export const AREA_MAPS: Record<string, CityAreaMap> = {
  "chiang-mai": {
    center: [18.793, 98.988],
    zoom: 13,
    areas: [
      {
        name: "Old City",
        color: "#e07a5f",
        hint: "Temples, cafés, walkable moat square",
        polygon: [
          [18.7962, 98.9768],
          [18.7962, 98.9936],
          [18.7794, 98.9936],
          [18.7794, 98.9768]
        ]
      },
      {
        name: "Nimman",
        color: "#d16ba5",
        hint: "Cafés, coworking, the nomad hub",
        polygon: [
          [18.8052, 98.9636],
          [18.8055, 98.9724],
          [18.7948, 98.9736],
          [18.7944, 98.9642]
        ]
      },
      {
        name: "Santitham",
        color: "#7c6bd1",
        hint: "Local, cheap eats, quieter",
        polygon: [
          [18.8108, 98.9724],
          [18.8112, 98.9834],
          [18.8006, 98.9838],
          [18.8004, 98.9726]
        ]
      },
      {
        name: "Suthep",
        color: "#e0975f",
        hint: "Green, near the university + mountain",
        polygon: [
          [18.8002, 98.9448],
          [18.8004, 98.9604],
          [18.7748, 98.9622],
          [18.7746, 98.9452]
        ]
      },
      {
        name: "Jed Yod",
        color: "#d4b85a",
        hint: "Residential, easy highway access",
        polygon: [
          [18.8162, 98.9618],
          [18.8164, 98.9762],
          [18.8078, 98.9764],
          [18.8076, 98.9622]
        ]
      },
      {
        name: "Night Bazaar",
        color: "#5fb8c9",
        hint: "Markets, central, touristy",
        polygon: [
          [18.7902, 98.9968],
          [18.7904, 99.0024],
          [18.7828, 99.0026],
          [18.7826, 98.9970]
        ]
      },
      {
        name: "Riverside",
        color: "#5fc98a",
        hint: "Ping river cafés + restaurants",
        polygon: [
          [18.7992, 99.0002],
          [18.7994, 99.0092],
          [18.7848, 99.0094],
          [18.7846, 99.0004]
        ]
      },
      {
        name: "Central Festival",
        color: "#a8c95f",
        hint: "Mall comforts, long-stay condos",
        polygon: [
          [18.8102, 99.0138],
          [18.8104, 99.0252],
          [18.8018, 99.0254],
          [18.8016, 99.0140]
        ]
      }
    ]
  }
};
