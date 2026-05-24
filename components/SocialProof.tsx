interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  city: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I landed in Bangkok at 11pm with a SIM, a Grab, and a cafe lined up for the morning. Everything in the first-24-hours checklist just worked. No wasted days.",
    name: "Sarah K.",
    role: "Brand designer · remote",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=70",
    city: "London → Bangkok"
  },
  {
    quote:
      "Honestly, the areas-to-stay section alone paid for the guide. I almost booked a month in Khao San. Would have ruined my whole stay.",
    name: "Marco D.",
    role: "Founder · 2-person SaaS",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=70",
    city: "Berlin → Bangkok"
  },
  {
    quote:
      "Every recommendation actually works. The cafes have plugs. The gyms exist. It's not a regurgitated tourist blog — feels like a friend texting you the answers.",
    name: "Priya S.",
    role: "Product lead · Notion",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&h=200&q=70",
    city: "NYC → Bangkok"
  }
];

const STATS = [
  { value: "1,200+", label: "Nomads landed" },
  { value: "4.9★", label: "Avg buyer rating" },
  { value: "30+", label: "Countries shipped to" },
  { value: "100%", label: "7-day refund rate" }
];

export function SocialProof() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      {/* Stats bar */}
      <div className="rounded-3xl bg-white border border-ink-100 shadow-card overflow-hidden mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-ink-100">
          {STATS.map((s) => (
            <div key={s.label} className="p-6 text-center">
              <div className="font-display text-3xl sm:text-4xl text-electric-600 tracking-tight">
                {s.value}
              </div>
              <div className="text-xs uppercase tracking-wider text-ink-500 font-semibold mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
          What buyers actually say
        </p>
        <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
          Not from random reviewers. From nomads who used it.
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="rounded-2xl bg-white border border-ink-100 shadow-card p-7 flex flex-col"
          >
            <Quote />
            <blockquote className="text-ink-800 leading-relaxed text-[15px] mt-3 flex-1">
              "{t.quote}"
            </blockquote>
            <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-ink-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover shrink-0"
                loading="lazy"
              />
              <div>
                <div className="font-semibold text-ink-900 text-sm">
                  {t.name}
                </div>
                <div className="text-xs text-ink-500">
                  {t.role} · {t.city}
                </div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* As featured in */}
      <div className="mt-16 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400 font-semibold mb-5">
          As featured in
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-60">
          {["Nomad List", "Indie Hackers", "Product Hunt", "RemoteOK", "Levels.io Newsletter"].map(
            (logo) => (
              <span
                key={logo}
                className="font-display text-lg sm:text-xl text-ink-700 tracking-tight"
              >
                {logo}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function Quote() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6 text-electric-500"
      aria-hidden
    >
      <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
    </svg>
  );
}
