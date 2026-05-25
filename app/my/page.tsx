import Link from "next/link";
import { redirect } from "next/navigation";
import { listGuides } from "@/lib/guides";
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
  const unlocked = liveGuides.filter(
    (g) => ownsAll || ownedSlugs.has(g.slug)
  );
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
          Welcome back, {user.email.split("@")[0]}.
        </h1>
        <p className="text-ink-600 mt-3 text-lg">
          {ownsAll
            ? "You have lifetime access to every guide — current and future."
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

      {/* Upsell to lifetime (only if user is not lifetime) */}
      {!ownsAll ? (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="rounded-3xl bg-ink-900 text-sand-50 p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-grad opacity-60" />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-electric-300 font-semibold mb-3">
                  Upgrade
                </p>
                <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
                  Unlock every guide.{" "}
                  <span className="text-sand-300/80 line-through">£299</span>{" "}
                  <span className="text-sand-50">£79</span>
                </h2>
                <p className="text-sand-200 mt-3 leading-relaxed">
                  All current cities, every future city. One purchase. No
                  re-buys, no upgrades, no fuss. Use code{" "}
                  <span className="font-bold tracking-wider text-electric-300">
                    FREEDOM
                  </span>{" "}
                  at checkout.
                </p>
                <div className="mt-6">
                  <BuyButton
                    product="lifetime"
                    returnPath="/my"
                    customerEmail={user.email}
                    className="px-6 py-3 rounded-full bg-sand-50 text-ink-900 font-semibold hover:bg-white transition"
                  >
                    Get Lifetime →
                  </BuyButton>
                </div>
              </div>
              <ul className="space-y-2 text-sand-100 text-sm">
                {upgradable.slice(0, 4).map((g) => (
                  <li key={g.slug} className="flex items-center gap-2">
                    <span>{g.flag}</span>
                    <span>{g.city} — currently {g.price}</span>
                  </li>
                ))}
                {upcoming.slice(0, 3).map((g) => (
                  <li
                    key={g.slug}
                    className="flex items-center gap-2 text-sand-200/70"
                  >
                    <span>{g.flag}</span>
                    <span>{g.city} — coming soon, included</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

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
                    Buy — {g.price}
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
