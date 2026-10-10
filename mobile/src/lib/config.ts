/**
 * Build-time config. EXPO_PUBLIC_* values are inlined into the bundle -
 * only ever put public values here (the Supabase anon key is public; it's
 * already in the website's JS).
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || "https://freedomhustleguide.com").replace(/\/$/, "");

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const SUPPORT_EMAIL = "support@freedomhustleguide.com";
export const PRIVACY_URL = "https://freedomhustleguide.com/privacy";
export const TERMS_URL = "https://freedomhustleguide.com/terms";
