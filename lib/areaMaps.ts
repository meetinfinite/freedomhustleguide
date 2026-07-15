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
  /** Short scene-setting paragraph rendered above the map. */
  intro?: string;
  areas: AreaDef[];
}

export const AREA_MAPS: Record<string, CityAreaMap> = {
  bangkok: {
    center: [13.74, 100.565],
    zoom: 12.4,
    intro:
      "Bangkok is enormous, but the BTS and MRT shrink it - live near a station and the whole city opens up; live far from one and every plan starts with a taxi negotiation. Asoke and Phrom Phong are the easy first landings, Thonglor-Ekkamai is where the food and nightlife live, Ari is the local-cool pocket, and On Nut is the budget move that keeps you on the train line.",
    areas: [
      {
        name: "Asoke",
        color: "#e07a5f",
        hint: "Central, connected, easiest first landing",
        polygon: [
          [13.7448, 100.556],
          [13.7448, 100.5668],
          [13.731, 100.5668],
          [13.731, 100.556]
        ]
      },
      {
        name: "Phrom Phong",
        color: "#d16ba5",
        hint: "Upscale Sukhumvit, parks + cafés",
        polygon: [
          [13.7405, 100.5645],
          [13.7405, 100.5758],
          [13.722, 100.5758],
          [13.722, 100.5645]
        ]
      },
      {
        name: "Thonglor",
        color: "#7c6bd1",
        hint: "Food + nightlife, trendier money",
        polygon: [
          [13.742, 100.576],
          [13.742, 100.588],
          [13.722, 100.588],
          [13.722, 100.576]
        ]
      },
      {
        name: "Ekkamai",
        color: "#d4b85a",
        hint: "Thonglor's calmer neighbour",
        polygon: [
          [13.74, 100.588],
          [13.74, 100.598],
          [13.716, 100.598],
          [13.716, 100.588]
        ]
      },
      {
        name: "Ari",
        color: "#5fc98a",
        hint: "Local-cool, café pocket",
        polygon: [
          [13.79, 100.535],
          [13.79, 100.552],
          [13.772, 100.552],
          [13.772, 100.535]
        ]
      },
      {
        name: "On Nut",
        color: "#5fb8c9",
        hint: "Budget move, still on the BTS",
        polygon: [
          [13.716, 100.595],
          [13.716, 100.612],
          [13.698, 100.612],
          [13.698, 100.595]
        ]
      },
      {
        name: "Silom / Sathorn",
        color: "#e0975f",
        hint: "Offices, parks, old-school Bangkok",
        polygon: [
          [13.732, 100.512],
          [13.732, 100.54],
          [13.712, 100.54],
          [13.712, 100.512]
        ]
      },
      {
        name: "Rama 9",
        color: "#a8c95f",
        hint: "New CBD, MRT-side value condos",
        polygon: [
          [13.768, 100.558],
          [13.768, 100.578],
          [13.748, 100.578],
          [13.748, 100.558]
        ]
      }
    ]
  },
  "chiang-mai": {
    center: [18.793, 98.988],
    zoom: 13,
    intro:
      'Chiang Mai is small, and that changes everything. There\'s no BTS or MRT here - the city is a handful of walkable pockets that you ride between - so "which area" really means "which ten minutes of the city do you want on your doorstep". Nimman is the nomad default and the easiest landing, the Old City is the atmospheric one, and Santitham is where people quietly move in month two once they\'ve seen Nimman\'s prices.',
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
