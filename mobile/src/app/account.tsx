import Constants from "expo-constants";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui";
import { deleteMe } from "../lib/api";
import { useAuth } from "../lib/auth";
import { PRIVACY_URL, SUPPORT_EMAIL, TERMS_URL } from "../lib/config";
import { openLink } from "../lib/links";
import { supabase } from "../lib/supabase";
import { colors, fonts, radius } from "../theme";

export default function Account() {
  const { session } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const name = session?.user.user_metadata?.name as string | undefined;

  function confirmDelete() {
    Alert.alert(
      "Delete your account?",
      "This permanently deletes your Freedom Hustle account and sign-in. It can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteMe();
              await supabase.auth.signOut();
            } catch (e) {
              Alert.alert("Couldn't delete", e instanceof Error ? e.message : "Try again later.");
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.sand50 }} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <View style={styles.handleRow}>
          <Text style={styles.title}>Account</Text>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {name ? <Text style={styles.name}>{name}</Text> : null}
          <Text style={styles.email}>{session?.user.email}</Text>
          <Text style={styles.badge}>All guides unlocked</Text>
        </View>

        <View style={styles.card}>
          <Row label="Privacy Policy" onPress={() => openLink(PRIVACY_URL)} />
          <Row label="Terms" onPress={() => openLink(TERMS_URL)} />
          <Row label="Contact support" onPress={() => openLink(`mailto:${SUPPORT_EMAIL}`)} last />
        </View>

        <Button label="Sign out" variant="ghost" onPress={() => supabase.auth.signOut()} />
        <Pressable onPress={confirmDelete} disabled={deleting} style={{ alignSelf: "center", padding: 12 }}>
          <Text style={styles.delete}>{deleting ? "Deleting…" : "Delete account"}</Text>
        </Pressable>
        <Text style={styles.version}>Version {Constants.expoConfig?.version}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, onPress, last }: { label: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowText}>{label}</Text>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, gap: 16 },
  handleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink900 },
  done: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.terra600 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink100,
    padding: 16
  },
  name: { fontFamily: fonts.display, fontSize: 22, color: colors.ink900 },
  email: { fontFamily: fonts.sans, fontSize: 15, color: colors.ink500, marginTop: 2 },
  badge: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: colors.terra50,
    color: colors.terra600,
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden"
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.ink100 },
  rowText: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink900 },
  chev: { fontSize: 22, color: colors.ink300 },
  delete: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.dangerText },
  version: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink400, textAlign: "center" }
});
