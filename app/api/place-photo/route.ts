import { NextRequest } from "next/server";
import { fetchPlacePhoto } from "@/lib/places";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const photoName = req.nextUrl.searchParams.get("name");
  const maxWidth = Number(req.nextUrl.searchParams.get("w") || "800");
  if (!photoName) return new Response("Missing name", { status: 400 });

  const result = await fetchPlacePhoto(photoName, maxWidth);
  if (!result) return new Response("Not found", { status: 404 });

  return new Response(result.bytes, {
    headers: {
      "Content-Type": result.contentType,
      // Cache aggressively — these images don't change often
      "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable"
    }
  });
}
