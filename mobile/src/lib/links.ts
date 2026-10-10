import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";

/**
 * Open an outbound link. Maps / Airbnb / Booking links go to the native
 * app when installed (Linking hands them to the OS); everything else opens
 * in an in-app browser sheet so the reader stays in the guide.
 */
const NATIVE_HOSTS =
  /(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|airbnb\.|abnb\.me|booking\.com|wa\.me|grab\.com)/i;

export async function openLink(url: string) {
  if (/^(mailto|tel):/i.test(url) || NATIVE_HOSTS.test(url)) {
    await Linking.openURL(url).catch(() => {});
    return;
  }
  await WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));
}
