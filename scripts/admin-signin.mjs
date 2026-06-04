// Generates a magic-link URL for an email via Supabase's admin API and
// optionally grants that email lifetime access in the members table.
// Use when SMTP is borked, you've hit the rate limit, or you just need
// to log in as yourself fast.
//
// Usage:
//   node scripts/admin-signin.mjs you@example.com
//   node scripts/admin-signin.mjs you@example.com --no-grant  (just the link, no DB write)

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const email = args.find((a) => !a.startsWith("--"));
const skipGrant = args.includes("--no-grant");

if (!email) {
  console.error("Usage: node scripts/admin-signin.mjs you@example.com");
  process.exit(1);
}

const SITE_URL = "https://freedomhustleguide.com";
const normalizedEmail = email.toLowerCase().trim();

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log("→ Working on", normalizedEmail);

// 1. Grant lifetime access (so the gate doesn't kick you back to /access)
if (!skipGrant) {
  const { data: existing } = await supabase
    .from("members")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  const row = {
    email: normalizedEmail,
    lifetime: true,
    guides: existing?.guides ?? [],
    stripe_customer_id: existing?.stripe_customer_id ?? null
  };

  const { error } = await supabase
    .from("members")
    .upsert(row, { onConflict: "email" });

  if (error) {
    console.error("✗ Failed to upsert member row:", error.message);
    process.exit(1);
  }
  console.log("✓ Member row set to lifetime=true");
}

// 2. Generate a magic link directly — doesn't send an email
const { data, error } = await supabase.auth.admin.generateLink({
  type: "magiclink",
  email: normalizedEmail,
  options: {
    redirectTo: `${SITE_URL}/auth/callback?next=/my`
  }
});

if (error) {
  console.error("✗ generateLink failed:", error.message);
  process.exit(1);
}

const url = data?.properties?.action_link;
if (!url) {
  console.error("✗ No action_link returned. Response:", JSON.stringify(data));
  process.exit(1);
}

console.log("\n✓ Magic link (single-use, expires in ~1 hour):");
console.log("\n" + url + "\n");
console.log("Paste it into your browser and you'll land on /my signed in.");
