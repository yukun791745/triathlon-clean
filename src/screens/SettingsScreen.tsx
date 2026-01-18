import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  athleteId: string;
};

export default function SettingsScreen({ athleteId }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>設定</Text>

      <View style={styles.card}>
        <Text style={styles.title}>計算に必要な入力</Text>
        <Text style={styles.note}>
          （準備中）心拍ゾーン / FTP / 体重 / 閾値など。 athleteId: {athleteId || "34646703"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  h1: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: "700" },
  note: { marginTop: 8, color: "#666", fontSize: 12 },
});
