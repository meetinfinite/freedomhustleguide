import { router } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, fonts } from "../theme";

export function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = "dark",
  style
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "dark" | "terra" | "ghost";
  style?: ViewStyle;
}) {
  const bg = variant === "dark" ? colors.ink900 : variant === "terra" ? colors.terra500 : "transparent";
  const fg = variant === "ghost" ? colors.ink900 : colors.sand50;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        variant === "ghost" && styles.ghost,
        style
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>}
    </Pressable>
  );
}

/** Round floating back button for full-bleed screens. */
export function BackButton({ light, style }: { light?: boolean; style?: ViewStyle }) {
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={10}
      style={[styles.back, light ? styles.backLight : styles.backDark, style]}
    >
      <Text style={[styles.backIcon, { color: light ? colors.ink900 : colors.ink900 }]}>‹</Text>
    </Pressable>
  );
}

export function Centered({ children }: { children: ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Centered>
      <Text style={styles.errorTitle}>Couldn&apos;t load this</Text>
      <Text style={styles.errorText}>{message}</Text>
      <Button label="Try again" onPress={onRetry} style={{ marginTop: 16, paddingHorizontal: 28 }} />
    </Centered>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: 999, paddingVertical: 15, alignItems: "center", justifyContent: "center", minHeight: 52 },
  ghost: { borderWidth: 1, borderColor: colors.ink200 },
  buttonText: { fontFamily: fonts.sansSemi, fontSize: 16 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  backLight: { backgroundColor: "rgba(255,255,255,0.92)" },
  backDark: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ink100 },
  backIcon: { fontSize: 30, lineHeight: 32, marginTop: -3, marginLeft: -2 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  errorTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink900, marginBottom: 6 },
  errorText: { fontFamily: fonts.sans, fontSize: 15, color: colors.ink500, textAlign: "center", lineHeight: 22 }
});
