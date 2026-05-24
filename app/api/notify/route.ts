import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; city?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const city = (body.city || "").trim();
  const source = (body.source || "").trim() || null;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email." },
      { status: 400 }
    );
  }
  if (!city) {
    return NextResponse.json(
      { ok: false, error: "Missing city." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  try {
    const { error } = await supabase
      .from("waitlist")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({ email, city, source } as any);

    if (error) {
      // 23505 = unique violation = already on the list
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, alreadySubscribed: true });
      }

      // Anything else: log the entry so we don't lose it, but still
      // return success so the user has a clean UX.
      console.warn(
        "[notify] supabase insert failed:",
        error.message,
        error.code
      );
      console.warn(
        `[notify:fallback] ${JSON.stringify({ email, city, source, ts: Date.now() })}`
      );
      return NextResponse.json({ ok: true, alreadySubscribed: false });
    }

    return NextResponse.json({ ok: true, alreadySubscribed: false });
  } catch (err) {
    console.error("[notify] unexpected error", err);
    console.warn(
      `[notify:fallback] ${JSON.stringify({ email, city, source, ts: Date.now() })}`
    );
    return NextResponse.json({ ok: true, alreadySubscribed: false });
  }
}
