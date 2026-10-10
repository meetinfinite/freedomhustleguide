/**
 * Shapes returned by the website's app API. Mirrors lib/appApi.ts,
 * lib/notion.ts, lib/places.ts and lib/embeds.ts in the web repo - keep in
 * sync if those change.
 */

export interface AppGuide {
  slug: string;
  city: string;
  country: string;
  region?: string;
  flag: string;
  tagline: string;
  status: "live" | "soon";
  cardImage: string;
  heroImage: string;
  quickStats: { label: string; value: string }[];
  sections: AppSection[];
}

export interface AppSection {
  slug: string;
  title: string;
  description: string;
  icon: string;
  readingTime: string;
}

export interface NotionRichText {
  plain_text?: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
  };
}

export interface NotionBlock {
  id: string;
  type: string;
  data: unknown;
  hasChildren: boolean;
  children?: NotionBlock[];
}

export interface PlaceData {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  photos: { src: string; author?: string; authorUri?: string }[];
  googleMapsUri: string;
}

export interface EmbedData {
  kind: "airbnb" | "getyourguide" | "booking";
  url: string;
  title: string;
  subtitle?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  price?: string;
  details?: string;
}

export interface SectionResponse {
  section: {
    slug: string;
    icon: string;
    readingTime: string;
    title: string;
    description: string | null;
  };
  page: {
    id: string;
    blocks: NotionBlock[];
    places: Record<string, PlaceData>;
    embeds: Record<string, EmbedData>;
  };
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}
