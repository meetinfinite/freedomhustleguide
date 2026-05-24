import fs from "node:fs";
import path from "node:path";

/**
 * MVP access verification.
 *
 * Resolution order:
 *  1. APPROVED_EMAILS env var (comma-separated, applies to all guides)
 *  2. /config/approvedEmails.json (per-guide list)
 *  3. Supabase `purchases` table (if NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set)
 *
 * Replace with Stripe / Lemon Squeezy / Memberstack webhook later — the public
 * surface (verifyAccess) stays the same.
 */

interface ApprovedFile {
  [guideSlug: string]: string[] | string;
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

function readJsonList(guideSlug: string): string[] {
  try {
    const filePath = path.join(
      process.cwd(),
      "config",
      "approvedEmails.json"
    );
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw) as ApprovedFile;
    const list = data[guideSlug];
    if (Array.isArray(list)) return list.map(normalize);
    return [];
  } catch {
    return [];
  }
}

function readEnvList(): string[] {
  const env = process.env.APPROVED_EMAILS;
  if (!env) return [];
  return env
    .split(",")
    .map((e) => normalize(e))
    .filter(Boolean);
}

async function checkSupabase(
  email: string,
  guideSlug: string
): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key, {
      auth: { persistSession: false }
    });
    const { data, error } = await supabase
      .from("purchases")
      .select("id")
      .eq("email", email)
      .eq("guide_slug", guideSlug)
      .eq("access_granted", true)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn("[access] supabase error:", error.message);
      return false;
    }
    return Boolean(data);
  } catch (err) {
    console.warn("[access] supabase check failed:", err);
    return false;
  }
}

export async function verifyAccess(
  rawEmail: string,
  guideSlug: string
): Promise<{ allowed: boolean; source: "env" | "json" | "supabase" | "none" }> {
  if (!rawEmail || !guideSlug)
    return { allowed: false, source: "none" };

  const email = normalize(rawEmail);

  const envList = readEnvList();
  if (envList.includes(email)) return { allowed: true, source: "env" };

  const jsonList = readJsonList(guideSlug);
  if (jsonList.includes(email)) return { allowed: true, source: "json" };

  const supaOk = await checkSupabase(email, guideSlug);
  if (supaOk) return { allowed: true, source: "supabase" };

  return { allowed: false, source: "none" };
}
