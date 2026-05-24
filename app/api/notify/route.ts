import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

interface Entry {
  email: string;
  city: string;
  ts: number;
}

interface WaitlistFile {
  _note?: string;
  entries: Entry[];
}

const FILE_PATH = path.join(process.cwd(), "config", "waitlist.json");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function loadWaitlist(): Promise<WaitlistFile> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return JSON.parse(raw) as WaitlistFile;
  } catch {
    return { entries: [] };
  }
}

async function saveWaitlist(data: WaitlistFile): Promise<void> {
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
  let body: { email?: string; city?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const city = (body.city || "").trim();

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

  // Try the local-file path first. In serverless (Vercel) the FS is
  // read-only, so we fall back to logging the signup — Vercel captures
  // console logs and we can scrape them until a real ESP/DB is wired.
  try {
    const file = await loadWaitlist();
    const already = file.entries.find(
      (e) => e.email === email && e.city === city
    );
    if (!already) {
      file.entries.push({ email, city, ts: Date.now() });
      await saveWaitlist(file);
    }
    return NextResponse.json({ ok: true, alreadySubscribed: Boolean(already) });
  } catch (err) {
    // Serverless read-only FS — log the entry so we don't lose it,
    // and tell the user it worked so they have a clean UX.
    console.warn(
      `[notify:fallback] ${JSON.stringify({ email, city, ts: Date.now() })}`
    );
    return NextResponse.json({ ok: true, alreadySubscribed: false });
  }
}
