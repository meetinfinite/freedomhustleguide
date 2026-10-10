/**
 * App Store / Google Play links for the Freedom Hustle app (mobile/).
 *
 * While neither env var is set, the website behaves exactly as before
 * (pay-what-you-want on every guide). Once a store link is set in Vercel,
 * guide pages switch their CTA to "Download the app" - the app is where
 * people sign up and read every guide for free.
 */
export interface AppLinks {
  ios: string | null;
  android: string | null;
}

export function getAppLinks(): AppLinks | null {
  const ios = process.env.NEXT_PUBLIC_IOS_APP_URL?.trim() || null;
  const android = process.env.NEXT_PUBLIC_ANDROID_APP_URL?.trim() || null;
  return ios || android ? { ios, android } : null;
}
