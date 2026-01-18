import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SessionsListScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>セッション一覧</Text>
      <Text style={styles.note}>（準備中）20件/ページ + ページネーション</Text>

      <Pressable style={styles.item} onPress={() => navigation.navigate("SessionDetail", { activityId: "dummy" })}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>（準備中）Activity Name</Text>
          <Text style={styles.meta}>date • distance • time • type</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  h1: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  note: { color: "#666", fontSize: 12, marginBottom: 12 },
  item: { flexDirection: "row", padding: 12, backgroundColor: "#fff", borderRadius: 12, alignItems: "center" },
  title: { fontSize: 16, fontWeight: "600" },
  meta: { color: "#666", marginTop: 4, fontSize: 12 },
  chev: { fontSize: 22, color: "#ccc", paddingLeft: 8 },
});
