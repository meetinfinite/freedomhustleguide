import { Image } from "expo-image";
import { useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import type { EmbedData, NotionBlock, NotionRichText, PlaceData } from "../lib/types";
import { colors, fonts, radius } from "../theme";
import { Callout } from "./Callout";
import { EmbedCard, PlaceCard } from "./Cards";
import { Checklist } from "./Checklist";
import { RichText, richTextToString } from "./RichText";

/**
 * Native port of the website's components/NotionRenderer.tsx. Same
 * authoring conventions, so editors write a section once in Notion and it
 * renders properly on web AND in the app:
 *   - consecutive to_do blocks       → interactive Checklist
 *   - bold Google Maps link bullet   → PlaceCard (from places.json snapshot)
 *   - Airbnb / GYG / Booking bullet  → EmbedCard
 *   - "DON'T - …", "PRO TIP - …" etc → Callout (following quotes = body)
 * Keep the two in step when a convention changes.
 */

// Same regexes as lib/gmaps.ts + lib/embeds.ts on the website.
const GMAPS_HOST_RE =
  /^https?:\/\/(www\.)?(google\.[^/]+\/maps|maps\.google\.[^/]+|maps\.app\.goo\.gl|goo\.gl\/maps|share\.google)/i;
function embedKindForUrl(url: string): EmbedData["kind"] | null {
  if (/^https?:\/\/(www\.)?(airbnb\.[a-z.]+|abnb\.me)\//i.test(url)) return "airbnb";
  if (/^https?:\/\/(www\.)?(getyourguide\.[a-z.]+|gyg\.me)\//i.test(url)) return "getyourguide";
  if (/^https?:\/\/(www\.)?booking\.[a-z.]+\//i.test(url)) return "booking";
  return null;
}

const TAGGED_QUOTE_REGEX = /^([A-Z][A-Z'\s]+?)\s*[—–-]\s*(.*)/s;
const NEGATION_PREFIX: Record<string, string> = { "DON'T": "Don't", DONT: "Don't", AVOID: "Avoid", NEVER: "Never" };

function blockText(b: NotionBlock): NotionRichText[] | undefined {
  return (b.data as { rich_text?: NotionRichText[] })?.rich_text;
}

function parseQuoteTag(rt: NotionRichText[] | undefined) {
  const m = richTextToString(rt).trim().match(TAGGED_QUOTE_REGEX);
  return m ? { tag: m[1].trim().toUpperCase(), title: m[2].trim() } : null;
}

function calloutTitle(tag: string, title: string) {
  const lead = NEGATION_PREFIX[tag];
  if (!lead) return title;
  if (!title) return lead;
  const firstWord = title.split(/\s+/)[0] || "";
  const body = /^[A-Z]{2,}/.test(firstWord) ? title : title.charAt(0).toLowerCase() + title.slice(1);
  return `${lead} ${body}`;
}

type CardBullet =
  | { kind: "venue"; url: string; name: string; notes: string; isPick: boolean }
  | { kind: "embed"; embedKind: EmbedData["kind"]; url: string; name: string; notes: string; isPick: boolean };

function parseCardBullet(b: NotionBlock): CardBullet | null {
  if (b.type !== "bulleted_list_item") return null;
  const rt = blockText(b);
  const first = rt?.[0];
  if (!first?.href) return null;
  const name = (first.plain_text || "").trim();
  const rest = richTextToString(rt!.slice(1));
  const isPick = rest.toLowerCase().includes("our pick");
  if (GMAPS_HOST_RE.test(first.href) && first.annotations?.bold && name) {
    return { kind: "venue", url: first.href, name, notes: rest.replace(/^\s*[·•]\s*/, "").trim(), isPick };
  }
  const embedKind = embedKindForUrl(first.href);
  if (embedKind) {
    return {
      kind: "embed",
      embedKind,
      url: first.href,
      name,
      notes: rest.replace(/^\s*[·•—–-]\s*/, "").trim(),
      isPick
    };
  }
  return null;
}

export function NotionBlocks({
  pageId,
  blocks,
  places,
  embeds
}: {
  pageId: string;
  blocks: NotionBlock[];
  places: Record<string, PlaceData>;
  embeds: Record<string, EmbedData>;
}) {
  const out: ReactNode[] = [];
  let checklistIndex = 0;
  let i = 0;

  while (i < blocks.length) {
    const b = blocks[i];

    if (b.type === "to_do") {
      const start = i;
      const items: string[] = [];
      while (i < blocks.length && blocks[i].type === "to_do") {
        items.push(richTextToString(blockText(blocks[i])).trim());
        i++;
      }
      // Same id scheme as the web Checklist, so the key stays stable.
      out.push(<Checklist key={`cl-${start}`} id={`notion-${pageId.slice(-6)}-${checklistIndex++}`} items={items} />);
      continue;
    }

    const card = parseCardBullet(b);
    if (card) {
      out.push(
        card.kind === "venue" ? (
          <PlaceCard
            key={b.id}
            url={card.url}
            name={card.name}
            notes={card.notes}
            ourPick={card.isPick}
            place={places[card.url]}
          />
        ) : (
          <EmbedCard
            key={b.id}
            url={card.url}
            kind={card.embedKind}
            name={card.name}
            notes={card.notes}
            ourPick={card.isPick}
            embed={embeds[card.url]}
          />
        )
      );
      i++;
      continue;
    }

    if (b.type === "quote") {
      const parsed = parseQuoteTag(blockText(b));
      if (parsed) {
        const body: NotionBlock[] = [];
        let j = i + 1;
        while (j < blocks.length && blocks[j].type === "quote" && !parseQuoteTag(blockText(blocks[j]))) {
          body.push(blocks[j]);
          j++;
        }
        out.push(renderCallout(parsed.tag, parsed.title, body, b.id));
        i = j;
        continue;
      }
    }

    if (b.type === "bulleted_list_item" || b.type === "numbered_list_item") {
      const type = b.type;
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === type && !parseCardBullet(blocks[i])) {
        items.push(blocks[i]);
        i++;
      }
      out.push(
        <View key={`list-${items[0].id}`} style={styles.list}>
          {items.map((it, n) => (
            <View key={it.id} style={styles.listItem}>
              <Text style={styles.bullet}>{type === "numbered_list_item" ? `${n + 1}.` : "•"}</Text>
              <RichText rt={blockText(it)} style={[styles.p, { flex: 1, marginVertical: 0 }]} />
            </View>
          ))}
        </View>
      );
      continue;
    }

    out.push(<Block key={b.id} b={b} />);
    i++;
  }

  return <View>{out}</View>;
}

function renderCallout(tag: string, title: string, body: NotionBlock[], key: string) {
  const children = body.map((qb) => <RichText key={qb.id} rt={blockText(qb)} style={styles.calloutBody} />);
  const kind =
    tag.startsWith("DON'T") || tag.startsWith("HEADS UP") || ["AVOID", "WARNING", "CAUTION"].includes(tag)
      ? "warn"
      : tag.startsWith("DANGER") || tag === "NEVER"
        ? "danger"
        : tag.startsWith("PRO TIP")
          ? "tip"
          : tag.startsWith("GOOD TO KNOW") || tag === "FYI" || tag === "NOTE"
            ? "info"
            : null;
  if (!kind) {
    return (
      <View key={key} style={styles.quote}>
        <Text style={styles.quoteText}>
          <Text style={{ fontFamily: fonts.sansSemi }}>{tag}</Text> - {title}
        </Text>
        {children}
      </View>
    );
  }
  return (
    <Callout key={key} kind={kind} title={calloutTitle(tag, title)}>
      {children}
    </Callout>
  );
}

function Block({ b }: { b: NotionBlock }) {
  switch (b.type) {
    case "paragraph": {
      const rt = blockText(b);
      if (!richTextToString(rt).trim()) return null;
      return <RichText rt={rt} style={styles.p} />;
    }
    case "heading_1":
      return <RichText rt={blockText(b)} style={styles.h2} />;
    case "heading_2":
      return <RichText rt={blockText(b)} style={styles.h3} />;
    case "heading_3":
      return <RichText rt={blockText(b)} style={styles.h4} />;
    case "quote":
      return (
        <View style={styles.quote}>
          <RichText rt={blockText(b)} style={styles.quoteText} />
        </View>
      );
    case "callout":
      return (
        <Callout kind="info">
          <RichText rt={blockText(b)} style={styles.calloutBody} />
        </Callout>
      );
    case "divider":
      return <View style={styles.hr} />;
    case "image":
      return <NotionImage b={b} />;
    case "bookmark":
    case "embed":
    case "link_preview": {
      const url = (b.data as { url?: string })?.url;
      if (!url) return null;
      return <RichText rt={[{ plain_text: url, href: url }]} style={styles.p} />;
    }
    case "table":
      return <Table b={b} />;
    case "code":
      return (
        <View style={styles.code}>
          <Text style={styles.codeText}>{richTextToString(blockText(b))}</Text>
        </View>
      );
    default:
      return null;
  }
}

function NotionImage({ b }: { b: NotionBlock }) {
  const d = b.data as { caption?: NotionRichText[]; file?: { url?: string }; external?: { url?: string } };
  const src = d.file?.url || d.external?.url;
  const [ratio, setRatio] = useState(4 / 3);
  if (!src) return null;
  const caption = richTextToString(d.caption);
  return (
    <View style={{ marginVertical: 12 }}>
      <Image
        source={{ uri: src }}
        style={{ width: "100%", aspectRatio: ratio, borderRadius: radius.xl, backgroundColor: colors.sand100 }}
        contentFit="cover"
        transition={150}
        accessibilityLabel={caption || undefined}
        onLoad={(e) => e.source.width && e.source.height && setRatio(e.source.width / e.source.height)}
      />
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

function Table({ b }: { b: NotionBlock }) {
  const { width } = useWindowDimensions();
  const rows = (b.children || []).filter((c) => c.type === "table_row");
  if (!rows.length) return null;
  const hasHeader = Boolean((b.data as { has_column_header?: boolean })?.has_column_header);
  const cells = (r: NotionBlock) => (r.data as { cells?: NotionRichText[][] })?.cells || [];
  // One fixed width for every cell so columns line up across rows: share the
  // screen width, but never narrower than 140 - wide tables scroll sideways.
  const cols = Math.max(1, ...rows.map((r) => cells(r).length));
  const colWidth = Math.max(140, (width - 42) / cols);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.table}>
      <View>
        {rows.map((r, ri) => {
          const header = hasHeader && ri === 0;
          return (
            <View
              key={r.id}
              style={[styles.tr, header && styles.thRow, ri === rows.length - 1 && { borderBottomWidth: 0 }]}
            >
              {cells(r).map((c, ci) => (
                <View key={ci} style={[styles.td, { width: colWidth }]}>
                  <RichText
                    rt={c}
                    style={[
                      styles.tdText,
                      (header || ci === 0) && { fontFamily: fonts.sansSemi, color: colors.ink900 }
                    ]}
                  />
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  p: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 25, color: colors.ink700, marginVertical: 7 },
  h2: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: colors.ink900, marginTop: 26, marginBottom: 6 },
  h3: { fontFamily: fonts.display, fontSize: 21, lineHeight: 27, color: colors.ink900, marginTop: 22, marginBottom: 4 },
  h4: {
    fontFamily: fonts.sansSemi,
    fontSize: 17,
    lineHeight: 24,
    color: colors.ink900,
    marginTop: 16,
    marginBottom: 2
  },
  list: { marginVertical: 6, gap: 6 },
  listItem: { flexDirection: "row", gap: 10, paddingRight: 4 },
  bullet: { fontFamily: fonts.sansSemi, fontSize: 16, lineHeight: 25, color: colors.terra500, minWidth: 14 },
  quote: { borderLeftWidth: 4, borderLeftColor: colors.terra500, paddingLeft: 14, marginVertical: 10 },
  quoteText: { fontFamily: fonts.sans, fontStyle: "italic", fontSize: 16, lineHeight: 25, color: colors.ink700 },
  calloutBody: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.ink700 },
  hr: { height: 1, backgroundColor: colors.ink100, marginVertical: 22 },
  caption: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginTop: 6 },
  code: { backgroundColor: colors.ink900, borderRadius: radius.md, padding: 14, marginVertical: 10 },
  codeText: { fontFamily: "Courier", fontSize: 13, color: colors.sand50 },
  table: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.ink100,
    borderRadius: radius.lg,
    backgroundColor: colors.white
  },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.ink100 },
  thRow: { backgroundColor: colors.sand100 },
  td: { paddingHorizontal: 12, paddingVertical: 10 },
  tdText: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.ink700 }
});
