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
  },

  /* ------------------------------------------------------------------
   * DRAFT maps for not-yet-live guides. Borders are rough quads around
   * each area's anchor - refine (and add an intro) when the guide's
   * content is written, before launch.
   * ---------------------------------------------------------------- */

  "da-nang": {
    center: [16.055, 108.232],
    zoom: 12.6,
    areas: [
      { name: "An Thuong", color: "#e07a5f", hint: "Nomad + expat beach quarter", polygon: [[16.060, 108.240], [16.060, 108.250], [16.044, 108.250], [16.044, 108.240]] },
      { name: "My Khe", color: "#d16ba5", hint: "Beachfront living", polygon: [[16.075, 108.240], [16.075, 108.251], [16.060, 108.251], [16.060, 108.240]] },
      { name: "Han Riverside", color: "#7c6bd1", hint: "City centre, cafés + river", polygon: [[16.080, 108.216], [16.080, 108.228], [16.058, 108.228], [16.058, 108.216]] },
      { name: "An Hai Bac / Son Tra", color: "#5fc98a", hint: "Quieter, near the peninsula", polygon: [[16.095, 108.230], [16.095, 108.246], [16.076, 108.246], [16.076, 108.230]] },
      { name: "Ngu Hanh Son", color: "#d4b85a", hint: "South beach, near Marble Mountains", polygon: [[16.030, 108.245], [16.030, 108.262], [16.000, 108.262], [16.000, 108.245]] }
    ]
  },

  ubud: {
    center: [-8.51, 115.262],
    zoom: 13.2,
    areas: [
      { name: "Central Ubud", color: "#e07a5f", hint: "Walk to everything, busiest", polygon: [[-8.503, 115.258], [-8.503, 115.268], [-8.520, 115.268], [-8.520, 115.258]] },
      { name: "Penestanan", color: "#d16ba5", hint: "Rice-field walks, yoga, quiet", polygon: [[-8.503, 115.245], [-8.503, 115.256], [-8.515, 115.256], [-8.515, 115.245]] },
      { name: "Sayan", color: "#7c6bd1", hint: "Ayung ridge, villa country", polygon: [[-8.500, 115.235], [-8.500, 115.245], [-8.520, 115.245], [-8.520, 115.235]] },
      { name: "Nyuh Kuning", color: "#5fc98a", hint: "Village calm by the Monkey Forest", polygon: [[-8.520, 115.255], [-8.520, 115.265], [-8.530, 115.265], [-8.530, 115.255]] },
      { name: "Peliatan", color: "#d4b85a", hint: "Local, arty, cheaper", polygon: [[-8.508, 115.268], [-8.508, 115.278], [-8.525, 115.278], [-8.525, 115.268]] }
    ]
  },

  "koh-samui": {
    center: [9.52, 100.0],
    zoom: 11.6,
    areas: [
      { name: "Chaweng", color: "#e07a5f", hint: "Main beach, nightlife, everything", polygon: [[9.560, 100.055], [9.560, 100.066], [9.525, 100.066], [9.525, 100.055]] },
      { name: "Lamai", color: "#d16ba5", hint: "Calmer second beach", polygon: [[9.480, 100.040], [9.480, 100.056], [9.460, 100.056], [9.460, 100.040]] },
      { name: "Bophut", color: "#7c6bd1", hint: "Fisherman's Village, boutique feel", polygon: [[9.565, 100.020], [9.565, 100.040], [9.550, 100.040], [9.550, 100.020]] },
      { name: "Maenam", color: "#5fc98a", hint: "Quiet, long-stay favourite", polygon: [[9.575, 99.990], [9.575, 100.015], [9.560, 100.015], [9.560, 99.990]] },
      { name: "Bang Rak", color: "#d4b85a", hint: "Near the pier + airport", polygon: [[9.570, 100.040], [9.570, 100.056], [9.555, 100.056], [9.555, 100.040]] },
      { name: "Nathon / West", color: "#5fb8c9", hint: "Local side, sunsets", polygon: [[9.530, 99.930], [9.530, 99.946], [9.500, 99.946], [9.500, 99.930]] }
    ]
  },

  "kuala-lumpur": {
    center: [3.148, 101.685],
    zoom: 12.0,
    areas: [
      { name: "KLCC", color: "#e07a5f", hint: "Towers, malls, centre of it all", polygon: [[3.165, 101.700], [3.165, 101.720], [3.150, 101.720], [3.150, 101.700]] },
      { name: "Bukit Bintang", color: "#d16ba5", hint: "Food streets + nightlife", polygon: [[3.150, 101.700], [3.150, 101.716], [3.140, 101.716], [3.140, 101.700]] },
      { name: "Brickfields / KL Sentral", color: "#7c6bd1", hint: "Transit hub, Little India", polygon: [[3.140, 101.683], [3.140, 101.695], [3.125, 101.695], [3.125, 101.683]] },
      { name: "Bangsar", color: "#5fc98a", hint: "Expat cafés + bars", polygon: [[3.140, 101.665], [3.140, 101.680], [3.120, 101.680], [3.120, 101.665]] },
      { name: "Mont Kiara", color: "#d4b85a", hint: "Condo comfort, families + expats", polygon: [[3.180, 101.645], [3.180, 101.665], [3.160, 101.665], [3.160, 101.645]] },
      { name: "TTDI", color: "#5fb8c9", hint: "Local-cool, leafy", polygon: [[3.150, 101.625], [3.150, 101.640], [3.135, 101.640], [3.135, 101.625]] }
    ]
  },

  seoul: {
    center: [37.545, 126.99],
    zoom: 11.8,
    areas: [
      { name: "Hongdae / Yeonnam", color: "#e07a5f", hint: "Young, creative, café-dense", polygon: [[37.570, 126.915], [37.570, 126.930], [37.550, 126.930], [37.550, 126.915]] },
      { name: "Gangnam / Yeoksam", color: "#d16ba5", hint: "Polished, corporate, late-night", polygon: [[37.510, 127.020], [37.510, 127.045], [37.490, 127.045], [37.490, 127.020]] },
      { name: "Itaewon / HBC", color: "#7c6bd1", hint: "International, hillside views", polygon: [[37.545, 126.985], [37.545, 127.005], [37.530, 127.005], [37.530, 126.985]] },
      { name: "Seongsu", color: "#5fc98a", hint: "Seoul's Brooklyn, studios + cafés", polygon: [[37.555, 127.045], [37.555, 127.065], [37.540, 127.065], [37.540, 127.045]] },
      { name: "Jongno / Insadong", color: "#d4b85a", hint: "Old Seoul, palaces, hanok lanes", polygon: [[37.585, 126.980], [37.585, 127.000], [37.570, 127.000], [37.570, 126.980]] }
    ]
  },

  tokyo: {
    center: [35.672, 139.72],
    zoom: 11.6,
    areas: [
      { name: "Shibuya", color: "#e07a5f", hint: "The centre of young Tokyo", polygon: [[35.665, 139.690], [35.665, 139.710], [35.650, 139.710], [35.650, 139.690]] },
      { name: "Shinjuku", color: "#d16ba5", hint: "Everything, all night", polygon: [[35.700, 139.690], [35.700, 139.710], [35.685, 139.710], [35.685, 139.690]] },
      { name: "Shimokitazawa", color: "#7c6bd1", hint: "Vintage, indie, village feel", polygon: [[35.665, 139.665], [35.665, 139.675], [35.655, 139.675], [35.655, 139.665]] },
      { name: "Nakameguro / Ebisu", color: "#5fc98a", hint: "Canal cafés, grown-up cool", polygon: [[35.655, 139.695], [35.655, 139.715], [35.640, 139.715], [35.640, 139.695]] },
      { name: "Koenji", color: "#d4b85a", hint: "Cheap, musical, local", polygon: [[35.710, 139.645], [35.710, 139.660], [35.700, 139.660], [35.700, 139.645]] },
      { name: "Asakusa", color: "#5fb8c9", hint: "Old Tokyo, temple side", polygon: [[35.720, 139.790], [35.720, 139.805], [35.705, 139.805], [35.705, 139.790]] }
    ]
  },

  phuket: {
    center: [7.89, 98.33],
    zoom: 10.8,
    areas: [
      { name: "Rawai / Nai Harn", color: "#e07a5f", hint: "South-end long-stay favourite", polygon: [[7.785, 98.310], [7.785, 98.340], [7.760, 98.340], [7.760, 98.310]] },
      { name: "Kata", color: "#d16ba5", hint: "Surf beach, family-calm", polygon: [[7.825, 98.290], [7.825, 98.310], [7.800, 98.310], [7.800, 98.290]] },
      { name: "Karon", color: "#7c6bd1", hint: "Long beach, quieter resort strip", polygon: [[7.855, 98.288], [7.855, 98.302], [7.830, 98.302], [7.830, 98.288]] },
      { name: "Patong", color: "#d4b85a", hint: "The party engine - visit, don't live", polygon: [[7.910, 98.290], [7.910, 98.310], [7.880, 98.310], [7.880, 98.290]] },
      { name: "Phuket Town", color: "#5fc98a", hint: "Real city, old shophouses, cheap", polygon: [[7.900, 98.375], [7.900, 98.400], [7.870, 98.400], [7.870, 98.375]] },
      { name: "Bang Tao", color: "#5fb8c9", hint: "Laguna polish, beach clubs", polygon: [[8.010, 98.290], [8.010, 98.310], [7.980, 98.310], [7.980, 98.290]] }
    ]
  },

  coron: {
    center: [12.002, 120.203],
    zoom: 13.4,
    areas: [
      { name: "Town Proper", color: "#e07a5f", hint: "Restaurants, dive shops, the hub", polygon: [[12.005, 120.198], [12.005, 120.208], [11.995, 120.208], [11.995, 120.198]] },
      { name: "Waterfront", color: "#5fb8c9", hint: "Harbour views, boat access", polygon: [[11.998, 120.190], [11.998, 120.200], [11.990, 120.200], [11.990, 120.190]] },
      { name: "San Jose", color: "#5fc98a", hint: "Quieter, north of town", polygon: [[12.015, 120.205], [12.015, 120.215], [12.005, 120.215], [12.005, 120.205]] }
    ]
  },

  "el-nido": {
    center: [11.185, 119.395],
    zoom: 12.8,
    areas: [
      { name: "El Nido Town", color: "#e07a5f", hint: "Bacuit bay views, tour central", polygon: [[11.188, 119.385], [11.188, 119.395], [11.178, 119.395], [11.178, 119.385]] },
      { name: "Corong-Corong", color: "#d16ba5", hint: "Sunset beach, calmer stays", polygon: [[11.175, 119.380], [11.175, 119.395], [11.160, 119.395], [11.160, 119.380]] },
      { name: "Lio", color: "#5fc98a", hint: "Planned estate by the airport", polygon: [[11.220, 119.400], [11.220, 119.420], [11.200, 119.420], [11.200, 119.400]] }
    ]
  },

  kyoto: {
    center: [35.005, 135.762],
    zoom: 12.2,
    areas: [
      { name: "Downtown / Kawaramachi", color: "#e07a5f", hint: "Central, everything walkable", polygon: [[35.015, 135.755], [35.015, 135.775], [35.000, 135.775], [35.000, 135.755]] },
      { name: "Gion / Higashiyama", color: "#d16ba5", hint: "The postcard Kyoto", polygon: [[35.005, 135.770], [35.005, 135.785], [34.995, 135.785], [34.995, 135.770]] },
      { name: "Kyoto Station", color: "#7c6bd1", hint: "Transit ease, modern stays", polygon: [[34.990, 135.750], [34.990, 135.765], [34.980, 135.765], [34.980, 135.750]] },
      { name: "Arashiyama", color: "#5fc98a", hint: "Bamboo + river, west escape", polygon: [[35.020, 135.670], [35.020, 135.685], [35.010, 135.685], [35.010, 135.670]] },
      { name: "Ichijoji / North", color: "#d4b85a", hint: "Student cafés, ramen street", polygon: [[35.055, 135.780], [35.055, 135.800], [35.040, 135.800], [35.040, 135.780]] }
    ]
  },

  boracay: {
    center: [11.967, 121.927],
    zoom: 13.6,
    areas: [
      { name: "Station 1", color: "#e07a5f", hint: "Widest sand, quietest luxury", polygon: [[11.985, 121.918], [11.985, 121.928], [11.975, 121.928], [11.975, 121.918]] },
      { name: "Station 2", color: "#d16ba5", hint: "The busy middle - D'Mall", polygon: [[11.975, 121.922], [11.975, 121.932], [11.962, 121.932], [11.962, 121.922]] },
      { name: "Station 3", color: "#7c6bd1", hint: "Cheaper, more local", polygon: [[11.962, 121.925], [11.962, 121.935], [11.950, 121.935], [11.950, 121.925]] },
      { name: "Bulabog", color: "#5fb8c9", hint: "Kitesurf side", polygon: [[11.975, 121.932], [11.975, 121.940], [11.960, 121.940], [11.960, 121.932]] },
      { name: "Diniwid", color: "#5fc98a", hint: "Small cove past Station 1", polygon: [[11.992, 121.912], [11.992, 121.920], [11.985, 121.920], [11.985, 121.912]] }
    ]
  },

  mirissa: {
    center: [5.952, 80.455],
    zoom: 13.2,
    areas: [
      { name: "Mirissa Beach", color: "#e07a5f", hint: "The bay, restaurants on sand", polygon: [[5.950, 80.455], [5.950, 80.472], [5.942, 80.472], [5.942, 80.455]] },
      { name: "Udupila / Inland", color: "#5fc98a", hint: "Guesthouses in the palms", polygon: [[5.960, 80.450], [5.960, 80.468], [5.950, 80.468], [5.950, 80.450]] },
      { name: "Weligama", color: "#5fb8c9", hint: "Surf-school bay next door", polygon: [[5.978, 80.418], [5.978, 80.435], [5.966, 80.435], [5.966, 80.418]] }
    ]
  },

  canggu: {
    center: [-8.65, 115.128],
    zoom: 13.0,
    areas: [
      { name: "Batu Bolong", color: "#e07a5f", hint: "The heart of it - cafés + surf", polygon: [[-8.650, 115.125], [-8.650, 115.135], [-8.660, 115.135], [-8.660, 115.125]] },
      { name: "Berawa", color: "#d16ba5", hint: "Gyms, coworking, family villas", polygon: [[-8.655, 115.135], [-8.655, 115.148], [-8.665, 115.148], [-8.665, 115.135]] },
      { name: "Echo Beach", color: "#7c6bd1", hint: "Surfier, slightly calmer", polygon: [[-8.645, 115.115], [-8.645, 115.125], [-8.655, 115.125], [-8.655, 115.115]] },
      { name: "Pererenan", color: "#5fc98a", hint: "Where the cool kids moved", polygon: [[-8.635, 115.105], [-8.635, 115.118], [-8.650, 115.118], [-8.650, 115.105]] },
      { name: "Padonan", color: "#d4b85a", hint: "Quiet rice-field living", polygon: [[-8.625, 115.130], [-8.625, 115.145], [-8.640, 115.145], [-8.640, 115.130]] }
    ]
  },

  uluwatu: {
    center: [-8.815, 115.11],
    zoom: 12.4,
    areas: [
      { name: "Bingin", color: "#e07a5f", hint: "Cliff stairs, surf, sunset bowls", polygon: [[-8.800, 115.100], [-8.800, 115.115], [-8.810, 115.115], [-8.810, 115.100]] },
      { name: "Padang Padang", color: "#d16ba5", hint: "The famous wave + beach", polygon: [[-8.805, 115.090], [-8.805, 115.105], [-8.815, 115.105], [-8.815, 115.090]] },
      { name: "Pecatu / Uluwatu", color: "#7c6bd1", hint: "Temple end, villa plateaus", polygon: [[-8.820, 115.080], [-8.820, 115.100], [-8.840, 115.100], [-8.840, 115.080]] },
      { name: "Balangan", color: "#5fc98a", hint: "Long beach, fewer crowds", polygon: [[-8.785, 115.115], [-8.785, 115.130], [-8.795, 115.130], [-8.795, 115.115]] },
      { name: "Ungasan", color: "#d4b85a", hint: "Hilltop villas, need a scooter", polygon: [[-8.810, 115.130], [-8.810, 115.155], [-8.830, 115.155], [-8.830, 115.130]] }
    ]
  },

  osaka: {
    center: [34.68, 135.5],
    zoom: 12.0,
    areas: [
      { name: "Namba / Shinsaibashi", color: "#e07a5f", hint: "Dotonbori energy, food alleys", polygon: [[34.675, 135.495], [34.675, 135.510], [34.660, 135.510], [34.660, 135.495]] },
      { name: "Umeda", color: "#d16ba5", hint: "North hub - transit + towers", polygon: [[34.710, 135.490], [34.710, 135.505], [34.695, 135.505], [34.695, 135.490]] },
      { name: "Tennoji", color: "#7c6bd1", hint: "Cheaper, local, park-side", polygon: [[34.660, 135.505], [34.660, 135.520], [34.645, 135.520], [34.645, 135.505]] },
      { name: "Fukushima", color: "#5fc98a", hint: "Izakaya lanes, walk to Umeda", polygon: [[34.700, 135.470], [34.700, 135.485], [34.690, 135.485], [34.690, 135.470]] }
    ]
  },

  "hoi-an": {
    center: [15.893, 108.335],
    zoom: 13.4,
    areas: [
      { name: "Old Town", color: "#e07a5f", hint: "The lantern postcard - loud by day", polygon: [[15.882, 108.325], [15.882, 108.335], [15.875, 108.335], [15.875, 108.325]] },
      { name: "An Hoi", color: "#d16ba5", hint: "Across the bridge, night market", polygon: [[15.876, 108.322], [15.876, 108.330], [15.870, 108.330], [15.870, 108.322]] },
      { name: "Cam Chau", color: "#5fc98a", hint: "Rice fields between town + beach", polygon: [[15.900, 108.340], [15.900, 108.355], [15.885, 108.355], [15.885, 108.340]] },
      { name: "An Bang", color: "#5fb8c9", hint: "The beach village", polygon: [[15.925, 108.335], [15.925, 108.350], [15.910, 108.350], [15.910, 108.335]] },
      { name: "Tan An", color: "#d4b85a", hint: "Quiet expat lanes", polygon: [[15.895, 108.315], [15.895, 108.325], [15.885, 108.325], [15.885, 108.315]] }
    ]
  },

  krabi: {
    center: [8.045, 98.85],
    zoom: 11.4,
    areas: [
      { name: "Ao Nang", color: "#e07a5f", hint: "Beach base, tour central", polygon: [[8.040, 98.810], [8.040, 98.830], [8.020, 98.830], [8.020, 98.810]] },
      { name: "Krabi Town", color: "#d16ba5", hint: "Real town, night market, cheap", polygon: [[8.075, 98.905], [8.075, 98.925], [8.055, 98.925], [8.055, 98.905]] },
      { name: "Railay", color: "#7c6bd1", hint: "Boat-only cliffs + climbing", polygon: [[8.020, 98.835], [8.020, 98.845], [8.005, 98.845], [8.005, 98.835]] },
      { name: "Klong Muang", color: "#5fc98a", hint: "Quiet resort strip", polygon: [[8.060, 98.755], [8.060, 98.775], [8.045, 98.775], [8.045, 98.755]] }
    ]
  },

  singapore: {
    center: [1.295, 103.84],
    zoom: 11.8,
    areas: [
      { name: "Tiong Bahru", color: "#e07a5f", hint: "Art-deco blocks, café central", polygon: [[1.290, 103.825], [1.290, 103.835], [1.282, 103.835], [1.282, 103.825]] },
      { name: "Tanjong Pagar", color: "#d16ba5", hint: "CBD living, shophouse bars", polygon: [[1.282, 103.840], [1.282, 103.850], [1.270, 103.850], [1.270, 103.840]] },
      { name: "Robertson Quay", color: "#7c6bd1", hint: "River calm, walk to town", polygon: [[1.295, 103.835], [1.295, 103.845], [1.288, 103.845], [1.288, 103.835]] },
      { name: "Kampong Glam", color: "#d4b85a", hint: "Haji Lane, mosques, texture", polygon: [[1.308, 103.855], [1.308, 103.865], [1.298, 103.865], [1.298, 103.855]] },
      { name: "Katong", color: "#5fc98a", hint: "Peranakan east, food streets", polygon: [[1.315, 103.895], [1.315, 103.910], [1.300, 103.910], [1.300, 103.895]] },
      { name: "Holland Village", color: "#5fb8c9", hint: "Leafy expat standby", polygon: [[1.315, 103.790], [1.315, 103.800], [1.305, 103.800], [1.305, 103.790]] }
    ]
  },

  "koh-phangan": {
    center: [9.73, 100.02],
    zoom: 11.8,
    areas: [
      { name: "Sri Thanu", color: "#e07a5f", hint: "Yoga + conscious-community hub", polygon: [[9.775, 99.970], [9.775, 99.985], [9.755, 99.985], [9.755, 99.970]] },
      { name: "Thong Sala", color: "#d16ba5", hint: "Main town, pier, markets", polygon: [[9.720, 99.990], [9.720, 100.005], [9.705, 100.005], [9.705, 99.990]] },
      { name: "Baan Tai", color: "#7c6bd1", hint: "Long beach between town + party", polygon: [[9.715, 100.010], [9.715, 100.035], [9.700, 100.035], [9.700, 100.010]] },
      { name: "Haad Rin", color: "#d4b85a", hint: "Full Moon corner", polygon: [[9.680, 100.060], [9.680, 100.075], [9.660, 100.075], [9.660, 100.060]] },
      { name: "Chaloklum", color: "#5fc98a", hint: "Fishing village north, quiet", polygon: [[9.790, 100.005], [9.790, 100.025], [9.775, 100.025], [9.775, 100.005]] }
    ]
  },

  hanoi: {
    center: [21.04, 105.84],
    zoom: 12.4,
    areas: [
      { name: "Old Quarter", color: "#e07a5f", hint: "The 36 streets - loud, alive", polygon: [[21.040, 105.845], [21.040, 105.855], [21.030, 105.855], [21.030, 105.845]] },
      { name: "French Quarter", color: "#d16ba5", hint: "Boulevards, calmer grandeur", polygon: [[21.028, 105.845], [21.028, 105.860], [21.015, 105.860], [21.015, 105.845]] },
      { name: "Tay Ho", color: "#5fc98a", hint: "West Lake - the expat village", polygon: [[21.080, 105.815], [21.080, 105.840], [21.060, 105.840], [21.060, 105.815]] },
      { name: "Ba Dinh", color: "#7c6bd1", hint: "Government quarter, leafy", polygon: [[21.045, 105.825], [21.045, 105.840], [21.030, 105.840], [21.030, 105.825]] },
      { name: "Truc Bach", color: "#d4b85a", hint: "Small lake island, local charm", polygon: [[21.052, 105.835], [21.052, 105.845], [21.043, 105.845], [21.043, 105.835]] }
    ]
  },

  "gili-islands": {
    center: [-8.352, 116.06],
    zoom: 12.2,
    areas: [
      { name: "Gili Trawangan", color: "#e07a5f", hint: "The big one - bars + dive schools", polygon: [[-8.340, 116.030], [-8.340, 116.045], [-8.360, 116.045], [-8.360, 116.030]] },
      { name: "Gili Meno", color: "#5fc98a", hint: "Honeymoon-quiet middle island", polygon: [[-8.340, 116.052], [-8.340, 116.062], [-8.355, 116.062], [-8.355, 116.052]] },
      { name: "Gili Air", color: "#5fb8c9", hint: "The balance - chill but alive", polygon: [[-8.350, 116.075], [-8.350, 116.090], [-8.365, 116.090], [-8.365, 116.075]] }
    ]
  },

  dubai: {
    center: [25.16, 55.24],
    zoom: 10.8,
    areas: [
      { name: "Dubai Marina / JBR", color: "#e07a5f", hint: "Waterfront towers, beach life", polygon: [[25.085, 55.125], [25.085, 55.145], [25.070, 55.145], [25.070, 55.125]] },
      { name: "JLT", color: "#d16ba5", hint: "Marina's cheaper neighbour", polygon: [[25.070, 55.135], [25.070, 55.155], [25.055, 55.155], [25.055, 55.135]] },
      { name: "Downtown", color: "#7c6bd1", hint: "Burj views, walkable core", polygon: [[25.205, 55.265], [25.205, 55.285], [25.185, 55.285], [25.185, 55.265]] },
      { name: "Business Bay", color: "#d4b85a", hint: "Downtown value option", polygon: [[25.190, 55.255], [25.190, 55.275], [25.175, 55.275], [25.175, 55.255]] },
      { name: "Jumeirah", color: "#5fc98a", hint: "Low-rise villas near the beach", polygon: [[25.230, 55.230], [25.230, 55.260], [25.190, 55.260], [25.190, 55.230]] },
      { name: "Deira", color: "#5fb8c9", hint: "Old Dubai - souks + creek", polygon: [[25.280, 55.300], [25.280, 55.330], [25.260, 55.330], [25.260, 55.300]] }
    ]
  },

  "koh-tao": {
    center: [10.09, 99.828],
    zoom: 13.2,
    areas: [
      { name: "Sairee", color: "#e07a5f", hint: "Main beach, sunset bars", polygon: [[10.110, 99.822], [10.110, 99.832], [10.095, 99.832], [10.095, 99.822]] },
      { name: "Mae Haad", color: "#d16ba5", hint: "Pier town, dive shops", polygon: [[10.095, 99.815], [10.095, 99.828], [10.080, 99.828], [10.080, 99.815]] },
      { name: "Chalok Baan Kao", color: "#5fc98a", hint: "South bay, quieter", polygon: [[10.075, 99.820], [10.075, 99.835], [10.065, 99.835], [10.065, 99.820]] }
    ]
  },

  "ho-chi-minh": {
    center: [10.785, 106.71],
    zoom: 11.8,
    areas: [
      { name: "District 1", color: "#e07a5f", hint: "The centre - everything, always", polygon: [[10.785, 106.690], [10.785, 106.710], [10.770, 106.710], [10.770, 106.690]] },
      { name: "District 3", color: "#d16ba5", hint: "D1's calmer, prettier neighbour", polygon: [[10.790, 106.675], [10.790, 106.690], [10.775, 106.690], [10.775, 106.675]] },
      { name: "Thao Dien", color: "#5fc98a", hint: "The expat village east", polygon: [[10.815, 106.730], [10.815, 106.750], [10.800, 106.750], [10.800, 106.730]] },
      { name: "Binh Thanh", color: "#7c6bd1", hint: "Local value near the centre", polygon: [[10.810, 106.700], [10.810, 106.720], [10.790, 106.720], [10.790, 106.700]] },
      { name: "District 7", color: "#d4b85a", hint: "Planned, green, family condos", polygon: [[10.740, 106.700], [10.740, 106.730], [10.720, 106.730], [10.720, 106.700]] }
    ]
  },

  "phi-phi-islands": {
    center: [7.74, 98.777],
    zoom: 14.0,
    areas: [
      { name: "Tonsai Village", color: "#e07a5f", hint: "The walkable hub between bays", polygon: [[7.744, 98.772], [7.744, 98.782], [7.738, 98.782], [7.738, 98.772]] },
      { name: "Loh Dalum", color: "#5fb8c9", hint: "North bay - sunset + party", polygon: [[7.748, 98.770], [7.748, 98.780], [7.743, 98.780], [7.743, 98.770]] },
      { name: "Long Beach", color: "#5fc98a", hint: "Quieter sand, boat or trail in", polygon: [[7.735, 98.780], [7.735, 98.790], [7.728, 98.790], [7.728, 98.780]] }
    ]
  },

  nara: {
    center: [34.683, 135.83],
    zoom: 13.4,
    areas: [
      { name: "Naramachi", color: "#e07a5f", hint: "Old merchant town, machiya lanes", polygon: [[34.682, 135.825], [34.682, 135.835], [34.675, 135.835], [34.675, 135.825]] },
      { name: "Station Area", color: "#d16ba5", hint: "JR + Kintetsu convenience", polygon: [[34.690, 135.815], [34.690, 135.828], [34.680, 135.828], [34.680, 135.815]] },
      { name: "Park Side", color: "#5fc98a", hint: "Deer park + temple edge", polygon: [[34.690, 135.830], [34.690, 135.845], [34.682, 135.845], [34.682, 135.830]] }
    ]
  },

  seminyak: {
    center: [-8.683, 115.158],
    zoom: 13.4,
    areas: [
      { name: "Central / Oberoi", color: "#e07a5f", hint: "Eat Street - restaurants + boutiques", polygon: [[-8.680, 115.155], [-8.680, 115.168], [-8.690, 115.168], [-8.690, 115.155]] },
      { name: "Petitenget", color: "#d16ba5", hint: "Beach clubs + temple stretch", polygon: [[-8.670, 115.148], [-8.670, 115.160], [-8.680, 115.160], [-8.680, 115.148]] },
      { name: "Batu Belig", color: "#5fc98a", hint: "Quieter edge toward Canggu", polygon: [[-8.660, 115.140], [-8.660, 115.152], [-8.670, 115.152], [-8.670, 115.140]] },
      { name: "Double Six", color: "#d4b85a", hint: "Sunset bars, Legian border", polygon: [[-8.690, 115.160], [-8.690, 115.172], [-8.700, 115.172], [-8.700, 115.160]] }
    ]
  },

  hiriketiya: {
    center: [5.963, 80.695],
    zoom: 14.0,
    areas: [
      { name: "Hiriketiya Bay", color: "#e07a5f", hint: "The horseshoe - surf + cafés", polygon: [[5.965, 80.692], [5.965, 80.700], [5.958, 80.700], [5.958, 80.692]] },
      { name: "Dikwella", color: "#d16ba5", hint: "Town next door - shops + ATMs", polygon: [[5.972, 80.680], [5.972, 80.692], [5.963, 80.692], [5.963, 80.680]] },
      { name: "Nilwella", color: "#5fc98a", hint: "Quieter coves east", polygon: [[5.963, 80.705], [5.963, 80.715], [5.955, 80.715], [5.955, 80.705]] }
    ]
  }
};
