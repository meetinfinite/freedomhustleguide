import { NextRequest, NextResponse } from "next/server";
import { getPlaceFromUrl } from "@/lib/places";

/**
 * Snapshot lookup for PlaceCards rendered outside Notion (MDX fallback).
 * Reads data/places.json only - never calls Google, so it can't be used
 * to run up a bill.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  const place = getPlaceFromUrl(url);
  if (!place) {
    return NextResponse.json({ ok: false, reason: "no-data" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, place });
}
