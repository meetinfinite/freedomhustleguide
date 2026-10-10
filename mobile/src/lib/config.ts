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

/**
 * App Store / Google Play reviewers can't receive our emailed codes, so this
 * one account signs in with a password instead (set in Supabase, shared with
 * the stores in the review notes). Every other email uses the code.
 */
export const REVIEW_EMAIL = "appreview@freedomhustleguide.com";
