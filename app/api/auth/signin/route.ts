import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getMember } from "@/lib/members";

export const runtime = "nodejs";

interface SignInBody {
  email?: string;
  /** Optional next-path the user should land on after clicking the magic link */
  next?: string;
}

export async function POST(req: NextRequest) {
  let body: SignInBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const next = body.next || "/guides/bangkok/app";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email." },
      { status: 400 }
    );
  }

  // Only send the magic link to people who've actually bought something.
  // Prevents random sign-in attempts from filling Supabase Auth + spamming.
  const member = await getMember(email);
  if (!member) {
    return NextResponse.json(
      {
        error:
          "We can't find a purchase with that email. Use the email you bought with, or grab a guide first."
      },
      { status: 404 }
    );
  }

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host") || "freedomhustleguide.com";
  const redirectTo = `${proto}://${host}/auth/callback?next=${encodeURIComponent(next)}`;

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo
      }
    });
    if (error) {
      console.warn("[auth/signin] otp send failed:", error.message);
      return NextResponse.json(
        { error: "Could not send the sign-in email. Try again in a moment." },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/signin] unexpected error", err);
    return NextResponse.json(
      { error: "Could not send the sign-in email." },
      { status: 500 }
    );
  }
}
