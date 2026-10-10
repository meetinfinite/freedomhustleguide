import { Fraunces_500Medium, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../lib/auth";
import { colors } from "../theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
}

function RootStack() {
  const { session, loading } = useAuth();
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold
  });
  const ready = fontsLoaded && !loading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  const signedIn = Boolean(session);
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.sand50 } }}>
        {/* Sign up first - nothing inside the app is reachable without an account. */}
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="verify" />
        </Stack.Protected>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="index" />
          <Stack.Screen name="guide/[slug]/index" />
          <Stack.Screen name="guide/[slug]/[section]" />
          <Stack.Screen name="account" options={{ presentation: "modal" }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
