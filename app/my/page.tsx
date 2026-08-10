import Link from "next/link";
import { redirect } from "next/navigation";
import { listGuides, listPreviewGuides } from "@/lib/guides";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMember } from "@/lib/members";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BuyButton } from "@/components/BuyButton";

export const dynamic = "force-dynamic";

export default async function MyDashboardPage() {
  const supabase = getSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/signin?next=/my");
  }

  const member = await getMember(user.email);
  const guides = listGuides();
  const liveGuides = guides.filter((g) => g.status === "live");
  const ownsAll = Boolean(member?.lifetime);
  const ownedSlugs = new Set(member?.guides || []);
  const unlocked = [
    ...liveGuides.filter((g) => ownsAll || ownedSlugs.has(g.slug)),
    // Founders see in-progress guides here too, badged "Preview".
    ...(ownsAll ? listPreviewGuides() : [])
  ];
  const upgradable = liveGuides.filter(
    (g) => !ownsAll && !ownedSlugs.has(g.slug)
  );
  const upcoming = guides.filter((g) => g.status === "soon");

  return (
    <main className="min-h-screen bg-sand-50">
      <SiteHeader />

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
          Your dashboard
        </p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
          {greetingName(user.email) ? (
            <>Welcome back, {greetingName(user.email)}.</>
          ) : (
            <>Welcome back.</>
          )}
        </h1>
        <p className="text-ink-600 mt-3 text-lg">
          {ownsAll
            ? "You have lifetime access to every guide - current and future."
            : `You own ${unlocked.length} ${
                unlocked.length === 1 ? "guide" : "guides"
              }. Click below to open or buy more.`}
        </p>
      </section>

      {/* Unlocked guides */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-6">
          Your guides
        </h2>
        {unlocked.length === 0 ? (
          <div className="rounded-2xl bg-white border border-ink-100 shadow-card p-8 text-center text-ink-600">
            You don't own any guides yet. Pick one below to get started.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {unlocked.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}/app`}
                className="group relative aspect-[4/5] rounded-3xl shadow-card hover:shadow-pop hover:-translate-y-0.5 transition transform-gpu [clip-path:inset(0_round_1.5rem)]"
              >
                {g.cardImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.cardImage}
                    alt={`${g.city}, ${g.country}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-ink-900/10" />
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-electric-500/95 backdrop-blur text-white">
                    Unlocked
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="flex items-center gap-2 text-sand-100/80 text-xs uppercase tracking-wider font-semibold mb-2">
                    <span className="text-base leading-none">{g.flag}</span>
                    <span>{g.country}</span>
                  </div>
                  <h3 className="font-display text-3xl sm:text-4xl tracking-tight text-sand-50 leading-none">
                    {g.city}
                  </h3>
                  <span className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sand-50 text-ink-900 text-sm font-semibold">
                    Open guide →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Lifetime upsell paused until the guide library is bigger
          (Valeria, 2026-08-05) - restore the dark Upgrade panel here. */}
      {/* Buy more individually (only if not lifetime, and there are upgradable singles) */}
      {!ownsAll && upgradable.length > 0 ? (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-6">
            Or buy individually
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upgradable.map((g) => (
              <div
                key={g.slug}
                className="relative aspect-[4/5] rounded-3xl shadow-card overflow-hidden"
              >
                {g.cardImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.cardImage}
                    alt={`${g.city}, ${g.country}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-ink-900/10" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="flex items-center gap-2 text-sand-100/80 text-xs uppercase tracking-wider font-semibold mb-2">
                    <span className="text-base leading-none">{g.flag}</span>
                    <span>{g.country}</span>
                  </div>
                  <h3 className="font-display text-3xl tracking-tight text-sand-50 leading-none mb-4">
                    {g.city}
                  </h3>
                  <BuyButton
                    product={g.slug}
                    returnPath="/my"
                    customerEmail={user.email}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-electric-500 text-white text-sm font-semibold shadow-card"
                  >
                    Buy - {g.price}
                  </BuyButton>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </main>
  );
}

/**
 * Best-effort first name from an email address, for the dashboard
 * greeting: "valeria.raduct90" → "Valeria", "ana.m.savu94" → "Ana".
 * Returns null when no plausible name is found (numeric or cryptic
 * handles), so the caller can fall back to a plain "Welcome back."
 */
function greetingName(email: string): string | null {
  const local = email.split("@")[0];
  // Split on common separators, strip digits from each token, and take
  // the first one that still looks like a name (3+ letters).
  for (const raw of local.split(/[._\-+]/)) {
    const word = raw.replace(/\d+/g, "");
    if (/^[a-zA-Z]{3,}$/.test(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
  }
  return null;
}
