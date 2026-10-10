import { NextRequest, NextResponse } from "next/server";
import { listGuides } from "@/lib/guides";
import { siteOrigin, toAppGuide } from "@/lib/appApi";

export const runtime = "nodejs";

/**
 * GET /api/app/guides - the guide library for the mobile app's home screen.
 * Public (it's the same info as the homepage); the content itself is behind
 * /api/app/guides/[slug]/[section], which needs a signed-in user.
 */
export async function GET(req: NextRequest) {
  const origin = siteOrigin(req);
  const guides = listGuides().map((g) => toAppGuide(g, origin));
  return NextResponse.json(
    { guides },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
