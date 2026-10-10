import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { openLink } from "../lib/links";
import type { EmbedData, PlaceData } from "../lib/types";
import { colors, fonts, radius, shadow } from "../theme";

/**
 * Venue card - a Notion bullet whose first segment is a bold Google Maps
 * link. Data comes from the website's committed places.json snapshot
 * (never a live Google call). Unknown venues fall back to a link card.
 */
export function PlaceCard({
  url,
  name,
  notes,
  ourPick,
  place
}: {
  url: string;
  name: string;
  notes?: string;
  ourPick?: boolean;
  place?: PlaceData;
}) {
  if (!place) {
    return (
      <Pressable style={[styles.card, styles.linkCard]} onPress={() => openLink(url)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>Google Maps</Text>
          <Text style={styles.name}>{name || "Open in Maps"}</Text>
          {notes ? <Text style={styles.notes}>{notes}</Text> : null}
        </View>
        <Text style={styles.arrow}>↗</Text>
      </Pressable>
    );
  }

  // One photo per card, same as the website (Valeria, 2026-10-10). The
  // API already puts any hand-picked photo first.
  const photo = (place.photos || [])[0];

  return (
    <View style={styles.card}>
      {photo ? (
        <View>
          <Image
            source={{ uri: photo.src }}
            style={{ width: "100%", aspectRatio: 16 / 10, backgroundColor: colors.sand100 }}
            contentFit="cover"
            transition={150}
          />
          {photo.author ? (
            <Text style={styles.credit} numberOfLines={1}>
              Photo: {photo.author} · Google
            </Text>
          ) : null}
          {ourPick ? (
            <View style={styles.pick}>
              <Text style={styles.pickText}>Our pick</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={styles.body}>
        <Text style={styles.name}>{name || place.name}</Text>
        {place.address ? (
          <Text style={styles.address} numberOfLines={2}>
            {place.address}
          </Text>
        ) : null}
        {place.rating ? (
          <Text style={styles.rating}>
            ★ {place.rating.toFixed(1)}
            <Text style={styles.ratingMuted}>
              {" "}
              on Google{place.userRatingCount ? ` (${place.userRatingCount.toLocaleString()})` : ""}
            </Text>
          </Text>
        ) : null}
        <Pressable style={styles.cta} onPress={() => openLink(place.googleMapsUri || url)}>
          <Text style={styles.ctaText}>Open in Google Maps ↗</Text>
        </Pressable>
      </View>
    </View>
  );
}

const EMBED_LABEL: Record<EmbedData["kind"], string> = {
  airbnb: "Airbnb",
  getyourguide: "GetYourGuide",
  booking: "Booking.com"
};

/** Airbnb / GetYourGuide / Booking.com card. */
export function EmbedCard({
  url,
  kind,
  name,
  notes,
  ourPick,
  embed
}: {
  url: string;
  kind: EmbedData["kind"];
  name: string;
  notes?: string;
  ourPick?: boolean;
  embed?: EmbedData;
}) {
  const label = EMBED_LABEL[kind];
  const title = embed?.title || name || label;
  const meta = [embed?.subtitle, embed?.details].filter(Boolean).join(" · ");
  return (
    <Pressable style={styles.card} onPress={() => openLink(embed?.url || url)}>
      {embed?.image ? (
        <View>
          <Image
            source={{ uri: embed.image }}
            style={{ width: "100%", aspectRatio: 16 / 10, backgroundColor: colors.sand100 }}
            contentFit="cover"
            transition={150}
          />
          {ourPick ? (
            <View style={styles.pick}>
              <Text style={styles.pickText}>Our pick</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={styles.body}>
        <Text style={styles.eyebrow}>{label}</Text>
        <Text style={styles.name}>{title}</Text>
        {meta ? <Text style={styles.address}>{meta}</Text> : null}
        {embed?.rating || embed?.price ? (
          <Text style={styles.rating}>
            {embed.rating ? `★ ${embed.rating.toFixed(2)}` : ""}
            {embed.rating && embed.reviewCount ? (
              <Text style={styles.ratingMuted}> ({embed.reviewCount.toLocaleString()})</Text>
            ) : null}
            {embed.price ? (
              <Text style={styles.ratingMuted}>
                {embed.rating ? "  ·  " : ""}from {embed.price}
              </Text>
            ) : null}
          </Text>
        ) : null}
        {/* Notes only on link cards without a photo, same as the website */}
        {notes && !embed?.image ? <Text style={[styles.notes, { marginTop: 6 }]}>{notes}</Text> : null}
        <View style={styles.cta}>
          <Text style={styles.ctaText}>View on {label} ↗</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.ink100,
    overflow: "hidden",
    marginVertical: 10,
    ...shadow
  },
  linkCard: { flexDirection: "row", alignItems: "flex-start", padding: 18, gap: 12 },
  arrow: { fontSize: 18, color: colors.terra600 },
  body: { padding: 16, gap: 4 },
  eyebrow: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.ink400
  },
  name: { fontFamily: fonts.display, fontSize: 20, lineHeight: 25, color: colors.ink900 },
  address: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.ink500 },
  rating: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.ink900, marginTop: 2 },
  ratingMuted: { fontFamily: fonts.sans, color: colors.ink500 },
  noteBox: { backgroundColor: colors.sand50, borderRadius: radius.md, padding: 12, marginTop: 8 },
  noteLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.terra600,
    marginBottom: 3
  },
  notes: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.ink700 },
  cta: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: colors.ink900,
    paddingVertical: 11,
    alignItems: "center"
  },
  ctaText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.sand50 },
  credit: {
    position: "absolute",
    top: 10,
    left: 10,
    maxWidth: "70%",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(15,14,10,0.55)",
    color: "rgba(255,255,255,0.9)",
    fontSize: 10,
    fontFamily: fonts.sans
  },
  pick: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: colors.terra500,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  pickText: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  dots: { position: "absolute", bottom: 10, alignSelf: "center", flexDirection: "row", gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.5)" },
  dotOn: { backgroundColor: colors.white }
});
