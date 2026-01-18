import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, Pressable } from "react-native";

type Props = {
  athleteId: string;
  onSignOut?: () => void;
};

type StravaActivity = {
  id?: number | string;
  name?: string;
  type?: string;
  sport_type?: string;
  start_date?: string;
  start_date_local?: string;
  distance?: number; // meters
  moving_time?: number; // seconds
  elapsed_time?: number; // seconds
};

const GET_ACTIVITIES_BASE =
  (typeof process !== "undefined" && (process.env as any).EXPO_PUBLIC_GET_ACTIVITIES_URL) ||
  "https://storied-donut-fd8311.netlify.app/.netlify/functions/get-activities";

function formatDate(iso?: string) {
  if (!iso) return "--";
  // まずは単純表示（詳細な日本語フォーマットは後で）
  return iso.replace("T", " ").replace("Z", "");
}

function formatKm(meters?: number) {
  if (typeof meters !== "number") return "--";
  return (meters / 1000).toFixed(2);
}

function formatHMS(seconds?: number) {
  if (typeof seconds !== "number") return "--";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function HomeScreen({ athleteId, onSignOut }: Props) {
  const [latest, setLatest] = useState<StravaActivity | null>(null);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const userId = athleteId || "34646703";

  const url = useMemo(() => {
    // 最新1件だけ欲しいので per_page=1
    return `${GET_ACTIVITIES_BASE}?userId=${encodeURIComponent(userId)}&per_page=1`;
  }, [userId]);

  async function loadLatestActivity() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(url);
      const text = await res.text();

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      }

      let json: any;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error(`JSON parse failed: ${(e as any)?.message ?? String(e)} / head=${text.slice(0, 200)}`);
      }

      const list: any[] = Array.isArray(json) ? json : Array.isArray(json?.activities) ? json.activities : [];

      setCount(list.length);

      const first = list[0] ?? null;
      setLatest(first);
    } catch (e: any) {
      setLatest(null);
      setCount(0);
      setError(e?.message ? String(e.message) : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLatestActivity();
    // athleteIdが変わった場合にも更新
  }, [url]);

  const displayType = latest?.sport_type ?? latest?.type ?? "--";
  const displayDate = formatDate(latest?.start_date_local ?? latest?.start_date);
  const displayDistance = `${formatKm(latest?.distance)} km`;
  const displayTime = formatHMS(latest?.moving_time ?? latest?.elapsed_time);

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
          <Text style={styles.small}>athleteId: {userId}</Text>
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

        {/* ✅ デバッグ表示：cardHeader直下（必ず視認できる） */}
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>debug: url={url}</Text>
          <Text style={styles.debugText}>debug: loading={String(loading)} count={count} error={error ? "YES" : "NO"}</Text>
        </View>

        {loading && (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator />
          </View>
        )}

        {!!error && <Text style={{ color: "red", marginTop: 10 }}>{error}</Text>}

        <Pressable
          onPress={() => {
            // ここは後で Activity 詳細へ遷移に置換
          }}
          style={({ pressed }) => [styles.activityRow, pressed && { opacity: 0.7 }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.activityTitle}>{latest?.name ?? "（データなし）"}</Text>
            <Text style={styles.activityMeta}>
              {displayDate} • {displayDistance} • {displayTime} • {displayType}
            </Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </Pressable>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          <Button title="再読み込み" onPress={loadLatestActivity} />
        </View>
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

  debugBox: { marginTop: 10, padding: 8, borderRadius: 8, backgroundColor: "#f5f5f5" },
  debugText: { fontSize: 11, color: "#444" },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 10,
    paddingTop: 10,
  },
  activityTitle: { fontSize: 15, fontWeight: "600" },
  activityMeta: { color: "#666", marginTop: 4, fontSize: 12 },
  chev: { fontSize: 22, color: "#ccc", paddingLeft: 8 },
});
