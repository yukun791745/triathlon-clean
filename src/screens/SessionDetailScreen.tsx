import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function SessionDetailScreen() {
  const route = useRoute<any>();
  const activityId = route?.params?.activityId;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>セッション詳細</Text>
        <Text style={styles.note}>activityId: {activityId ?? "(none)"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>計算指標</Text>
        <Text style={styles.note}>（準備中）ここに既存の計算ロジック結果を表示</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>AIコーチ</Text>
        <Text style={styles.note}>（準備中）ここは後で実装</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: "700" },
  note: { marginTop: 8, color: "#666", fontSize: 12 },
});
