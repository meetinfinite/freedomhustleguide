import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton, Centered, ErrorState } from "../../../components/ui";
import { useGuides } from "../../../lib/api";
import { colors, fonts, radius, shadow } from "../../../theme";

/** Guide overview: hero, quick stats, then every section. */
export default function GuideScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { data, error, loading, reload } = useGuides();
  const guide = data?.find((g) => g.slug === slug);
  // Past the hero, show a solid status-bar strip with dark text.
  const [pastHero, setPastHero] = useState(false);

  if (!guide) {
    if (error) return <ErrorState message={error} onRetry={reload} />;
    return (
      <Centered>
        {loading ? <ActivityIndicator color={colors.terra500} /> : <Text style={styles.muted}>Guide not found.</Text>}
      </Centered>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.sand50 }}>
      <StatusBar style={pastHero ? "dark" : "light"} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        scrollEventThrottle={32}
        onScroll={(e) => setPastHero(e.nativeEvent.contentOffset.y > HERO_HEIGHT - insets.top)}
      >
        <View style={styles.hero}>
          <Image
            source={{ uri: guide.heroImage }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={["rgba(15,14,10,0.35)", "transparent", "rgba(15,14,10,0.9)"]}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />
          <BackButton light style={{ position: "absolute", top: insets.top + 8, left: 16 }} />
          <View style={styles.heroBody}>
            <Text style={styles.eyebrow}>
              {guide.flag} {guide.region ? `${guide.region}, ${guide.country}` : guide.country}
            </Text>
            <Text style={styles.title}>{guide.city}</Text>
          </View>
        </View>

        <View style={styles.pad}>
          <Text style={styles.tagline}>{guide.tagline}</Text>

          {guide.quickStats.length ? (
            <View style={styles.stats}>
              {guide.quickStats.map((s) => (
                <View key={s.label} style={styles.stat}>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text style={styles.sectionsTitle}>Inside the guide</Text>
          <View style={{ gap: 10 }}>
            {guide.sections.map((s, i) => (
              <Pressable
                key={s.slug}
                onPress={() => router.push(`/guide/${guide.slug}/${s.slug}`)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
              >
                <View style={styles.icon}>
                  <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowNum}>
                    {String(i + 1).padStart(2, "0")} · {s.readingTime}
                  </Text>
                  <Text style={styles.rowTitle}>{s.title}</Text>
                  <Text style={styles.rowDesc} numberOfLines={2}>
                    {s.description}
                  </Text>
                </View>
                <Text style={styles.chev}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
      {pastHero ? <View style={[styles.statusFill, { height: insets.top }]} /> : null}
    </View>
  );
}

const HERO_HEIGHT = 360;

const styles = StyleSheet.create({
  statusFill: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: colors.sand50 },
  muted: { fontFamily: fonts.sans, color: colors.ink500 },
  hero: { height: HERO_HEIGHT, backgroundColor: colors.ink900 },
  heroBody: { position: "absolute", left: 20, right: 20, bottom: 22 },
  eyebrow: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.terra300
  },
  title: { fontFamily: fonts.display, fontSize: 46, color: colors.sand50, letterSpacing: -0.6 },
  pad: { paddingHorizontal: 20 },
  tagline: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.ink600, marginTop: 20 },
  stats: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10, marginTop: 20 },
  stat: {
    width: "48.5%",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink100,
    padding: 12
  },
  statLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 10.5,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.ink400
  },
  statValue: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 19, color: colors.ink900, marginTop: 3 },
  sectionsTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.ink900, marginTop: 30, marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink100,
    padding: 14,
    ...shadow
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.sand100,
    alignItems: "center",
    justifyContent: "center"
  },
  rowNum: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 0.6, color: colors.terra600 },
  rowTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink900, marginTop: 1 },
  rowDesc: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.ink500, marginTop: 2 },
  chev: { fontSize: 26, color: colors.ink300 }
});
