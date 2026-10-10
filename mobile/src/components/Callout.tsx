import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "../theme";

type Kind = "warn" | "danger" | "tip" | "info";

const STYLES: Record<
  Kind,
  { bg: string; border: string; label: string; labelColor: string; icon: string; iconBg: string }
> = {
  warn: {
    bg: colors.warnBg,
    border: colors.warnBorder,
    label: "Heads up",
    labelColor: colors.warnText,
    icon: "⚠️",
    iconBg: "#ffedd5"
  },
  danger: {
    bg: colors.dangerBg,
    border: colors.dangerBorder,
    label: "Danger",
    labelColor: colors.dangerText,
    icon: "⛔",
    iconBg: "#fee2e2"
  },
  tip: {
    bg: colors.terra50,
    border: colors.terra100,
    label: "Pro tip",
    labelColor: colors.terra600,
    icon: "💡",
    iconBg: colors.terra100
  },
  info: {
    bg: colors.terra50,
    border: colors.terra100,
    label: "Good to know",
    labelColor: colors.terra600,
    icon: "ℹ️",
    iconBg: colors.terra100
  }
};

/** Native version of the website's WarningCard / ProTip. */
export function Callout({ kind, title, children }: { kind: Kind; title?: string; children?: ReactNode }) {
  const s = STYLES[kind];
  return (
    <View style={[styles.box, { backgroundColor: s.bg, borderColor: s.border }]}>
      <View style={[styles.icon, { backgroundColor: s.iconBg }]}>
        <Text style={{ fontSize: 18 }}>{s.icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        {kind === "tip" || kind === "info" ? (
          <Text style={[styles.label, { color: s.labelColor }]}>{s.label}</Text>
        ) : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
    marginVertical: 10
  },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  label: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" },
  title: { fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 21, color: colors.ink900 }
});
