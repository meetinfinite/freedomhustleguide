export type GuideStatus = "live" | "soon";

export interface GuideMeta {
  slug: string;
  title: string;
  city: string;
  country: string;
  flag: string;
  tagline: string;
  price: string;
  /** Stripe Price ID for the single-guide product. null = no Stripe product yet. */
  stripePriceId: string | null;
  status: GuideStatus;
  /**
   * Optional override for the "Coming soon" pill on cards/badges.
   * e.g. set to "In progress" for cities actively being researched.
   */
  progressLabel?: string;
  /**
   * Optional Google My Maps ID (the `mid=…` value from the embed URL).
   * When set, the in-app dashboard renders an embedded city map above the
   * section grid - one map per city, all categories colour-coded.
   */
  myMapsId?: string;
  heroImage: string;
  /** Square-ish image used on the homepage guide card. */
  cardImage: string;
  /**
   * A real photo of Arni + Valeria in this city, shown beside the trust
   * cards on the pre-purchase landing page ("we've been here" proof).
   * Optional - guides without one keep the plain 3-card layout.
   */
  foundersPhoto?: { src: string; caption: string };
  quickStats: { label: string; value: string }[];
  sections: GuideSection[];
}

export interface GuideSection {
  slug: string;
  title: string;
  description: string;
  icon: string;
  readingTime: string;
  /**
   * Notion page ID that holds the actual content for this section.
   * When set, the section page fetches from Notion and renders via
   * NotionRenderer. When unset, it falls back to the MDX file at
   * content/guides/<city>/<slug>.mdx.
   */
  notionPageId?: string;
}

/**
 * Single source of truth for guide structure.
 *
 * Every city starts from this template. A city can override individual
 * section fields via buildSections() - e.g. Bangkok tightens "Best Areas
 * to Stay" to "Eight neighborhoods compared" because that's the actual
 * count. New cities inherit the template wholesale until they have local
 * tweaks worth committing.
 *
 * Adding a section here adds it to every guide. Renaming/reordering
 * here propagates to every guide. That's the point.
 */
export const SECTION_TEMPLATE: GuideSection[] = [
  {
    slug: "first-24-hours",
    title: "First 24 Hours",
    description:
      "Airport to set-up. The exact order to do things in. Start right and make the journey smooth.",
    icon: "⏱️",
    readingTime: "5 min"
  },
  {
    slug: "areas-to-stay",
    title: "Best Areas to Stay",
    description:
      "Where to actually stay. Location is key for the best experience and quality of your travels.",
    icon: "🏙️",
    readingTime: "8 min"
  },
  {
    slug: "monthly-budget",
    title: "Monthly Budget",
    description:
      "What we actually spent per month - a real figure from mid-range full-time travellers.",
    icon: "💸",
    readingTime: "6 min"
  },
  {
    slug: "cafes",
    title: "Cafés",
    description:
      "Love coffee? Start every day right. Recommendations from coffee lovers.",
    icon: "☕",
    readingTime: "7 min"
  },
  {
    slug: "coworking",
    title: "Coworking Spaces",
    description: "Where it's worth it, where it's not. Is it worth your money?",
    icon: "🧑‍💻",
    readingTime: "5 min"
  },
  {
    slug: "restaurants",
    title: "Restaurants",
    description:
      "From street-stall legends to Michelin nods. The ones worth the trip.",
    icon: "🍜",
    readingTime: "6 min"
  },
  {
    slug: "nightlife",
    title: "Nightlife",
    description:
      "Rooftop bars, cocktail places, live music - where to have the best time.",
    icon: "🍸",
    readingTime: "5 min"
  },
  {
    slug: "gyms",
    title: "Gyms & Wellness",
    description: "Spa, gyms, strength - relax and stay fit while you travel.",
    icon: "🥊",
    readingTime: "5 min"
  },
  {
    slug: "visa-immigration",
    title: "Visa & Immigration",
    description: "Getting in, staying longer, the paperwork that matters.",
    icon: "🛂",
    readingTime: "5 min"
  },
  {
    slug: "getting-around",
    title: "Getting Around",
    description:
      "Transit, ride-shares, taxis, scooters - the boring part that's actually important.",
    icon: "🚇",
    readingTime: "6 min"
  },
  {
    slug: "trips-and-activities",
    title: "Trips & Activities",
    description: "Trip gems and tourist traps. What's worth your weekend.",
    icon: "🏝️",
    readingTime: "6 min"
  },
  {
    slug: "top-ten",
    title: "Top 10 Things to Experience",
    // "{city}" is swapped for the guide's city name at render time.
    description: "{city} made simple. Best things to do and experience.",
    icon: "⭐",
    readingTime: "6 min"
  },
  {
    slug: "mistakes-to-avoid",
    title: "Mistakes to Avoid",
    description: "Every mistake we made, so you don't.",
    icon: "⚠️",
    readingTime: "4 min"
  },
  {
    slug: "digital-nomad-toolkit",
    title: "Digital Nomad Toolkit",
    description:
      "What apps to use, gear, banking, insurance and tools - the stack that actually works.",
    icon: "🧰",
    readingTime: "4 min"
  }
];

/**
 * Per-section overrides keyed by section slug. Anything you set here wins
 * over the template default for that city. Anything you leave out falls
 * back to the template.
 *
 * Use for genuinely city-specific tweaks (numbers, local transit names,
 * cultural references). Don't use it to drift the structure - if you
 * change the same field on every city, promote it to the template.
 */
type SectionOverrides = Partial<Record<string, Partial<GuideSection>>>;

/** Apply per-section overrides to the template, preserving order. */
export function buildSections(
  overrides: SectionOverrides = {}
): GuideSection[] {
  return SECTION_TEMPLATE.map((s) => ({
    ...s,
    ...overrides[s.slug]
  }));
}

/**
 * Bangkok-specific tweaks. Anything not listed here uses the template
 * verbatim. These are real differences worth surfacing on the landing
 * page (e.g. "Eight neighborhoods" because we counted them).
 *
 * The `notionPageId` values come from the "Bangkok - The Freedom Hustle
 * Guide" parent page in Notion. Each child page's ID was captured via
 * scripts/notion-probe.mjs.
 */
const BANGKOK_SECTION_OVERRIDES: SectionOverrides = {
  "first-24-hours": {
    notionPageId: "41c57b19-7874-82d8-a0fc-81a76e3afe32"
  },
  "areas-to-stay": {
    notionPageId: "19757b19-7874-83f8-8ef4-01042223d5c8"
  },
  "monthly-budget": {
    notionPageId: "ac857b19-7874-8272-a9ac-817abd4eb90d"
  },
  "visa-immigration": {
    notionPageId: "c8857b19-7874-82ac-9e36-8163000015ff"
  },
  cafes: {
    notionPageId: "e0257b19-7874-827c-bde8-01a45090e104"
  },
  coworking: {
    notionPageId: "24f57b19-7874-8316-9134-81296fa6c75e"
  },
  restaurants: {
    notionPageId: "f8c57b19-7874-83e2-b583-81026df41457"
  },
  nightlife: {
    notionPageId: "55d57b19-7874-833c-bf83-818526bd6d10"
  },
  gyms: {
    notionPageId: "1e457b19-7874-83f0-8e85-819c82ed7813"
  },
  "getting-around": {
    notionPageId: "68457b19-7874-83d5-861a-817db24f8eaf"
  },
  "trips-and-activities": {
    notionPageId: "4bd57b19-7874-8270-8da1-81275a34360a"
  },
  "mistakes-to-avoid": {
    notionPageId: "93157b19-7874-822c-a41d-810992e78d2f"
  },
  "digital-nomad-toolkit": {
    notionPageId: "6d557b19-7874-837b-ac7b-015afb44ff64"
  }
};

const BANGKOK_SECTIONS = buildSections(BANGKOK_SECTION_OVERRIDES);

/**
 * Chiang Mai-specific tweaks. The `notionPageId` values come from the
 * "Master Chiang Mai - The Freedom Hustle Guide" parent page in Notion,
 * captured via scripts/notion-probe.mjs (master id
 * 37857b19-7874-81d5-b56b-f42a8603b3b9).
 */
const CHIANG_MAI_SECTION_OVERRIDES: SectionOverrides = {
  "first-24-hours": {
    notionPageId: "37857b19-7874-815d-b0f6-c59cda0ab6c2"
  },
  "visa-immigration": {
    notionPageId: "37857b19-7874-81c1-bc20-fb76c157940b"
  },
  "areas-to-stay": {
    notionPageId: "37857b19-7874-819f-aaf3-ccabbb12d9d5"
  },
  "monthly-budget": {
    notionPageId: "37857b19-7874-8185-af95-ff116f2fd435"
  },
  cafes: {
    notionPageId: "37857b19-7874-81c1-bc1a-ddfd6968b6ca"
  },
  coworking: {
    notionPageId: "37857b19-7874-8166-bf1a-eef353d2fed2"
  },
  restaurants: {
    notionPageId: "37857b19-7874-81af-b462-ce13adde1306"
  },
  nightlife: {
    notionPageId: "37857b19-7874-816d-877f-e68e0d2d6060"
  },
  gyms: {
    notionPageId: "37857b19-7874-81a2-b99b-d3c1848d40f9"
  },
  "getting-around": {
    notionPageId: "37857b19-7874-81f5-8cb9-f8fc6e96ce99"
  },
  "trips-and-activities": {
    notionPageId: "37857b19-7874-81f8-8a03-ff67ba20ead4"
  },
  "mistakes-to-avoid": {
    notionPageId: "37857b19-7874-8123-92ed-e16157895287"
  },
  "digital-nomad-toolkit": {
    notionPageId: "37857b19-7874-81d6-afaf-e7fe710be7bc"
  }
};

const CHIANG_MAI_SECTIONS = buildSections(CHIANG_MAI_SECTION_OVERRIDES);

/**
 * @deprecated Use `SECTION_TEMPLATE` directly, or call `buildSections()`
 * to get a fresh copy. Kept as an alias so older imports don't break.
 */
export const SHARED_SECTIONS_TEMPLATE = SECTION_TEMPLATE;


/**
 * Da Nang - Notion page IDs from the "Master Da Nang - The Freedom
 * Hustle Guide" tree Valeria authored via Claude Cowork.
 * Guide stays status:"soon" while Valeria writes; lifetime members can
 * preview the in-app pages before launch.
 */
const DA_NANG_SECTION_OVERRIDES: SectionOverrides = {
  "first-24-hours": { notionPageId: "39f57b19-7874-81b7-93ad-ddf129007262" },
  "areas-to-stay": { notionPageId: "39f57b19-7874-81f8-9a65-e798c53b184e" },
  "monthly-budget": { notionPageId: "39f57b19-7874-815a-b6b3-de7710a64fef" },
  cafes: { notionPageId: "39f57b19-7874-814e-8605-c28b84ca0b7f" },
  coworking: { notionPageId: "39f57b19-7874-81e2-a993-de69d9cf8df9" },
  restaurants: { notionPageId: "39f57b19-7874-8157-ab51-c6e5c90015ee" },
  nightlife: { notionPageId: "39f57b19-7874-81aa-b4d7-fe3cb29ffabb" },
  gyms: { notionPageId: "39f57b19-7874-81d4-9d5b-ea2b9c3c3d5c" },
  "visa-immigration": { notionPageId: "39f57b19-7874-81bc-b357-f40cc0d4a757" },
  "getting-around": { notionPageId: "39f57b19-7874-811b-b413-c5ead8b6ddf9" },
  "trips-and-activities": { notionPageId: "39f57b19-7874-81c6-b632-f7d25e4d9645" },
  "top-ten": { notionPageId: "39f57b19-7874-818a-96ff-d049dfc3dbc8" },
  "mistakes-to-avoid": { notionPageId: "39f57b19-7874-81e7-b930-dc3d8b7d7955" },
  "digital-nomad-toolkit": { notionPageId: "39f57b19-7874-8150-a8c4-c7891e907138" }
};

const DA_NANG_SECTIONS = buildSections(DA_NANG_SECTION_OVERRIDES);

export const GUIDES: GuideMeta[] = [
  {
    slug: "bangkok",
    title: "Freedom Hustle Guide to Bangkok",
    city: "Bangkok",
    country: "Thailand",
    flag: "🇹🇭",
    tagline:
      "Welcome to the Big Mango - excitement on every level, from street stalls to sky bars, golden temples at sunrise, rooftops at midnight, and the best street food on earth in between. The excitement starts here...",
    price: "£29",
    stripePriceId: process.env.STRIPE_PRICE_BANGKOK || null,
    status: "live",
    myMapsId: "14Gx_CAxOgKx5VuHQvQAWPM5qQQdMltI",
    heroImage:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=2400&q=80",
    cardImage:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "City energy + max convenience" },
      { label: "Monthly budget", value: "£1,200–£2,000+" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "BTS / MRT / Grab / Bolt" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Fast, social, convenient" }
    ],
    sections: BANGKOK_SECTIONS
  },
  {
    slug: "da-nang",
    title: "Freedom Hustle Guide to Da Nang",
    city: "Da Nang",
    country: "Vietnam",
    flag: "🇻🇳",
    tagline:
      "Vietnam's easiest life - beach mornings, mountain weekends, and a coffee scene that outclasses most capitals.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Blend of city + beach" },
      { label: "Monthly budget", value: "£900–£1,600+" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Grab / scooter / city airport" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Coastal, growing, friendly" }
    ],
    sections: DA_NANG_SECTIONS
  },
  {
    slug: "ubud",
    title: "Freedom Hustle Guide to Ubud",
    city: "Ubud",
    country: "Bali",
    flag: "🇮🇩",
    tagline:
      "Jungle mornings, rice-terrace walks and a green kind of quiet that rewires you.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Wellness + jungle slow living" },
      { label: "Monthly budget", value: "£1,000–£1,800" },
      { label: "Internet", value: "Patchy - plan for it" },
      { label: "Transport", value: "Scooter / Gojek / Grab" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Slow, green, spiritual" }
    ],
    sections: buildSections()
  },
  {
    slug: "chiang-mai",
    title: "Freedom Hustle Guide to Chiang Mai",
    city: "Chiang Mai",
    country: "Thailand",
    flag: "🇹🇭",
    tagline:
      "The mountain city that turns two-week trips into two-year stays - temples, coffee and cool air.",
    price: "£29",
    stripePriceId: process.env.STRIPE_PRICE_CHIANG_MAI || null,
    status: "live",
    heroImage:
      "https://images.pexels.com/photos/16986826/pexels-photo-16986826.jpeg?auto=compress&cs=tinysrgb&w=2400",
    cardImage:
      "https://images.pexels.com/photos/16986826/pexels-photo-16986826.jpeg?auto=compress&cs=tinysrgb&w=1400",
    quickStats: [
      { label: "Best for", value: "Nature, outdoors + long stays" },
      { label: "Monthly budget", value: "£1,000–£1,600" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Scooter / Grab / Bolt" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Chill, creative, low-key" }
    ],
    sections: CHIANG_MAI_SECTIONS
  },
  {
    slug: "koh-samui",
    title: "Freedom Hustle Guide to Koh Samui",
    city: "Koh Samui",
    country: "Thailand",
    flag: "🇹🇭",
    tagline:
      "Island life with the edges sanded off - palm roads, quiet coves and real comfort.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Island life without roughing it" },
      { label: "Monthly budget", value: "£1,000–£2,000" },
      { label: "Internet", value: "Good (area-dependent)" },
      { label: "Transport", value: "Scooter / Bolt / ferry + flights" },
      { label: "Difficulty", value: "Easy" },
      { label: "Vibe", value: "Tropical, slow, ocean-led" }
    ],
    sections: buildSections()
  },
  {
    slug: "kuala-lumpur",
    title: "Freedom Hustle Guide to Kuala Lumpur",
    city: "Kuala Lumpur",
    country: "Malaysia",
    flag: "🇲🇾",
    tagline:
      "Three cuisines deep and half the price of Singapore - Asia's most underrated big city.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "City comfort on a budget" },
      { label: "Monthly budget", value: "£1,000–£1,700" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "LRT / MRT / Grab" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Urban, multicultural, food-led" }
    ],
    sections: buildSections()
  },
  {
    slug: "seoul",
    title: "Freedom Hustle Guide to Seoul",
    city: "Seoul",
    country: "South Korea",
    flag: "🇰🇷",
    tagline:
      "A city moving at double speed - neon nights, mountain trails at the metro's end, and café culture done seriously.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Fast city + café culture" },
      { label: "Monthly budget", value: "£1,500–£3,000" },
      { label: "Internet", value: "World-class" },
      { label: "Transport", value: "Subway / Kakao T" },
      { label: "Difficulty", value: "Intermediate" },
      { label: "Vibe", value: "Fast, modern, intense" }
    ],
    sections: buildSections()
  },
  {
    slug: "tokyo",
    title: "Freedom Hustle Guide to Tokyo",
    city: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    tagline:
      "The city that does everything better - and still finds ways to surprise you on day ninety.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1741850826368-12d515927617?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Deep culture + big-city polish" },
      { label: "Monthly budget", value: "£2,000–£3,500" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "JR / Metro / IC card" },
      { label: "Difficulty", value: "Intermediate" },
      { label: "Vibe", value: "Layered, refined, hyper-organised" }
    ],
    sections: buildSections()
  },
  {
    slug: "phuket",
    title: "Freedom Hustle Guide to Phuket",
    city: "Phuket",
    country: "Thailand",
    flag: "🇹🇭",
    tagline:
      "Thailand's big island - fifty beaches, jungle viewpoints and sunsets that earn the hype.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Beach life + full infrastructure" },
      { label: "Monthly budget", value: "£1,000–£2,200" },
      { label: "Internet", value: "Good" },
      { label: "Transport", value: "Scooter / Grab / Bolt" },
      { label: "Difficulty", value: "Easy" },
      { label: "Vibe", value: "Tropical, polished, tourist-touched" }
    ],
    sections: buildSections()
  },
  {
    slug: "coron",
    title: "Freedom Hustle Guide to Coron",
    city: "Coron",
    country: "Philippines",
    flag: "🇵🇭",
    tagline:
      "Lagoons so blue they look edited - Palawan's wild, cinematic corner.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Island-hopping + diving" },
      { label: "Monthly budget", value: "£1,000–£1,700" },
      { label: "Internet", value: "Improving - plan for it" },
      { label: "Transport", value: "Tricycle / boats / domestic flights" },
      { label: "Difficulty", value: "Intermediate" },
      { label: "Vibe", value: "Wild, cinematic, remote" }
    ],
    sections: buildSections()
  },
  {
    slug: "el-nido",
    title: "Freedom Hustle Guide to El Nido",
    city: "El Nido",
    country: "Philippines",
    flag: "🇵🇭",
    tagline:
      "Karst cliffs, hidden beaches and island-hopping that ruins other beaches for you.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1728042880915-0dd755899018?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Lagoons + off-grid resets" },
      { label: "Monthly budget", value: "£1,000–£1,800" },
      { label: "Internet", value: "Patchy - SIM + backup" },
      { label: "Transport", value: "Tricycle / boats / domestic flights" },
      { label: "Difficulty", value: "Intermediate" },
      { label: "Vibe", value: "Wild, paradise, slow" }
    ],
    sections: buildSections()
  },
  {
    slug: "kyoto",
    title: "Freedom Hustle Guide to Kyoto",
    city: "Kyoto",
    country: "Japan",
    flag: "🇯🇵",
    tagline:
      "A thousand years of Japan within walking distance - temples, tea houses and streets that slow your pulse.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1558862107-d49ef2a04d72?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Temples, tradition + slow mornings" },
      { label: "Monthly budget", value: "£1,700–£3,000" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Bus / bike / JR" },
      { label: "Difficulty", value: "Intermediate" },
      { label: "Vibe", value: "Quiet, elegant, deep" }
    ],
    sections: buildSections()
  },
  {
    slug: "boracay",
    title: "Freedom Hustle Guide to Boracay",
    city: "Boracay",
    country: "Philippines",
    flag: "🇵🇭",
    tagline:
      "Four kilometres of powder-white sand and the friendliest sunsets in the Philippines.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1684419206253-3a934ec0bd6d?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Beach days + social nights" },
      { label: "Monthly budget", value: "£1,000–£1,800" },
      { label: "Internet", value: "Good (area-dependent)" },
      { label: "Transport", value: "E-trike / ferry + flights" },
      { label: "Difficulty", value: "Easy" },
      { label: "Vibe", value: "Tropical, social, sunset-led" }
    ],
    sections: buildSections()
  },
  {
    slug: "mirissa",
    title: "Freedom Hustle Guide to Mirissa",
    city: "Mirissa",
    country: "Sri Lanka",
    flag: "🇱🇰",
    tagline:
      "Whales at breakfast, surf at noon, Coconut Tree Hill at sunset - Sri Lanka's south at its sweetest.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1646894232861-a0ad84f1ad5d?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Surf + whale season" },
      { label: "Monthly budget", value: "£1,000–£1,500" },
      { label: "Internet", value: "Good in cafés" },
      { label: "Transport", value: "Scooter / tuk-tuk / PickMe" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Surf, chill, coastal" }
    ],
    sections: buildSections()
  },
  {
    slug: "canggu",
    title: "Freedom Hustle Guide to Canggu",
    city: "Canggu",
    country: "Bali",
    flag: "🇮🇩",
    tagline:
      "Surf before breakfast, smoothie bowls after - Bali's busiest little village of big plans.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1578724859357-7cbb8670ccdc?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Nomad scene + surf" },
      { label: "Monthly budget", value: "£1,000–£2,000" },
      { label: "Internet", value: "Very good" },
      { label: "Transport", value: "Scooter / Gojek / Grab" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Surf, café, cosmopolitan" }
    ],
    sections: buildSections()
  },
  {
    slug: "uluwatu",
    title: "Freedom Hustle Guide to Uluwatu",
    city: "Uluwatu",
    country: "Bali",
    flag: "🇮🇩",
    tagline:
      "Clifftop sunsets, world-class waves and temples hanging over the sea.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1664918706173-6349ca225dd0?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Surf + clifftop sunsets" },
      { label: "Monthly budget", value: "£1,000–£1,900" },
      { label: "Internet", value: "Very good" },
      { label: "Transport", value: "Scooter / Gojek / Grab" },
      { label: "Difficulty", value: "Easy" },
      { label: "Vibe", value: "Cliff, surf, sunset" }
    ],
    sections: buildSections()
  },
  {
    slug: "osaka",
    title: "Freedom Hustle Guide to Osaka",
    city: "Osaka",
    country: "Japan",
    flag: "🇯🇵",
    tagline:
      "Japan's kitchen and its loudest laugh - neon canyons, street food and zero pretension.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1571242352061-7611fbafbd42?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Street food + neon nights" },
      { label: "Monthly budget", value: "£1,600–£3,000" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Subway / JR" },
      { label: "Difficulty", value: "Intermediate" },
      { label: "Vibe", value: "Neon, food, playful" }
    ],
    sections: buildSections()
  },
  {
    slug: "hoi-an",
    title: "Freedom Hustle Guide to Hoi An",
    city: "Hoi An",
    country: "Vietnam",
    flag: "🇻🇳",
    tagline:
      "Lantern light on the river and an old town that glows after dark - Vietnam at its most romantic.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1526139334526-f591a54b477c?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Old-town charm + slow weeks" },
      { label: "Monthly budget", value: "£1,000–£1,500" },
      { label: "Internet", value: "Good" },
      { label: "Transport", value: "Bike / scooter / Grab" },
      { label: "Difficulty", value: "Easy" },
      { label: "Vibe", value: "Historic, lanterns, riverside" }
    ],
    sections: buildSections()
  },
  {
    slug: "krabi",
    title: "Freedom Hustle Guide to Krabi",
    city: "Krabi",
    country: "Thailand",
    flag: "🇹🇭",
    tagline:
      "Limestone towers, jungle trails and longtail rides to beaches with no roads.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Beaches + rock climbing" },
      { label: "Monthly budget", value: "£1,000–£1,700" },
      { label: "Internet", value: "Good" },
      { label: "Transport", value: "Scooter / Grab / longtail" },
      { label: "Difficulty", value: "Easy" },
      { label: "Vibe", value: "Cliff, beach, laid-back" }
    ],
    sections: buildSections()
  },
  {
    slug: "singapore",
    title: "Freedom Hustle Guide to Singapore",
    city: "Singapore",
    country: "Singapore",
    flag: "🇸🇬",
    tagline:
      "The future, air-conditioned - hawker food, garden towers and a city where everything simply works.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Speed, safety + business" },
      { label: "Monthly budget", value: "£2,500–£4,500" },
      { label: "Internet", value: "World-class" },
      { label: "Transport", value: "MRT / Grab" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Efficient, futuristic, expensive" }
    ],
    sections: buildSections()
  },
  {
    slug: "koh-phangan",
    title: "Freedom Hustle Guide to Koh Phangan",
    city: "Koh Phangan",
    country: "Thailand",
    flag: "🇹🇭",
    tagline:
      "The island of full moons and slow mornings - jungle, yoga and beaches that empty by ten.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1579211975029-8aa27c32fa75?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Yoga + beach community" },
      { label: "Monthly budget", value: "£1,000–£1,600" },
      { label: "Internet", value: "Improving" },
      { label: "Transport", value: "Scooter / songthaew / ferry" },
      { label: "Difficulty", value: "Easy" },
      { label: "Vibe", value: "Yoga, jungle, sunset" }
    ],
    sections: buildSections()
  },
  {
    slug: "hanoi",
    title: "Freedom Hustle Guide to Hanoi",
    city: "Hanoi",
    country: "Vietnam",
    flag: "🇻🇳",
    tagline:
      "A thousand years of street life - egg coffee, ancient alleys and motorbike ballet.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Café culture + street food" },
      { label: "Monthly budget", value: "£1,000–£1,500" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Scooter / Grab / Be" },
      { label: "Difficulty", value: "Intermediate" },
      { label: "Vibe", value: "Chaotic, romantic, historic" }
    ],
    sections: buildSections()
  },
  {
    slug: "gili-islands",
    title: "Freedom Hustle Guide to the Gili Islands",
    city: "Gili Islands",
    country: "Indonesia",
    flag: "🇮🇩",
    tagline:
      "No cars, no traffic lights, no hurry - three islands running on bicycle time.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1619681216575-d6b3964fc278?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Car-free island decompression" },
      { label: "Monthly budget", value: "£1,000–£1,600" },
      { label: "Internet", value: "Passable, café-dependent" },
      { label: "Transport", value: "Bike / cidomo / fast boat" },
      { label: "Difficulty", value: "Easy" },
      { label: "Vibe", value: "Sleepy, tropical, no-cars" }
    ],
    sections: buildSections()
  },
  {
    slug: "dubai",
    title: "Freedom Hustle Guide to Dubai",
    city: "Dubai",
    country: "UAE",
    flag: "🇦🇪",
    tagline:
      "A glass skyline out of the desert - beach mornings, souk evenings and a city built on ambition.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1635857161777-2383f2e4a82d?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Tax-friendly base + big-city polish" },
      { label: "Monthly budget", value: "£2,000–£4,500" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Metro / Careem / Uber" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Fast, polished, tax-friendly" }
    ],
    sections: buildSections()
  },
  {
    slug: "koh-tao",
    title: "Freedom Hustle Guide to Koh Tao",
    city: "Koh Tao",
    country: "Thailand",
    flag: "🇹🇭",
    tagline:
      "A dive licence, a scooter loop and sunsets from Sairee - island life at its simplest.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1688625548814-d7bb114d344e?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Diving + budget island life" },
      { label: "Monthly budget", value: "£1,000–£1,500" },
      { label: "Internet", value: "Good in town" },
      { label: "Transport", value: "Scooter / ferry" },
      { label: "Difficulty", value: "Easy" },
      { label: "Vibe", value: "Diving, island, low-key" }
    ],
    sections: buildSections()
  },
  {
    slug: "ho-chi-minh",
    title: "Freedom Hustle Guide to Ho Chi Minh City",
    city: "Ho Chi Minh City",
    country: "Vietnam",
    flag: "🇻🇳",
    tagline:
      "Eight million motorbikes and energy that never quits - Vietnam's engine room, heavily caffeinated.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1580835267732-2d232d3d2655?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Big-city hustle on a budget" },
      { label: "Monthly budget", value: "£1,000–£1,600" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Scooter / Grab / Be" },
      { label: "Difficulty", value: "Intermediate" },
      { label: "Vibe", value: "Energetic, cheap, food-led" }
    ],
    sections: buildSections()
  },
  {
    slug: "hiriketiya",
    title: "Freedom Hustle Guide to Hiriketiya",
    city: "Hiriketiya",
    country: "Sri Lanka",
    flag: "🇱🇰",
    tagline:
      "One horseshoe bay, one surf break, one perfect routine - Sri Lanka's slowest little town.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1752498227583-504500ef2122?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Surf + yoga in one bay" },
      { label: "Monthly budget", value: "£1,000–£1,500" },
      { label: "Internet", value: "Good in coworks" },
      { label: "Transport", value: "Scooter / tuk-tuk / PickMe" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Bay, surf, slow" }
    ],
    sections: buildSections()
  },
  {
    slug: "phi-phi-islands",
    title: "Freedom Hustle Guide to the Phi Phi Islands",
    city: "Phi Phi Islands",
    country: "Thailand",
    flag: "🇹🇭",
    tagline:
      "Cliffs rising straight from turquoise water - the island postcard that's real.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1531761535209-180857e963b9?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Boat days + beach nights" },
      { label: "Monthly budget", value: "£1,100–£1,900" },
      { label: "Internet", value: "Patchy - SIM + backup" },
      { label: "Transport", value: "Walking / longtail / ferry" },
      { label: "Difficulty", value: "Intermediate" },
      { label: "Vibe", value: "Turquoise, cliffs, party" }
    ],
    sections: buildSections()
  },
  {
    slug: "nara",
    title: "Freedom Hustle Guide to Nara",
    city: "Nara",
    country: "Japan",
    flag: "🇯🇵",
    tagline:
      "Sacred deer, giant Buddhas and Japan's first capital - an hour from Kyoto, a world quieter.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1550303435-1703d8811aaa?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Quiet culture + Kyoto next door" },
      { label: "Monthly budget", value: "£1,400–£2,500" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "JR / bus / bike" },
      { label: "Difficulty", value: "Intermediate" },
      { label: "Vibe", value: "Ancient, quiet, green" }
    ],
    sections: buildSections()
  },
  {
    slug: "seminyak",
    title: "Freedom Hustle Guide to Seminyak",
    city: "Seminyak",
    country: "Bali",
    flag: "🇮🇩",
    tagline:
      "Bali, polished - beach clubs, boutique villas and sunsets with table service.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1571984405176-5958bd9ac31d?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Beach clubs + polished comfort" },
      { label: "Monthly budget", value: "£1,200–£2,400" },
      { label: "Internet", value: "Very good" },
      { label: "Transport", value: "Scooter / Gojek / Grab" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Beach clubs, sunset, refined" }
    ],
    sections: buildSections()
  }
];

export function listGuides(): GuideMeta[] {
  return GUIDES;
}

/**
 * Soon guides with Notion content wired - the founders' work-in-progress
 * set. Lifetime members see these as "Preview" in My Guides while the
 * public still gets the waitlist.
 */
export function listPreviewGuides(): GuideMeta[] {
  return GUIDES.filter(
    (g) => g.status !== "live" && g.sections.some((sec) => sec.notionPageId)
  );
}

export function getGuide(slug: string): GuideMeta | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getSection(
  slug: string,
  sectionSlug: string
): GuideSection | undefined {
  return getGuide(slug)?.sections.find((s) => s.slug === sectionSlug);
}
