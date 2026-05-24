import { NextRequest, NextResponse } from "next/server";
import { verifyAccess } from "@/lib/access";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: string; guideSlug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email || "").trim();
  const guideSlug = (body.guideSlug || "").trim();

  if (!email || !guideSlug) {
    return NextResponse.json(
      { error: "Email and guide are required." },
      { status: 400 }
    );
  }

  // Tiny rate guard: artificial delay so brute-force is annoying.
  await new Promise((r) => setTimeout(r, 400));

  const { allowed, source } = await verifyAccess(email, guideSlug);

  if (!allowed) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Access not found. Please use the email you purchased with."
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    ok: true,
    source,
    // Plain string for MVP. Swap to JWT when you bolt on real auth.
    token: Buffer.from(`${email}:${guideSlug}`).toString("base64")
  });
}
