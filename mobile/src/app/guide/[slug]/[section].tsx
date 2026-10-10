import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotionBlocks } from "../../../components/NotionBlocks";
import { BackButton, Centered, ErrorState } from "../../../components/ui";
import { fetchSection, useRemote } from "../../../lib/api";
import { colors, fonts, radius, shadow } from "../../../theme";

/** One guide section, rendered natively from its Notion page. */
export default function SectionScreen() {
  const { slug, section } = useLocalSearchParams<{ slug: string; section: string }>();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const { data, error, loading, reload } = useRemote(() => fetchSection(slug, section), [slug, section]);

  const go = (to: string) => router.replace(`/guide/${slug}/${to}`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.sand50 }}>
      {/* The guide screen underneath sets a light status bar for its hero. */}
      <StatusBar style="dark" />
      <View style={[styles.bar, { paddingTop: insets.top + 6 }]}>
        <BackButton />
        {data ? (
          <Text style={styles.barTitle} numberOfLines={1}>
            {data.section.title}
          </Text>
        ) : null}
        <View style={{ width: 40 }} />
      </View>

      {!data ? (
        error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <Centered>
            <ActivityIndicator color={colors.terra500} />
          </Centered>
        )
      ) : (
        <ScrollView
          ref={scroll}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
        >
          <View style={styles.header}>
            <View style={styles.icon}>
              <Text style={{ fontSize: 26 }}>{data.section.icon}</Text>
            </View>
            <Text style={styles.meta}>{data.section.readingTime} read</Text>
            <Text style={styles.title}>{data.section.title}</Text>
            {data.section.description ? <Text style={styles.desc}>{data.section.description}</Text> : null}
          </View>

          <NotionBlocks
            pageId={data.page.id}
            blocks={data.page.blocks}
            places={data.page.places}
            embeds={data.page.embeds}
            showCardNotes={section === "areas-to-stay"}
          />

          <View style={styles.pager}>
            {data.prev ? (
              <Pressable style={styles.pagerCard} onPress={() => go(data.prev!.slug)}>
                <Text style={styles.pagerLabel}>Previous</Text>
                <Text style={styles.pagerTitle}>← {data.prev.title}</Text>
              </Pressable>
            ) : null}
            {data.next ? (
              <Pressable style={styles.pagerCard} onPress={() => go(data.next!.slug)}>
                <Text style={[styles.pagerLabel, { textAlign: "right" }]}>Next</Text>
                <Text style={[styles.pagerTitle, { textAlign: "right" }]}>{data.next.title} →</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.sand50,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ink100
  },
  barTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.ink900,
    marginHorizontal: 8
  },
  header: { paddingTop: 20, paddingBottom: 8 },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.sand100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  meta: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.terra600
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink900,
    marginTop: 4,
    letterSpacing: -0.4
  },
  desc: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 25, color: colors.ink600, marginTop: 8 },
  pager: { marginTop: 36, gap: 12 },
  pagerCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink100,
    padding: 16,
    ...shadow
  },
  pagerLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.ink400
  },
  pagerTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink900, marginTop: 3 }
});
