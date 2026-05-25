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
}

/**
 * Generic 13-section template used on coming-soon city landing pages so
 * waitlisters can see what they'll be getting. Copy is city-agnostic but
 * intentionally mirrors the shape of the live BANGKOK_SECTIONS so the
 * "What's inside" grid stays visually consistent across the catalogue.
 */
export const SHARED_SECTIONS_TEMPLATE: GuideSection[] = [
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
    title: "Cafes to Work From",
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
    slug: "gyms",
    title: "Gyms & Wellness",
    description: "Strength, cardio, yoga, recovery — real prices.",
    icon: "🥊",
    readingTime: "5 min"
  },
  {
    slug: "wifi-sim-apps",
    title: "WiFi / SIM / Apps",
    description: "Get connected in under an hour.",
    icon: "📶",
    readingTime: "4 min"
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

const BANGKOK_SECTIONS: GuideSection[] = [
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
    description: "Eight neighborhoods compared. Where to actually live.",
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
    title: "Cafes to Work From",
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
    slug: "gyms",
    title: "Gyms & Wellness",
    description: "Commercial, Muay Thai, yoga, massage. Real prices.",
    icon: "🥊",
    readingTime: "5 min"
  },
  {
    slug: "wifi-sim-apps",
    title: "WiFi / SIM / Apps",
    description: "Get connected in under an hour.",
    icon: "📶",
    readingTime: "4 min"
  },
  {
    slug: "getting-around",
    title: "Getting Around",
    description:
      "BTS, MRT, Grab, taxis, scooters — honest rankings plus the safety stuff nobody else says.",
    icon: "🚇",
    readingTime: "6 min"
  },
  {
    slug: "trips-and-activities",
    title: "Trips & Activities",
    description: "Trip gems and tourist traps. What's actually worth a weekend.",
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
      "Apps, gear, banking, insurance and tools we actually use day-to-day.",
    icon: "🧰",
    readingTime: "4 min"
  }
];

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
    progressLabel: "In progress",
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
    sections: []
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
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Long-stay nomads" },
      { label: "Monthly budget", value: "£700–£1,400" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "Scooter / Grab" },
      { label: "Difficulty", value: "Beginner-friendly" },
      { label: "Vibe", value: "Chill, creative, low-key" }
    ],
    sections: []
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
    sections: []
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
    sections: []
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
    sections: []
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
    sections: []
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
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=80",
    quickStats: [
      { label: "Best for", value: "Culture + design nomads" },
      { label: "Monthly budget", value: "£2,000–£3,500" },
      { label: "Internet", value: "Excellent" },
      { label: "Transport", value: "JR / Metro / IC card" },
      { label: "Difficulty", value: "Intermediate" },
      { label: "Vibe", value: "Layered, refined, hyper-organised" }
    ],
    sections: []
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
    sections: []
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
