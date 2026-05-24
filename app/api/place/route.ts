import { NextRequest, NextResponse } from "next/server";
import { getPlaceFromUrl } from "@/lib/places";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const refresh = req.nextUrl.searchParams.get("refresh") === "1";
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  const place = await getPlaceFromUrl(url, { forceRefresh: refresh });
  if (!place) {
    return NextResponse.json(
      { ok: false, reason: "no-data" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true, place });
}
