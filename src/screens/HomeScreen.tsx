import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Button, StyleSheet, Pressable, ActivityIndicator } from "react-native";

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

// Netlify Function (GET activities)
const GET_ACTIVITIES_BASE =
  (typeof process !== "undefined" && (process.env as any).EXPO_PUBLIC_GET_ACTIVITIES_URL) ||
  "https://storied-donut-fd8311.netlify.app/.netlify/functions/get-activities";

function formatDate(dateStr?: string) {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function formatKm(meters?: number) {
  if (typeof meters !== "number") return "--";
  return (meters / 1000).toFixed(2);
}

function formatHMS(seconds?: number) {
  if (typeof seconds !== "number") return "--";
  const s = Math.max(0, Math.floor(seconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

export default function HomeScreen({ athleteId, onSignOut }: Props) {
  const userId = useMemo(() => athleteId || "34646703", [athleteId]);

  const [latest, setLatest] = useState<StravaActivity | null>(null);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [latestError, setLatestError] = useState<string | null>(null);
  const [debug, setDebug] = useState<{ status?: number; rawHead?: string; count?: number; url?: string } | null>(null);

  async function loadLatestActivity() {
    setLoadingLatest(true);
    setLatestError(null);

    // NOTE: latest 1 means fetch list and take first.
    // If your function supports "per_page" + sorting, it should already return newest-first.
    const url = `${GET_ACTIVITIES_BASE}?userId=${encodeURIComponent(userId)}&per_page=30`;
    setDebug({ url });

    try {
      const res = await fetch(url);
      const text = await res.text();

      setDebug((prev) => ({
        ...(prev || {}),
        status: res.status,
        rawHead: text.slice(0, 200),
      }));

      const json = JSON.parse(text);

      const list: any[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.activities)
        ? json.activities
        : [];

      setDebug((prev) => ({
        ...(prev || {}),
        count: list.length,
      }));

      // pick latest 1
      const first = list[0] as StravaActivity | undefined;
      setLatest(first ?? null);
    } catch (e: any) {
      setLatest(null);
      setLatestError(String(e?.message || e));
    } finally {
      setLoadingLatest(false);
    }
  }

  useEffect(() => {
    loadLatestActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const latestType = latest?.sport_type || latest?.type || "--";
  const latestDate = formatDate(latest?.start_date_local || latest?.start_date);

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

        {loadingLatest && (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator />
            <Text style={styles.note}>loading latest activity...</Text>
          </View>
        )}

        {!loadingLatest && latestError && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "red", fontSize: 12 }}>error: {latestError}</Text>
          </View>
        )}

        {!loadingLatest && !latestError && (
          <Pressable style={styles.activityRow} onPress={() => { /* TODO: navigate to detail */ }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityTitle}>{latest?.name ?? "（データなし）"}</Text>
              <Text style={styles.activityMeta}>
                {latestDate} • {formatKm(latest?.distance)} km • {formatHMS(latest?.moving_time)} • {latestType}
              </Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        )}

        {/* ✅ デバッグ表示（ここが「最近のアクティビティ」カード内で、かつ note の直前） */}
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>debug url: {debug?.url ?? "--"}</Text>
          <Text style={styles.debugText}>debug status: {String(debug?.status ?? "--")}</Text>
          <Text style={styles.debugText}>debug count: {String(debug?.count ?? "--")}</Text>
          <Text style={styles.debugText}>debug rawHead: {debug?.rawHead ?? "--"}</Text>
          <Pressable onPress={loadLatestActivity} style={styles.debugBtn}>
            <Text style={styles.debugBtnText}>Reload latest</Text>
          </Pressable>
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

  debugBox: { marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: "#f7f7f7" },
  debugText: { fontSize: 11, color: "#444", marginBottom: 4 },
  debugBtn: { marginTop: 6, alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: "#ddd" },
  debugBtnText: { fontSize: 12, fontWeight: "600" },
});
