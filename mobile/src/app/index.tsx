import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "../components/ui";
import { fetchGuides, useGuides } from "../lib/api";
import { useFirstName } from "../lib/auth";
import type { AppGuide } from "../lib/types";
import { colors, fonts, radius, shadow } from "../theme";

/** Home: every guide. Live ones open; soon ones show as coming soon. */
export default function Home() {
  const insets = useSafeAreaInsets();
  const firstName = useFirstName();
  const { data, error, loading, reload } = useGuides();
  const [query, setQuery] = useState("");

  const { featured, live, soon } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (g: AppGuide) => !q || [g.city, g.country, g.region].some((v) => v?.toLowerCase().includes(q));
    const all = (data || []).filter(match);
    const live = all.filter((g) => g.status === "live" && g.sections.length > 0);
    return {
      featured: q ? null : (live[0] ?? null),
      live: q ? live : live.slice(1),
      soon: all.filter((g) => g.status !== "live")
    };
  }, [data, query]);

  if (!data && error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.sand50 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.sand50 }}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={loading && Boolean(data)}
            onRefresh={() => {
              fetchGuides(true).finally(reload);
            }}
          />
        }
      >
        <View style={styles.topbar}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Image source={require("../../assets/splash-icon.png")} style={{ width: 20, height: 20 }} />
            </View>
            <Text style={styles.brandText}>Freedom Hustle</Text>
          </View>
          <Pressable onPress={() => router.push("/account")} accessibilityLabel="Account" style={styles.avatar}>
            <Text style={styles.avatarText}>{(firstName || "?").charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={styles.pad}>
          <Text style={styles.hello}>{firstName ? `Hi ${firstName},` : "Hi there,"}</Text>
          <Text style={styles.headline}>Where are you heading next?</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search a city or country"
            placeholderTextColor={colors.ink400}
            style={styles.search}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>

        {!data && loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.terra500} /> : null}

        {featured ? (
          <Pressable style={[styles.featured, styles.padM]} onPress={() => router.push(`/guide/${featured.slug}`)}>
            <Image
              source={{ uri: featured.heroImage }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
            />
            <LinearGradient colors={["transparent", "rgba(15,14,10,0.85)"]} style={StyleSheet.absoluteFill} />
            <View style={styles.featuredBody}>
              <Text style={styles.featuredEyebrow}>
                {featured.flag} {featured.region || featured.country}
              </Text>
              <Text style={styles.featuredTitle}>{featured.city}</Text>
              <Text style={styles.featuredTagline} numberOfLines={2}>
                {featured.tagline}
              </Text>
              <View style={styles.featuredCta}>
                <Text style={styles.featuredCtaText}>Open guide →</Text>
              </View>
            </View>
          </Pressable>
        ) : null}

        {live.length ? (
          <>
            <Text style={[styles.sectionTitle, styles.pad]}>{query ? "Guides" : "More guides"}</Text>
            <View style={[styles.grid, styles.pad]}>
              {live.map((g) => (
                <GuideTile key={g.slug} guide={g} />
              ))}
            </View>
          </>
        ) : null}

        {soon.length ? (
          <>
            <Text style={[styles.sectionTitle, styles.pad]}>Coming soon</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {soon.map((g) => (
                <View key={g.slug} style={styles.soon}>
                  <Image source={{ uri: g.cardImage }} style={styles.soonImg} contentFit="cover" transition={200} />
                  <View style={styles.soonPill}>
                    <Text style={styles.soonPillText}>Soon</Text>
                  </View>
                  <Text style={styles.soonCity} numberOfLines={1}>
                    {g.flag} {g.city}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </>
        ) : null}

        {data && query && !live.length && !soon.length && !featured ? (
          <Text style={[styles.empty, styles.pad]}>No guides match “{query}” yet.</Text>
        ) : null}
      </ScrollView>
      {/* Solid strip behind the status bar so content doesn't scroll under the clock. */}
      <View style={[styles.statusFill, { height: insets.top }]} />
    </View>
  );
}

function GuideTile({ guide }: { guide: AppGuide }) {
  return (
    <Pressable style={styles.tile} onPress={() => router.push(`/guide/${guide.slug}`)}>
      <Image source={{ uri: guide.cardImage }} style={styles.tileImg} contentFit="cover" transition={200} />
      <View style={{ padding: 12 }}>
        <Text style={styles.tileCity} numberOfLines={1}>
          {guide.city}
        </Text>
        <Text style={styles.tileCountry} numberOfLines={1}>
          {guide.flag} {guide.region || guide.country}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  statusFill: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: colors.sand50 },
  padM: { marginHorizontal: 20 },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 18
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.terra500,
    alignItems: "center",
    justifyContent: "center"
  },
  brandText: { fontFamily: fonts.display, fontSize: 18, color: colors.ink900 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ink900,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: { fontFamily: fonts.sansSemi, color: colors.sand50, fontSize: 15 },
  hello: { fontFamily: fonts.sans, fontSize: 16, color: colors.ink500 },
  headline: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    color: colors.ink900,
    marginTop: 2,
    letterSpacing: -0.4
  },
  search: {
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ink100,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink900
  },
  featured: { height: 380, borderRadius: radius.xl, overflow: "hidden", backgroundColor: colors.ink900, ...shadow },
  featuredBody: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 20 },
  featuredEyebrow: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.terra300
  },
  featuredTitle: { fontFamily: fonts.display, fontSize: 40, color: colors.sand50, marginTop: 2 },
  featuredTagline: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.sand200, marginTop: 4 },
  featuredCta: {
    alignSelf: "flex-start",
    marginTop: 14,
    backgroundColor: colors.sand50,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10
  },
  featuredCtaText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.ink900 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink900, marginTop: 30, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },
  tile: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ink100,
    ...shadow
  },
  tileImg: { width: "100%", aspectRatio: 1.1, backgroundColor: colors.sand100 },
  tileCity: { fontFamily: fonts.display, fontSize: 18, color: colors.ink900 },
  tileCountry: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginTop: 2 },
  soon: { width: 132 },
  soonImg: { width: 132, height: 132, borderRadius: radius.lg, backgroundColor: colors.sand100, opacity: 0.85 },
  soonPill: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(15,14,10,0.7)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  soonPillText: {
    fontFamily: fonts.sansSemi,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.sand50
  },
  soonCity: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink700, marginTop: 8 },
  empty: { fontFamily: fonts.sans, fontSize: 15, color: colors.ink500, marginTop: 20 }
});
