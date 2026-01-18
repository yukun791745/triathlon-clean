import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function TrainingScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>トレーニング</Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>フィットネス指標の推移</Text>
          <Pressable onPress={() => navigation.navigate("FitnessDetail")}>
            <Text style={styles.link}>詳細 ＞</Text>
          </Pressable>
        </View>
        <Text style={styles.note}>（準備中）期間チップ + 時系列グラフ + 3指標</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>最近のセッション</Text>
          <Pressable onPress={() => navigation.navigate("SessionsList")}>
            <Text style={styles.link}>全て見る ＞</Text>
          </Pressable>
        </View>
        <Text style={styles.note}>（準備中）最新3件のみ表示</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  h1: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  link: { color: "#2563EB", fontWeight: "600" },
  note: { marginTop: 8, color: "#666", fontSize: 12 },
});
