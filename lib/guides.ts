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
    slug: "overview",
    title: "Overview",
    description: "What the guide gets you in 60 seconds.",
    icon: "🧭",
    readingTime: "2 min"
  },
  {
    slug: "areas-to-stay",
    title: "Best Areas to Stay",
    description: "Neighbourhoods compared honestly. Where to actually live.",
    icon: "🏙️",
    readingTime: "8 min"
  },
  {
    slug: "first-24-hours",
    title: "First 24 Hours",
    description: "Airport to set-up. The exact order to do things in.",
    icon: "⏱️",
    readingTime: "5 min"
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
    description: "Transit, ride-shares, taxis — honest rankings.",
    icon: "🚇",
    readingTime: "4 min"
  },
  {
    slug: "scooter-reality-check",
    title: "Scooter Reality Check",
    description: "The honest version. Don't learn here.",
    icon: "🛵",
    readingTime: "3 min"
  },
  {
    slug: "weekend-trips",
    title: "Weekend Trips",
    description: "Trips out of the city ranked by how worth it they are.",
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
    slug: "resource-vault",
    title: "Resource Vault",
    description: "Every link you'll actually use.",
    icon: "🗂️",
    readingTime: "3 min"
  }
];

const BANGKOK_SECTIONS: GuideSection[] = [
  {
    slug: "overview",
    title: "Overview",
    description: "What this guide gets you in 60 seconds.",
    icon: "🧭",
    readingTime: "2 min"
  },
  {
    slug: "areas-to-stay",
    title: "Best Areas to Stay",
    description: "Eight neighborhoods compared. Where to actually live.",
    icon: "🏙️",
    readingTime: "8 min"
  },
  {
    slug: "first-24-hours",
    title: "First 24 Hours",
    description: "Airport to set-up. The exact order to do things in.",
    icon: "⏱️",
    readingTime: "5 min"
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
    description: "BTS, MRT, Grab, taxis — honest rankings.",
    icon: "🚇",
    readingTime: "4 min"
  },
  {
    slug: "scooter-reality-check",
    title: "Scooter Reality Check",
    description: "The honest version. Don't learn here.",
    icon: "🛵",
    readingTime: "3 min"
  },
  {
    slug: "weekend-trips",
    title: "Weekend Trips",
    description: "Ten trips ranked by how worth it they are.",
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
    slug: "resource-vault",
    title: "Resource Vault",
    description: "Every link you'll actually use.",
    icon: "🗂️",
    readingTime: "3 min"
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
    tagline: "Coming soon.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=1400&q=80",
    quickStats: [],
    sections: []
  },
  {
    slug: "chiang-mai",
    title: "Freedom Hustle Guide to Chiang Mai",
    city: "Chiang Mai",
    country: "Thailand",
    flag: "🇹🇭",
    tagline: "Coming soon.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=80",
    quickStats: [],
    sections: []
  },
  {
    slug: "koh-samui",
    title: "Freedom Hustle Guide to Koh Samui",
    city: "Koh Samui",
    country: "Thailand",
    flag: "🇹🇭",
    tagline: "Coming soon.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1400&q=80",
    quickStats: [],
    sections: []
  },
  {
    slug: "kuala-lumpur",
    title: "Freedom Hustle Guide to Kuala Lumpur",
    city: "Kuala Lumpur",
    country: "Malaysia",
    flag: "🇲🇾",
    tagline: "Coming soon.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1400&q=80",
    quickStats: [],
    sections: []
  },
  {
    slug: "da-nang",
    title: "Freedom Hustle Guide to Da Nang",
    city: "Da Nang",
    country: "Vietnam",
    flag: "🇻🇳",
    tagline: "Coming soon.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=80",
    quickStats: [],
    sections: []
  },
  {
    slug: "seoul",
    title: "Freedom Hustle Guide to Seoul",
    city: "Seoul",
    country: "South Korea",
    flag: "🇰🇷",
    tagline: "Coming soon.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1400&q=80",
    quickStats: [],
    sections: []
  },
  {
    slug: "tokyo",
    title: "Freedom Hustle Guide to Tokyo",
    city: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    tagline: "Coming soon.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=80",
    quickStats: [],
    sections: []
  },
  {
    slug: "phuket",
    title: "Freedom Hustle Guide to Phuket",
    city: "Phuket",
    country: "Thailand",
    flag: "🇹🇭",
    tagline: "Coming soon.",
    price: "£29",
    stripePriceId: null,
    status: "soon",
    heroImage: "",
    cardImage:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1400&q=80",
    quickStats: [],
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
