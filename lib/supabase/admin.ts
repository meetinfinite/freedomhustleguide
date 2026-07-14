import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin client. Uses the service-role key — bypasses RLS.
 * Use ONLY in API routes / webhooks / server actions, never in client code.
 */
let _admin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase admin requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  _admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return _admin;
}
