import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";

type Props = {
  athleteId: string;
  onSignOut?: () => void;
};

const GET_ACTIVITIES_BASE =
  (typeof process !== "undefined" &&
    (process.env as any).EXPO_PUBLIC_GET_ACTIVITIES_URL) ||
  "https://storied-donut-fd8311.netlify.app/.netlify/functions/get-activities";

type StravaActivityLike = {
  id?: number | string;
  name?: string;
  type?: string; // Run / Ride / Swim etc
  sport_type?: string;
  start_date?: string; // ISO
  start_date_local?: string;
  distance?: number; // meters
  moving_time?: number; // seconds
  elapsed_time?: number; // seconds
};

function safeNumber(n: any): number | null {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}

function metersToKm(meters: number): string {
  const km = meters / 1000;
  // 10km未満は小数2桁、それ以上は小数1桁などにしても良いが、まずは固定2桁で統一
  return `${km.toFixed(2)} km`;
}

function secondsToHms(seconds: number): string {
  const sec = Math.max(0, Math.floor(seconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${m}:${ss.padStart(2, "0")}`;
}

function formatDate(dateIso?: string): string {
  if (!dateIso) return "--";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "--";

  // Web/Nativeでの見た目差を減らすため、まずはシンプル表記
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}/${mo}/${da}`;
}

function normalizeSportType(a: StravaActivityLike): string {
  const t = (a.sport_type || a.type || "").toLowerCase();
  if (!t) return "--";

  // あなたのUIに近い日本語ラベル（必要なら後で整備）
  if (t.includes("run")) return "ラン";
  if (t.includes("ride") || t.includes("bike") || t.includes("cycling"))
    return "バイク";
  if (t.includes("swim")) return "スイム";
  if (t.includes("workout") || t.includes("weight") || t.includes("strength"))
    return "筋トレ";
  return (a.sport_type || a.type || "--").toString();
}

export default function HomeScreen({ athleteId, onSignOut }: Props) {
  const [activities, setActivities] = useState<StravaActivityLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadActivities() {
    setLoading(true);
    setError(null);

    const userId = athleteId || "34646703";
    const url = `${GET_ACTIVITIES_BASE}?userId=${encodeURIComponent(
      userId
    )}&per_page=30`;

    console.log("[HomeScreen] fetching URL =", url);

    try {
      const res = await fetch(url);
      const text = await res.text();

      console.log("[HomeScreen] status =", res.status);
      console.log("[HomeScreen] raw response head =", text.slice(0, 300));

      const json = JSON.parse(text);

      const list = Array.isArray(json)
        ? json
        : Array.isArray(json?.activities)
        ? json.activities
        : [];

      console.log("[HomeScreen] parsed activities count =", list.length);
      setActivities(list as StravaActivityLike[]);
    } catch (e: any) {
      console.error("[HomeScreen] ERROR", e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 最新1件を「日付で」確実に選ぶ（API順序に依存しない）
  const latestActivity = useMemo(() => {
    if (!activities?.length) return null;

    const withTime = activities
      .map((a) => {
        const iso = a.start_date || a.start_date_local;
        const t = iso ? new Date(iso).getTime() : NaN;
        return { a, t };
      })
      .filter((x) => Number.isFinite(x.t));

    if (withTime.length === 0) return activities[0];

    withTime.sort((x, y) => y.t - x.t);
    return withTime[0].a;
  }, [activities]);

  const latestSummary = useMemo(() => {
    if (!latestActivity) return null;

    const dateIso = latestActivity.start_date_local || latestActivity.start_date;
    const date = formatDate(dateIso);

    const distM = safeNumber(latestActivity.distance);
    const distance = distM == null ? "--" : metersToKm(distM);

    const timeSec =
      safeNumber(latestActivity.moving_time) ??
      safeNumber(latestActivity.elapsed_time);
    const time = timeSec == null ? "--" : secondsToHms(timeSec);

    const type = normalizeSportType(latestActivity);

    return { date, distance, time, type };
  }, [latestActivity]);

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>ホーム</Text>
        <View style={styles.headerRight}>
          <Button title="SIGN OUT" onPress={onSignOut} />
        </View>
      </View>

      {/* (準備中) 上段サマリー */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>（準備中）ホーム上段サマリー</Text>
        <Text style={styles.muted}>
          あなたのモックの上段〜中段のサマリーカード群をここへ移植します。
        </Text>
      </View>

      {/* フィットネス概要（主要3指標：ここは既存ロジック接続待ち） */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionTitle}>フィットネス概要</Text>
          <Text style={styles.mutedSmall}>athleteId: {athleteId || "34646703"}</Text>
        </View>

        <View style={styles.metricsRow}>
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

        <Text style={styles.muted}>
          ここに既存の計算ロジック（主要3指標）を接続します。
        </Text>
      </View>

      {/* 最近のアクティビティ（最新1件のみ） */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionTitle}>最近のアクティビティ</Text>
          <Text style={styles.mutedSmall}>最新1件</Text>
        </View>

        {loading && (
          <View style={{ paddingTop: 8 }}>
            <ActivityIndicator />
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && !latestActivity && (
          <View style={styles.activityBox}>
            <Text style={styles.activityTitle}>（準備中）Activity Name</Text>
            <Text style={styles.activityMeta}>date・distance・time・type</Text>
            <Text style={styles.muted}>Strava活動リストの最新1件を表示します。</Text>
          </View>
        )}

        {!loading && !error && latestActivity && latestSummary && (
          <View style={styles.activityBox}>
            <Text style={styles.activityTitle}>
              {latestActivity.name ?? "Activity"}
            </Text>
            <Text style={styles.activityMeta}>
              {latestSummary.date}・{latestSummary.distance}・{latestSummary.time}
              ・{latestSummary.type}
            </Text>

            <Text style={styles.muted}>
              ここは「Trainingの全セッション一覧」から参照表示（最新1件）です。
            </Text>
          </View>
        )}

        {/* NOTE: ここに「詳細へ」導線を入れる場合は、画面遷移確定後に実装する */}
      </View>

      {/* 下余白（BottomNavに被らないように） */}
      <View style={{ height: Platform.OS === "web" ? 24 : 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#efefef",
    flex: 1,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  pageTitle: { fontSize: 22, fontWeight: "800" },
  headerRight: { alignSelf: "flex-end" },

  card: {
    marginTop: 12,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
  },

  cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: { fontSize: 18, fontWeight: "800" },

  muted: { color: "#666", marginTop: 8, lineHeight: 18 },
  mutedSmall: { color: "#666", fontSize: 12 },

  errorText: { color: "red", marginTop: 8 },

  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  metricBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  metricLabel: { color: "#666", fontWeight: "700", marginBottom: 6 },
  metricValue: { fontSize: 22, fontWeight: "900" },

  activityBox: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  activityTitle: { fontSize: 16, fontWeight: "800" },
  activityMeta: { color: "#666", marginTop: 6 },
});
