import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton, Button } from "../components/ui";
import { supabase } from "../lib/supabase";
import { colors, fonts, radius } from "../theme";

/**
 * Enter the emailed code. On success Supabase stores the session and the
 * root layout's guard swaps the user into the app automatically.
 */
export default function Verify() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);
  const input = useRef<TextInput>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const digits = code.replace(/\D/g, "");
  const ready = digits.length >= 6;

  async function verify(token = digits) {
    if (token.length < 6 || !email) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    setBusy(false);
    if (error)
      setError(
        /expired|invalid/i.test(error.message) ? "That code didn't work. Check it, or send a new one." : error.message
      );
  }

  async function resend() {
    if (!email) return;
    setError(null);
    setCooldown(60);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) setError(error.message);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.sand50 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.wrap}>
          <BackButton />
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.sub}>
            We sent a sign-in code to <Text style={{ fontFamily: fonts.sansSemi, color: colors.ink900 }}>{email}</Text>.
            Enter it below.
          </Text>

          <TextInput
            ref={input}
            value={code}
            // No auto-submit: Supabase's code length is a project setting
            // (6-10 digits), so we let the reader tap Continue.
            onChangeText={setCode}
            onSubmitEditing={() => verify()}
            autoFocus
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={10}
            placeholder="123456"
            placeholderTextColor={colors.ink300}
            style={styles.code}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Continue" onPress={() => verify()} loading={busy} disabled={!ready} />

          <Pressable onPress={resend} disabled={cooldown > 0} style={{ alignSelf: "center", padding: 10 }}>
            <Text style={[styles.resend, cooldown > 0 && { color: colors.ink400, textDecorationLine: "none" }]}>
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </Text>
          </Pressable>
          <Text style={styles.hint}>Can&apos;t see it? Check your spam or promotions folder.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24, paddingTop: 8, gap: 14 },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.ink900, marginTop: 18 },
  sub: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 23, color: colors.ink500 },
  code: {
    marginTop: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ink200,
    borderRadius: radius.lg,
    paddingVertical: 16,
    fontFamily: fonts.sansSemi,
    fontSize: 28,
    letterSpacing: 10,
    textAlign: "center",
    color: colors.ink900
  },
  error: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.dangerText },
  resend: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.terra600, textDecorationLine: "underline" },
  hint: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink400, textAlign: "center" }
});
