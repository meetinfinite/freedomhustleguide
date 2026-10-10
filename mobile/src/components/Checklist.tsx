import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius, shadow } from "../theme";

/**
 * Interactive checklist - a run of Notion to_do blocks. Progress is saved
 * on the device (same key scheme as the website's localStorage version).
 */
export function Checklist({ id, items }: { id: string; items: string[] }) {
  const key = `fh:checklist:${id}`;
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => raw && setDone(JSON.parse(raw)))
      .catch(() => {});
  }, [key]);

  const toggle = (i: number) => {
    const next = { ...done, [i]: !done[i] };
    setDone(next);
    AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
  };

  const completed = items.filter((_, i) => done[i]).length;
  const pct = items.length ? completed / items.length : 0;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.headText}>Checklist</Text>
        <Text style={styles.count}>
          {completed}/{items.length}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
      {items.map((item, i) => (
        <Pressable
          key={i}
          onPress={() => toggle(i)}
          style={styles.row}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: Boolean(done[i]) }}
        >
          <View style={[styles.box, done[i] && styles.boxOn]}>
            {done[i] ? <Text style={styles.tick}>✓</Text> : null}
          </View>
          <Text style={[styles.item, done[i] && styles.itemDone]}>{item}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.ink100,
    padding: 18,
    marginVertical: 12,
    ...shadow
  },
  head: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  headText: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.ink400
  },
  count: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.terra600 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.sand100, marginBottom: 8, overflow: "hidden" },
  fill: { height: 6, backgroundColor: colors.terra500 },
  row: { flexDirection: "row", gap: 12, paddingVertical: 9, alignItems: "flex-start" },
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.ink300,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1
  },
  boxOn: { backgroundColor: colors.terra500, borderColor: colors.terra500 },
  tick: { color: colors.white, fontFamily: fonts.sansBold, fontSize: 13 },
  item: { flex: 1, fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.ink700 },
  itemDone: { color: colors.ink400, textDecorationLine: "line-through" }
});
