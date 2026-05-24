import { defineConfig, type Template } from "tinacms";

/**
 * TinaCMS schema for Freedom Hustle guides.
 *
 * Each MDX file in /content/guides/<slug>/*.mdx becomes an editable document.
 * The body is rich-text MDX with our custom components registered as templates
 * — those show up as drag-and-drop blocks with proper forms in the editor.
 */

// ---------------------------------------------------------------------------
// Component templates (one per custom MDX component)
// ---------------------------------------------------------------------------

const areaCardTemplate: Template = {
  name: "AreaCard",
  label: "Area Card",
  fields: [
    { name: "name", label: "Area name", type: "string", required: true },
    { name: "vibe", label: "Vibe (one line)", type: "string" },
    { name: "bestFor", label: "Best for", type: "string" },
    { name: "rent", label: "Rent / month", type: "string" },
    { name: "transport", label: "Transport", type: "string" },
    { name: "workScene", label: "Work scene", type: "string" },
    {
      name: "score",
      label: "Nomad score (0–10)",
      type: "number",
      ui: { validate: (v) => (v == null || (v >= 0 && v <= 10) ? undefined : "0–10") }
    },
    { name: "pros", label: "Pros", type: "string", list: true },
    { name: "cons", label: "Cons", type: "string", list: true },
    { name: "tags", label: "Tags", type: "string", list: true }
  ]
};

const budgetCardTemplate: Template = {
  name: "BudgetCard",
  label: "Budget Card",
  fields: [
    {
      name: "tier",
      label: "Tier",
      type: "string",
      options: ["Budget", "Comfortable", "Premium"],
      required: true
    },
    { name: "total", label: "Total (e.g. £900–£1,200)", type: "string" },
    { name: "description", label: "Description", type: "string", ui: { component: "textarea" } },
    { name: "highlight", label: "Highlight this tier", type: "boolean" },
    {
      name: "lines",
      label: "Line items",
      type: "object",
      list: true,
      ui: { itemProps: (item) => ({ label: item?.label || "Line item" }) },
      fields: [
        { name: "label", label: "Label", type: "string" },
        { name: "amount", label: "Amount", type: "string" }
      ]
    }
  ]
};

const cafeCardTemplate: Template = {
  name: "CafeCard",
  label: "Cafe Card",
  fields: [
    { name: "name", label: "Cafe name", type: "string", required: true },
    { name: "area", label: "Area", type: "string" },
    {
      name: "wifi",
      label: "WiFi",
      type: "string",
      options: ["Excellent", "Good", "Patchy"]
    },
    {
      name: "plugs",
      label: "Plugs",
      type: "string",
      options: ["Plenty", "Some", "Rare"]
    },
    {
      name: "noise",
      label: "Noise",
      type: "string",
      options: ["Quiet", "Moderate", "Loud"]
    },
    {
      name: "calls",
      label: "Good for calls?",
      type: "string",
      options: ["Yes", "Risky", "No"]
    },
    {
      name: "price",
      label: "Price",
      type: "string",
      options: ["$", "$$", "$$$"]
    },
    { name: "comfort", label: "Comfort / vibe notes", type: "string", ui: { component: "textarea" } },
    { name: "bestTime", label: "Best time to go", type: "string" },
    { name: "mapLink", label: "Google Maps link", type: "string" },
    { name: "tags", label: "Tags", type: "string", list: true }
  ]
};

const coworkingCardTemplate: Template = {
  name: "CoworkingCard",
  label: "Coworking Card",
  fields: [
    { name: "name", label: "Space name", type: "string", required: true },
    { name: "area", label: "Area", type: "string" },
    { name: "dayPass", label: "Day pass price", type: "string" },
    { name: "vibe", label: "Vibe", type: "string", ui: { component: "textarea" } },
    { name: "bestFor", label: "Best for", type: "string" },
    { name: "pros", label: "Pros", type: "string", list: true },
    { name: "cons", label: "Cons", type: "string", list: true },
    { name: "link", label: "Website link", type: "string" }
  ]
};

const gymCardTemplate: Template = {
  name: "GymCard",
  label: "Gym / Wellness Card",
  fields: [
    { name: "name", label: "Name", type: "string", required: true },
    {
      name: "type",
      label: "Type",
      type: "string",
      options: ["Commercial", "Muay Thai", "Yoga", "Wellness", "Condo"]
    },
    { name: "area", label: "Area", type: "string" },
    { name: "price", label: "Price", type: "string" },
    { name: "notes", label: "Notes", type: "string", ui: { component: "textarea" } },
    { name: "link", label: "Link", type: "string" }
  ]
};

const checklistTemplate: Template = {
  name: "Checklist",
  label: "Checklist (saves user progress)",
  fields: [
    {
      name: "id",
      label: "Unique ID (e.g. bangkok-first-24)",
      type: "string",
      required: true,
      description: "Used as the localStorage key. Don't change after publishing or users lose progress."
    },
    { name: "title", label: "Title", type: "string" },
    { name: "items", label: "Items", type: "string", list: true, required: true }
  ]
};

const warningCardTemplate: Template = {
  name: "WarningCard",
  label: "Warning / Callout",
  fields: [
    { name: "title", label: "Title", type: "string", required: true },
    {
      name: "severity",
      label: "Severity",
      type: "string",
      options: ["info", "warn", "danger"]
    },
    {
      name: "children",
      label: "Body",
      type: "rich-text",
      description: "Short callout body — supports formatting"
    }
  ]
};

const resourceCardTemplate: Template = {
  name: "ResourceCard",
  label: "Resource (external link)",
  fields: [
    { name: "title", label: "Title", type: "string", required: true },
    { name: "description", label: "Description", type: "string" },
    { name: "href", label: "URL", type: "string", required: true },
    { name: "category", label: "Category tag", type: "string" }
  ]
};

const tripCardTemplate: Template = {
  name: "TripCard",
  label: "Trip / Experience Card",
  fields: [
    { name: "name", label: "Name", type: "string", required: true },
    { name: "bestFor", label: "Best for", type: "string" },
    { name: "timeNeeded", label: "Time needed", type: "string" },
    { name: "cost", label: "Cost", type: "string" },
    {
      name: "worthIt",
      label: "Verdict",
      type: "string",
      options: ["Yes", "Maybe", "Skip"]
    },
    { name: "notes", label: "Notes", type: "string", ui: { component: "textarea" } },
    { name: "bookingLink", label: "Booking link (affiliate ok)", type: "string" }
  ]
};

const videoBlockTemplate: Template = {
  name: "VideoBlock",
  label: "Video Block",
  fields: [
    { name: "title", label: "Title", type: "string", required: true },
    { name: "description", label: "Description", type: "string" },
    { name: "url", label: "Video URL (YouTube / Loom)", type: "string" },
    { name: "duration", label: "Duration (e.g. 3:42)", type: "string" },
    { name: "poster", label: "Poster image URL", type: "image" }
  ]
};

const proTipTemplate: Template = {
  name: "ProTip",
  label: "Pro Tip",
  fields: [
    { name: "label", label: "Label (default: Pro tip)", type: "string" },
    { name: "children", label: "Tip body", type: "rich-text" }
  ]
};

const mapPlaceholderTemplate: Template = {
  name: "MapPlaceholder",
  label: "Map (placeholder)",
  fields: [
    { name: "label", label: "Map label", type: "string" },
    { name: "caption", label: "Caption", type: "string" }
  ]
};

const budgetCalculatorTemplate: Template = {
  name: "BudgetCalculator",
  label: "Budget Calculator (interactive)",
  fields: [
    {
      name: "_note",
      label: "Note",
      type: "string",
      description: "This block has no fields — it renders the interactive sliders.",
      ui: { component: () => null }
    }
  ]
};

const placeCardTemplate: Template = {
  name: "PlaceCard",
  label: "📍 Place (Google Maps URL)",
  fields: [
    {
      name: "url",
      label: "Google Maps URL",
      type: "string",
      required: true,
      description:
        "Paste any Google Maps link — short links (maps.app.goo.gl) work too. The card auto-fills name, photos, rating, and address from Google."
    },
    {
      name: "name",
      label: "Override name (optional)",
      type: "string",
      description: "Only set if you want a different label than Google's name."
    },
    {
      name: "ourRating",
      label: "Our rating (0–10)",
      type: "number",
      description:
        "Your personal score for nomads. Renders alongside Google's crowd rating. One decimal is fine (e.g. 9.2)."
    },
    {
      name: "ownPhotos",
      label: "Your photos",
      type: "image",
      list: true,
      description:
        "Your own photos of this place. Appear first in the carousel with an 'Original' badge. Drag to reorder. If empty, only Google's photos are shown."
    },
    {
      name: "loveLabel",
      label: "Your notes label",
      type: "string",
      description:
        "Heading above your bullet points. Defaults to 'Why we love this place' if left blank."
    },
    {
      name: "lovePoints",
      label: "Your bullet points",
      type: "string",
      list: true,
      description: "Why you like it. Keep each point short — these render as a list."
    }
  ]
};

const bodyTemplates: Template[] = [
  areaCardTemplate,
  budgetCardTemplate,
  cafeCardTemplate,
  coworkingCardTemplate,
  gymCardTemplate,
  checklistTemplate,
  warningCardTemplate,
  resourceCardTemplate,
  tripCardTemplate,
  videoBlockTemplate,
  proTipTemplate,
  mapPlaceholderTemplate,
  budgetCalculatorTemplate,
  placeCardTemplate
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export default defineConfig({
  branch:
    process.env.GITHUB_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "main",

  // Tina Cloud — leave null for local-only editing.
  // Once you sign up at app.tina.io, set these in .env.local and Vercel.
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  // Start the form sidebar collapsed on load — preview gets the full canvas
  // until the editor explicitly opens the form.
  cmsCallback: (cms) => {
    if (cms.sidebar) {
      (cms.sidebar as { hidden?: boolean }).hidden = true;
    }
    return cms;
  },

  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },

  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },

  schema: {
    collections: [
      {
        name: "section",
        label: "Guide Sections",
        path: "content/guides",
        format: "mdx",
        ui: {
          // Lets editors click "Open" and jump to the live (protected) page.
          // The protected app requires login, but the route maps cleanly.
          router: ({ document }) => {
            const parts = document._sys.relativePath.split("/");
            if (parts.length < 2) return undefined;
            const guideSlug = parts[0];
            const sectionSlug = parts[parts.length - 1].replace(/\.mdx?$/, "");
            return `/guides/${guideSlug}/app/${sectionSlug}`;
          },
          filename: {
            readonly: true
          }
        },
        fields: [
          {
            name: "title",
            label: "Section title",
            type: "string",
            isTitle: true,
            required: true
          },
          {
            name: "description",
            label: "Short description (appears under the title)",
            type: "string"
          },
          {
            name: "body",
            label: "Body",
            type: "rich-text",
            isBody: true,
            templates: bodyTemplates
          }
        ]
      }
    ]
  }
});
