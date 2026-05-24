import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Magic-link landing. Supabase appends ?code=... when the user clicks the
 * email link. We exchange it for a session, set the cookie, then redirect
 * to wherever they were headed.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  if (!code) {
    return NextResponse.redirect(
      new URL("/?auth=missing-code", req.url)
    );
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.warn("[auth/callback] exchange failed:", error.message);
    return NextResponse.redirect(
      new URL(`/?auth=error&reason=${encodeURIComponent(error.message)}`, req.url)
    );
  }

  return NextResponse.redirect(new URL(next, req.url));
}
