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
   * section grid — one map per city, all categories colour-coded.
   */
  myMapsId?: string;
  heroImage: string;
  /** Square-ish image used on the homepage guide card. */
  cardImage: string;
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
 * section fields via buildSections() — e.g. Bangkok tightens "Best Areas
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
    description: "Airport to set-up. The exact order to do things in.",
    icon: "⏱️",
    readingTime: "5 min"
  },
  {
    slug: "areas-to-stay",
    title: "Best Areas to Stay",
    description: "Neighbourhoods compared honestly. Where to actually live.",
    icon: "🏙️",
    readingTime: "8 min"
  },
  {
    slug: "monthly-budget",
    title: "Monthly Budget",
    description: "Three real budget tiers + interactive calculator.",
    icon: "💸",
    readingTime: "6 min"
  },
  {
    slug: "cafes",
    title: "Cafés",
    description: "WiFi-tested, plug-checked, call-friendly.",
    icon: "☕",
    readingTime: "7 min"
  },
  {
    slug: "coworking",
    title: "Coworking Spaces",
    description: "Where it's worth it, where it's not.",
    icon: "🧑‍💻",
    readingTime: "5 min"
  },
  {
    slug: "restaurants",
    title: "Restaurants",
    description: "Real Thai food, expat favourites, the ones worth the trip.",
    icon: "🍜",
    readingTime: "6 min"
  },
  {
    slug: "nightlife",
    title: "Nightlife",
    description: "Rooftops, dive bars, dance floors — who they're for.",
    icon: "🍸",
    readingTime: "5 min"
  },
  {
    slug: "gyms",
    title: "Gyms & Wellness",
    description: "Strength, cardio, yoga, recovery — real prices.",
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
      "Transit, ride-shares, taxis, scooters — honest rankings plus the safety stuff nobody else says.",
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
      "Our tested apps, gear, banking, insurance and tools — the stack that actually works.",
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
 * cultural references). Don't use it to drift the structure — if you
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
 * The `notionPageId` values come from the "Bangkok — The Freedom Hustle
 * Guide" parent page in Notion. Each child page's ID was captured via
 * scripts/notion-probe.mjs.
 */
const BANGKOK_SECTION_OVERRIDES: SectionOverrides = {
  "first-24-hours": {
    notionPageId: "41c57b19-7874-82d8-a0fc-81a76e3afe32"
  },
  "areas-to-stay": {
    description: "Eight neighborhoods compared. Where to actually live.",
    notionPageId: "19757b19-7874-83f8-8ef4-01042223d5c8"
  },
  "monthly-budget": {
    notionPageId: "ac857b19-7874-8272-a9ac-817abd4eb90d"
  },
  "visa-immigration": {
    notionPageId: "c8857b19-7874-82ac-9e36-8163000015ff"
  },
  cafes: {
    description: "WiFi-tested, plug-checked, call-friendly.",
    notionPageId: "e0257b19-7874-827c-bde8-01a45090e104"
  },
  coworking: {
    notionPageId: "24f57b19-7874-8316-9134-81296fa6c75e"
  },
  restaurants: {
    description:
      "From street-stall legends to Michelin nods. What to skip on Sukhumvit.",
    notionPageId: "f8c57b19-7874-83e2-b583-81026df41457"
  },
  nightlife: {
    description:
      "Rooftops, dive bars, the night markets that aren't tourist traps.",
    notionPageId: "55d57b19-7874-833c-bf83-818526bd6d10"
  },
  gyms: {
    description: "Commercial, Muay Thai, yoga, massage. Real prices.",
    notionPageId: "1e457b19-7874-83f0-8e85-819c82ed7813"
  },
  "getting-around": {
    description:
      "BTS, MRT, Grab, taxis, scooters — honest rankings plus the safety stuff nobody else says.",
    notionPageId: "68457b19-7874-83d5-861a-817db24f8eaf"
  },
  "trips-and-activities": {
    description:
      "Trip gems and tourist traps. What's actually worth a weekend.",
    notionPageId: "4bd57b19-7874-8270-8da1-81275a34360a"
  },
  "mistakes-to-avoid": {
    notionPageId: "93157b19-7874-822c-a41d-810992e78d2f"
  },
  "digital-nomad-toolkit": {
    description:
      "Apps, gear, banking, insurance and tools we actually use day-to-day.",
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

export const GUIDES: GuideMeta[] = [
  {
    slug: "bangkok",
    title: "Freedom Hustle Guide to Bangkok",
    city: "Bangkok",
    country: "Thailand",
    flag: "🇹🇭",
    tagline:
      "Everything you need to confidently spend your first 30–90 days living and working remotely in Bangkok.",
    price: "£29",
    stripePriceId: process.env.STRIPE_PRICE_BANGKOK || null,
    status: "live",
    myMapsId: "14Gx_CAxOgKx5VuHQvQAWPM5qQQdMltI",
    heroImage:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=2400&q=80",
    cardImage:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "City nomads" },
      { label: "Monthly budget", value: "£1,000–£2,000" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "BTS / MRT / Grab" },
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
      "Everything you need to land in Vietnam's quietly-rising coastal city — beach mornings, real WiFi, and a coffee scene that beats most capitals.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Coastal nomads" },
      { label: "Monthly budget", value: "£700–£1,500" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Scooter / Grab / Be" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Coastal, growing, friendly" }
    ],
    sections: buildSections()
  },
  {
    slug: "ubud",
    title: "Freedom Hustle Guide to Ubud",
    city: "Ubud",
    country: "Bali",
    flag: "🇮🇩",
    tagline:
      "Everything you need to land in Ubud and turn jungle-side rice fields into a productive base — without the WiFi roulette.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Wellness nomads" },
      { label: "Monthly budget", value: "£800–£1,500" },
      { label: "Internet", value: "Patchy — plan for it" },
      { label: "Transport", value: "Scooter / Gojek" },
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
      "Everything you need to settle into the original digital nomad city — cheap, easy, and far calmer than Bangkok.",
    price: "£29",
    stripePriceId: process.env.STRIPE_PRICE_CHIANG_MAI || null,
    status: "live",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1582118315324-a1af6b1c0582?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Long-stay nomads" },
      { label: "Monthly budget", value: "£700–£1,400" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Scooter / Grab" },
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
      "Everything you need to make a tropical island actually work as a base — not just a holiday photo op.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Beach + work hybrids" },
      { label: "Monthly budget", value: "£1,000–£2,000" },
      { label: "Internet", value: "Good (area-dependent)" },
      { label: "Transport", value: "Scooter / Bolt" },
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
      "Everything you need to set up in Southeast Asia's most underrated city — fast internet, world-class food, half the cost of Singapore.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Infrastructure-first" },
      { label: "Monthly budget", value: "£800–£1,800" },
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
      "Everything you need to navigate Seoul's intensity and turn one of the fastest cities on earth into a real base.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Tech + design nomads" },
      { label: "Monthly budget", value: "£1,500–£3,000" },
      { label: "Internet", value: "World-class" },
      { label: "Transport", value: "Subway / KakaoT" },
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
      "Everything you need to live in Tokyo properly — neighbourhoods, work spots, transit, and the food places you'd never find on TikTok.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1741850826368-12d515927617?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Culture + design nomads" },
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
      "Everything you need to live in Phuket properly — beach mornings, real WiFi, and the parts of the island that aren't all tourist.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Beach + infrastructure" },
      { label: "Monthly budget", value: "£1,000–£2,200" },
      { label: "Internet", value: "Good" },
      { label: "Transport", value: "Scooter / Bolt" },
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
      "Everything you need to base yourself in Palawan's most cinematic corner — turquoise lagoons, karst cliffs, and enough WiFi to still get work done.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Island escapes" },
      { label: "Monthly budget", value: "£800–£1,600" },
      { label: "Internet", value: "Improving — plan for it" },
      { label: "Transport", value: "Tricycle / boat" },
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
      "Everything you need to turn El Nido into more than a bucket-list stop — real workable weeks between the Bacuit lagoon runs.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1728042880915-0dd755899018?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Nature-first nomads" },
      { label: "Monthly budget", value: "£900–£1,700" },
      { label: "Internet", value: "Patchy — SIM + backup" },
      { label: "Transport", value: "Tricycle / boat" },
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
      "Everything you need to live in Kyoto slowly — old-world neighbourhoods, refined cafés, and the temples locals actually go to.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1558862107-d49ef2a04d72?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Culture + design nomads" },
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
      "Everything you need to work from Boracay's White Beach without falling for the tourist strip — real cafés, real rentals, real weeks.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1567335991483-fc7088c63506?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Beach + work hybrids" },
      { label: "Monthly budget", value: "£900–£1,800" },
      { label: "Internet", value: "Good (area-dependent)" },
      { label: "Transport", value: "Tricycle / e-scooter" },
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
      "Everything you need to base in Sri Lanka's south coast surf town — palm-shaded cafés, whale season, and long slow mornings.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1646894232861-a0ad84f1ad5d?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Slow-travel nomads" },
      { label: "Monthly budget", value: "£700–£1,400" },
      { label: "Internet", value: "Good in cafés" },
      { label: "Transport", value: "Scooter / tuk-tuk" },
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
      "Everything you need to base in Bali's remote-work capital — cafés, coworking, surf breaks, and the parts of Canggu locals still love.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1578724859357-7cbb8670ccdc?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Nomad-hub regulars" },
      { label: "Monthly budget", value: "£1,000–£2,000" },
      { label: "Internet", value: "Very good" },
      { label: "Transport", value: "Scooter / Gojek" },
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
      "Everything you need to base in Bali's south — cliffs, sunset temples, world-class surf, and cafés built for the laptop crowd.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1664918706173-6349ca225dd0?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Surfers + creators" },
      { label: "Monthly budget", value: "£900–£1,800" },
      { label: "Internet", value: "Very good" },
      { label: "Transport", value: "Scooter / Gojek" },
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
      "Everything you need to make Osaka a base — Japan's warmest, loudest, most food-obsessed city, at half the pace of Tokyo.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1571242352061-7611fbafbd42?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Food + culture nomads" },
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
      "Everything you need to slow down in Vietnam's lantern-lit old town — historic riverside, real WiFi, and coffee-fuelled writing weeks.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1526139334526-f591a54b477c?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Writers + slow travellers" },
      { label: "Monthly budget", value: "£600–£1,300" },
      { label: "Internet", value: "Good" },
      { label: "Transport", value: "Bike / motorbike" },
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
      "Everything you need to live in Krabi properly — Railay's limestone cliffs, longtail boat runs, and a laptop-friendly town base.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Beach + climb" },
      { label: "Monthly budget", value: "£800–£1,600" },
      { label: "Internet", value: "Good" },
      { label: "Transport", value: "Scooter / songthaew" },
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
      "Everything you need to base in Southeast Asia's cleanest, fastest city — hawker food, world-class transit, and the best coworking scene in the region.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Global-hub nomads" },
      { label: "Monthly budget", value: "£2,500–£4,500" },
      { label: "Internet", value: "World-class" },
      { label: "Transport", value: "MRT" },
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
      "Everything you need to work from Phangan's quieter side — jungle mornings, sunset beach evenings, and yes, actual WiFi.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1579211975029-8aa27c32fa75?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Wellness + community" },
      { label: "Monthly budget", value: "£700–£1,500" },
      { label: "Internet", value: "Improving" },
      { label: "Transport", value: "Scooter" },
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
      "Everything you need to base in Hanoi's Old Quarter — chaotic, romantic, cheap, and quietly one of Asia's best café cities.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "City + coffee nomads" },
      { label: "Monthly budget", value: "£700–£1,500" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Grab / motorbike" },
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
      "Everything you need to slow-work on the Gilis — no cars, turquoise water, and mornings that start slow enough to actually think.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1619681216575-d6b3964fc278?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Disconnect + focus" },
      { label: "Monthly budget", value: "£800–£1,600" },
      { label: "Internet", value: "Passable, café-dependent" },
      { label: "Transport", value: "Bike / cidomo" },
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
      "Everything you need to base in Dubai without the Instagram version — real neighbourhoods, real cafés, and the tax + visa side that matters.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Founders + freelancers" },
      { label: "Monthly budget", value: "£2,000–£4,500" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Metro / taxi" },
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
      "Everything you need to base on Koh Tao — dive-focused mornings, laptop-friendly afternoons, and Thailand's most affordable island life.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1688625548814-d7bb114d344e?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Divers + budget nomads" },
      { label: "Monthly budget", value: "£600–£1,300" },
      { label: "Internet", value: "Good in town" },
      { label: "Transport", value: "Scooter" },
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
      "Everything you need to live in Saigon properly — District 1 to District 7, the coworking scene, and the food streets locals actually eat on.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1580835267732-2d232d3d2655?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Urban nomads" },
      { label: "Monthly budget", value: "£700–£1,500" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Grab / motorbike" },
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
      "Everything you need to base in Sri Lanka's horseshoe bay — surf mornings, yoga afternoons, and one of the best small nomad scenes on the south coast.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1752498227583-504500ef2122?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Surf + yoga nomads" },
      { label: "Monthly budget", value: "£700–£1,400" },
      { label: "Internet", value: "Good in coworks" },
      { label: "Transport", value: "Scooter / tuk-tuk" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Bay, surf, slow" }
    ],
    sections: buildSections()
  }
];

export function listGuides(): GuideMeta[] {
  return GUIDES;
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
