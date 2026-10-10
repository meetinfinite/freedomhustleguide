import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Button } from "../components/ui";
import { openLink } from "../lib/links";
import { PRIVACY_URL, REVIEW_EMAIL, TERMS_URL } from "../lib/config";
import { supabase } from "../lib/supabase";
import { colors, fonts, radius } from "../theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HERO = "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80";

/**
 * Sign-up gate. Name + email → Supabase emails a one-time code → verify.
 * Existing customers (web buyers) use the same email and land straight in.
 */
export default function Welcome() {
  const insets = useSafeAreaInsets();
  const [hasAccount, setHasAccount] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanEmail = email.trim().toLowerCase();
  const isReviewer = hasAccount && cleanEmail === REVIEW_EMAIL;
  const valid =
    EMAIL_RE.test(cleanEmail) && (hasAccount || name.trim().length > 0) && (!isReviewer || password.length > 0);

  async function submit() {
    if (!valid) return;
    setBusy(true);
    setError(null);
    if (isReviewer) {
      // Store review account only - see REVIEW_EMAIL.
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      setBusy(false);
      if (error) setError(error.message);
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
        // Only applied when the account is created.
        data: hasAccount ? undefined : { name: name.trim() }
      }
    });
    setBusy(false);
    if (error) {
      setError(
        /rate|limit/i.test(error.message) ? "Too many attempts - wait a few minutes and try again." : error.message
      );
      return;
    }
    router.push({ pathname: "/verify", params: { email: cleanEmail } });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.ink900 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />
      <Image source={{ uri: HERO }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={["rgba(15,14,10,0.15)", "rgba(15,14,10,0.55)", "rgba(15,14,10,0.95)"]}
        locations={[0, 0.4, 0.75]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <Image source={require("../../assets/splash-icon.png")} style={{ width: 34, height: 34 }} />
          <Text style={styles.brandText}>Freedom Hustle</Text>
        </View>

        <View style={{ flex: 1 }} />

        <Text style={styles.headline}>City guides for people who work from anywhere.</Text>
        <Text style={styles.sub}>
          Where to stay, work, eat and train - from people who actually lived there.{" "}
          {hasAccount ? "Welcome back." : "Sign up free to unlock every guide."}
        </Text>

        <View style={styles.form}>
          {!hasAccount ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="First name"
              placeholderTextColor={colors.ink400}
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="next"
              style={styles.input}
            />
          ) : null}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.ink400}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="go"
            onSubmitEditing={submit}
            style={styles.input}
          />
          {isReviewer ? (
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.ink400}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="go"
              onSubmitEditing={submit}
              style={styles.input}
            />
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            label={isReviewer ? "Sign in" : hasAccount ? "Email me a sign-in code" : "Create free account"}
            variant="terra"
            onPress={submit}
            loading={busy}
            disabled={!valid}
          />
          <Pressable onPress={() => setHasAccount((v) => !v)} hitSlop={8} style={{ alignSelf: "center", padding: 6 }}>
            <Text style={styles.switch}>
              {hasAccount ? "New here? Create an account" : "Already have an account? Sign in"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.legal}>
          By continuing you agree to our{" "}
          <Text style={styles.legalLink} onPress={() => openLink(TERMS_URL)}>
            Terms
          </Text>{" "}
          and{" "}
          <Text style={styles.legalLink} onPress={() => openLink(PRIVACY_URL)}>
            Privacy Policy
          </Text>
          .
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandText: { fontFamily: fonts.display, fontSize: 20, color: colors.sand50 },
  headline: { fontFamily: fonts.display, fontSize: 36, lineHeight: 41, color: colors.sand50, letterSpacing: -0.5 },
  sub: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 23, color: colors.sand200, marginTop: 12 },
  form: { marginTop: 26, gap: 12 },
  input: {
    backgroundColor: colors.sand50,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.ink900
  },
  error: { fontFamily: fonts.sansMedium, fontSize: 14, color: "#fca5a5" },
  switch: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.sand100, textDecorationLine: "underline" },
  legal: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: colors.ink300,
    textAlign: "center",
    marginTop: 18
  },
  legalLink: { textDecorationLine: "underline", color: colors.sand200 }
});
