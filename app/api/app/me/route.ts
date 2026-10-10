import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getMember } from "@/lib/members";
import { getAppUser } from "@/lib/appApi";
import { notifyWaitlist } from "@/lib/slack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/app/me - called by the app right after sign-in. Makes sure the
 * user has a `members` row (so they're a real customer record, and the web
 * /signin page recognises them too) and pings Slack on a first sign-up.
 * Never touches an existing row's purchases.
 */
export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const existing = await getMember(user.email);
  if (!existing) {
    const { error } = await getSupabaseAdmin()
      .from("members")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({ email: user.email, lifetime: false, guides: [] } as any);
    // 23505 = another request created it first; anything else is logged
    // but doesn't block the app - access doesn't depend on this row.
    if (error && error.code !== "23505") {
      console.error("[app/me] member insert failed:", error.message);
    } else if (!error) {
      await notifyWaitlist({
        city: "App sign-up",
        email: user.name ? `${user.name} <${user.email}>` : user.email,
        source: "mobile app"
      });
    }
  }

  return NextResponse.json({ email: user.email, name: user.name });
}

/**
 * DELETE /api/app/me - in-app account deletion (required by the App Store
 * for any app that lets people create an account). Removes the Supabase
 * auth user and their members row. Payments already made stay in Stripe.
 */
export async function DELETE(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const admin = getSupabaseAdmin();
  const { error: memberErr } = await admin.from("members").delete().eq("email", user.email);
  if (memberErr) console.error("[app/me] member delete failed:", memberErr.message);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[app/me] auth delete failed:", error.message);
    return NextResponse.json({ error: "Couldn't delete your account. Email support@freedomhustleguide.com." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
