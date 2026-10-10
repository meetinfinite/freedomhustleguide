import { Text, type TextStyle, type StyleProp } from "react-native";
import { openLink } from "../lib/links";
import { colors, fonts } from "../theme";
import type { NotionRichText } from "../lib/types";

export function richTextToString(rt: NotionRichText[] | undefined): string {
  return (rt || []).map((r) => r.plain_text ?? "").join("");
}

/** Notion rich text → nested <Text> spans (bold/italic/links/code). */
export function RichText({ rt, style }: { rt: NotionRichText[] | undefined; style?: StyleProp<TextStyle> }) {
  if (!rt?.length) return null;
  return (
    <Text style={style}>
      {rt.map((r, i) => {
        const a = r.annotations || {};
        const span: TextStyle = {};
        if (a.bold) span.fontFamily = fonts.sansSemi;
        if (a.italic) span.fontStyle = "italic";
        if (a.code) {
          span.fontFamily = "Courier";
          span.backgroundColor = colors.sand100;
        }
        const deco = [a.underline || r.href ? "underline" : "", a.strikethrough ? "line-through" : ""]
          .filter(Boolean)
          .join(" ");
        if (deco) span.textDecorationLine = deco as TextStyle["textDecorationLine"];
        if (r.href) span.color = colors.terra600;
        return (
          <Text key={i} style={span} onPress={r.href ? () => openLink(r.href!) : undefined} suppressHighlighting>
            {r.plain_text ?? ""}
          </Text>
        );
      })}
    </Text>
  );
}
