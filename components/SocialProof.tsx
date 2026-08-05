/**
 * "Why trust these guides" — the honest replacement for the invented
 * testimonials that used to live here.
 *
 * Do NOT put reviews in this file. Real customer quotes only, with the
 * customer's permission, once there are real customers. Fabricated reviews
 * breach Meta's Community Standards (Fraud, scams and deceptive practices)
 * and UK consumer law (DMCC Act 2024) — they got the site's Instagram link
 * blocked once already.
 */

interface TrustPoint {
  title: string;
  body: string;
  icon: "map" | "camera" | "refresh";
}

const TRUST_POINTS: TrustPoint[] = [
  {
    title: "We lived in every city",
    body: "These aren't researched from a desk. We've spent months at a time in each city — the recommendations are the ones we actually use.",
    icon: "map"
  },
  {
    title: "Every place is one we've been to",
    body: "Cafés with plugs we've worked from, gyms we've trained at, neighbourhoods we've rented in. If we haven't been, it isn't in the guide.",
    icon: "camera"
  },
  {
    title: "Kept up to date",
    body: "Places close and prices change. We update the guides as we go, and you get every update — no re-buying a new edition.",
    icon: "refresh"
  }
];

export function SocialProof() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
          Why trust these guides
        </p>
        <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
          Written from the ground, not from a search engine.
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TRUST_POINTS.map((t) => (
          <div
            key={t.title}
            className="rounded-2xl bg-white border border-ink-100 shadow-card p-7 flex flex-col"
          >
            <Icon kind={t.icon} />
            <h3 className="font-display text-xl tracking-tight mt-4 mb-2 text-ink-900">
              {t.title}
            </h3>
            <p className="text-ink-700 leading-relaxed text-[15px]">{t.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Icon({ kind }: { kind: TrustPoint["icon"] }) {
  const paths: Record<TrustPoint["icon"], string> = {
    map: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z",
    camera:
      "M9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9zm3 15a5 5 0 110-10 5 5 0 010 10z",
    refresh:
      "M17.65 6.35A7.96 7.96 0 0012 4a8 8 0 108 8h-2a6 6 0 11-6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-7 h-7 text-electric-500"
      aria-hidden
    >
      <path d={paths[kind]} />
    </svg>
  );
}
