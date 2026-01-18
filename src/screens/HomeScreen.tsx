import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, Pressable } from "react-native";

type Props = {
  athleteId: string;
  onSignOut?: () => void;
};

const DEFAULT_ATHLETE_ID = "34646703";

const GET_ACTIVITIES_BASE =
  (typeof process !== "undefined" && (process.env as any).EXPO_PUBLIC_GET_ACTIVITIES_URL) ||
  "https://storied-donut-fd8311.netlify.app/.netlify/functions/get-activities";

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatKm(meters?: number) {
  if (typeof meters !== "number") return "";
  return `${(meters / 1000).toFixed(2)} km`;
}

function formatMovingTime(sec?: number) {
  if (typeof sec !== "number") return "";
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
}

export default function HomeScreen({ athleteId, onSignOut }: Props) {
  const userId = useMemo(() => (athleteId?.trim()?.length ? athleteId.trim() : DEFAULT_ATHLETE_ID), [athleteId]);

  const [activities, setActivities] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadLatestActivity() {
    setLoading(true);
    setError(null);

    const url = `${GET_ACTIVITIES_BASE}?userId=${encodeURIComponent(userId)}&per_page=30`;
    console.log("[HomeScreen] fetching:", url);

    try {
      const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
      const text = await res.text();

      console.log("[HomeScreen] status:", res.status);
      console.log("[HomeScreen] raw head:", text.slice(0, 200));

      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        setError("Invalid JSON response");
        console.log("[HomeScreen] JSON parse error:", e);
        return;
      }

      const list = Array.isArray(json?.activities)
        ? json.activities
        : Array.isArray(json)
        ? json
        : json?.activities
        ? [json.activities]
        : [];

      setActivities(list);
      console.log("[HomeScreen] activities count:", list.length);
    } catch (e: any) {
      console.log("[HomeScreen] fetch error:", e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLatestActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // “最新1件”の定義：start_date_local / start_date を使って降順
  const latest = useMemo(() => {
    const list = activities ?? [];
    if (list.length === 0) return null;

    const toTs = (a: any) => {
      const s = a?.start_date_local || a?.start_date || a?.start;
      const t = Date.parse(s);
      return Number.isFinite(t) ? t : 0;
    };

    const sorted = [...list].sort((a, b) => toTs(b) - toTs(a));
    return sorted[0] ?? null;
  }, [activities]);

  const latestName = latest?.name || latest?.type || "Activity";
  const latestDate = formatDate(latest?.start_date_local || latest?.start_date || latest?.start);
  const latestMetaParts = [
    latestDate,
    formatKm(latest?.distance),
    formatMovingTime(latest?.moving_time),
    latest?.type ? String(latest.type) : "",
  ].filter(Boolean);
  const latestMeta = latestMetaParts.join(" • ");

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

        {/* デバッグ表示（間違いようがない：このカードの中） */}
        <View style={{ marginTop: 8 }}>
          <Text style={styles.small}>
            debug: loading={String(loading)} activities={(activities ? activities.length : "null")} error={error ?? "null"}
          </Text>
        </View>

        {loading ? (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "red" }}>Error: {error}</Text>
            <Pressable onPress={loadLatestActivity} style={({ pressed }) => [styles.reloadBtn, pressed && styles.reloadBtnPressed]}>
              <Text style={styles.reloadBtnText}>再読み込み</Text>
            </Pressable>
          </View>
        ) : latest ? (
          <Pressable
            onPress={() => {
              console.log("[HomeScreen] tapped latest activity id=", latest?.id);
              // ここは後で「詳細画面」へ遷移に置き換え
            }}
            style={({ pressed }) => [styles.activityRow, pressed && { opacity: 0.7 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.activityTitle}>{latestName}</Text>
              <Text style={styles.activityMeta}>{latestMeta}</Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        ) : (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.note}>（まだデータが取得できていません）</Text>
            <Pressable onPress={loadLatestActivity} style={({ pressed }) => [styles.reloadBtn, pressed && styles.reloadBtnPressed]}>
              <Text style={styles.reloadBtnText}>再読み込み</Text>
            </Pressable>
          </View>
        )}

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

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 2,
  },
  activityTitle: { fontSize: 15, fontWeight: "600" },
  activityMeta: { color: "#666", marginTop: 4, fontSize: 12 },
  chev: { fontSize: 22, color: "#ccc", paddingLeft: 8 },

  reloadBtn: { marginTop: 10, alignSelf: "flex-start", backgroundColor: "#111", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  reloadBtnPressed: { opacity: 0.8 },
  reloadBtnText: { color: "#fff", fontWeight: "700" },
});
