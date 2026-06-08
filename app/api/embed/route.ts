import { NextRequest, NextResponse } from "next/server";
import { getEmbedFromUrl } from "@/lib/embeds";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const title = req.nextUrl.searchParams.get("title") || undefined;
  const refresh = req.nextUrl.searchParams.get("refresh") === "1";
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  const embed = await getEmbedFromUrl(url, {
    fallbackTitle: title,
    forceRefresh: refresh
  });
  if (!embed) {
    return NextResponse.json({ ok: false, reason: "no-data" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, embed });
}
