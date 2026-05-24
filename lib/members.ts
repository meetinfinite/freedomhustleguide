import { getSupabaseAdmin } from "./supabase/admin";

export interface Member {
  id: string;
  email: string;
  lifetime: boolean;
  guides: string[];
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Look up a member by email. Returns null if not found.
 * Uses the admin client (bypasses RLS) — call only from server-side code.
 */
export async function getMember(email: string): Promise<Member | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error) {
    console.warn("[members] lookup error:", error.message);
    return null;
  }
  return (data as unknown as Member) || null;
}

/**
 * Decide whether the given email can access the given guide.
 * Lifetime members get everything. Single-guide buyers only their guide.
 */
export async function hasGuideAccess(
  email: string,
  guideSlug: string
): Promise<boolean> {
  const member = await getMember(email);
  if (!member) return false;
  if (member.lifetime) return true;
  return member.guides.includes(guideSlug);
}

/**
 * Upsert a member after a successful purchase.
 * - If product = "lifetime", set lifetime=true (and keep any existing guides)
 * - If product = "guide", add the guide slug to the guides[] array
 */
export async function grantPurchase(
  email: string,
  product: { kind: "lifetime" } | { kind: "guide"; slug: string },
  stripeCustomerId?: string | null
): Promise<Member> {
  const supabase = getSupabaseAdmin();
  const normalized = email.toLowerCase().trim();

  // Fetch existing if any
  const existing = await getMember(normalized);

  const lifetime =
    product.kind === "lifetime" ? true : existing?.lifetime ?? false;
  const guides =
    product.kind === "guide"
      ? Array.from(new Set([...(existing?.guides || []), product.slug]))
      : existing?.guides || [];

  const row = {
    email: normalized,
    lifetime,
    guides,
    stripe_customer_id: stripeCustomerId || existing?.stripe_customer_id || null
  };

  const { data, error } = await supabase
    .from("members")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(row as any, { onConflict: "email" })
    .select()
    .single();

  if (error) {
    console.error("[members] upsert failed:", error);
    throw new Error(`Failed to record purchase: ${error.message}`);
  }
  return data as unknown as Member;
}
