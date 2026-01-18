import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function FitnessDetailScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>種目別トレーニング時間</Text>
        <Text style={styles.note}>（準備中）棒グラフ + 実数</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>心拍ゾーン</Text>
        <Text style={styles.note}>（準備中）ゾーン分布</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>種目別トレーニング負荷（TSS）</Text>
        <Text style={styles.note}>（準備中）種目別TSS + 合計</Text>
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
