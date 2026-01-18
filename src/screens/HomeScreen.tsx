import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

type Props = {
  athleteId: string;
  onSignOut?: () => void;
};

export default function HomeScreen({ athleteId, onSignOut }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.h1}>ホーム</Text>
        <Button title="Sign Out" onPress={onSignOut || (() => {})} />
      </View>

      {/* 1) ここに Strava と無関係なサマリーが並ぶ（後で移植） */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>（準備中）ホーム上段サマリー</Text>
        <Text style={styles.note}>あなたのモックの上段〜中段のサマリーカード群をここへ移植します。</Text>
      </View>

      {/* 2) Strava関連: フィットネス概要（主要3指標） */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>フィットネス概要</Text>
          <Text style={styles.small}>athleteId: {athleteId || "34646703"}</Text>
        </View>

        <View style={styles.row3}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>指標1</Text>
            <Text style={styles.metricValue}>--</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>指標2</Text>
            <Text style={styles.metricValue}>--</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>指標3</Text>
            <Text style={styles.metricValue}>--</Text>
          </View>
        </View>

        <Text style={styles.note}>ここに既存の計算ロジック（主要3指標）を接続します。</Text>
      </View>

      {/* 3) Strava関連: 最近のアクティビティ（最新1件のみ） */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>最近のアクティビティ</Text>
          <Text style={styles.small}>最新1件</Text>
        </View>

        <View style={styles.activityRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityTitle}>（準備中）Activity Name</Text>
            <Text style={styles.activityMeta}>date • distance • time • type</Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </View>

        <Text style={styles.note}>ここに Strava 活動リストの最新1件を表示します。</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  h1: { fontSize: 20, fontWeight: "700" },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  small: { color: "#666", fontSize: 12 },
  note: { marginTop: 8, color: "#666", fontSize: 12 },

  row3: { flexDirection: "row", gap: 8, marginTop: 10 },
  metricBox: { flex: 1, borderWidth: 1, borderColor: "#eee", borderRadius: 10, padding: 10 },
  metricLabel: { color: "#666", fontSize: 12 },
  metricValue: { fontSize: 18, fontWeight: "700", marginTop: 6 },

  activityRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: "#eee", marginTop: 10, paddingTop: 10 },
  activityTitle: { fontSize: 15, fontWeight: "600" },
  activityMeta: { color: "#666", marginTop: 4, fontSize: 12 },
  chev: { fontSize: 22, color: "#ccc", paddingLeft: 8 },
});
