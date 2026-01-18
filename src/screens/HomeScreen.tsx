import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";

type Props = {
  userId: string;          // AuthScreen から渡される Athlete ID
  onSignOut: () => void;   // Sign out で Auth に戻す
};

type StravaActivity = {
  id: number;
  name?: string;
  type?: string;
  sport_type?: string;
  start_date_local?: string;
  distance?: number; // meters
  moving_time?: number; // seconds
};

function formatDistance(m?: number) {
  if (typeof m !== "number") return "-";
  const km = m / 1000;
  return `${km.toFixed(2)} km`;
}

function formatDuration(sec?: number) {
  if (typeof sec !== "number") return "-";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  // "2026-01-18T09:00:22Z" or similar
  return iso.replace("T", " ").replace("Z", "");
}

const PER_PAGE = 30;

export default function HomeScreen({ userId, onSignOut }: Props) {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [debug, setDebug] = useState<string>("");

  const endpoint = useMemo(() => {
    const base =
      "https://storied-donut-fd8311.netlify.app/.netlify/functions/get-activities";
    const url = `${base}?userId=${encodeURIComponent(userId)}&per_page=${PER_PAGE}`;
    return url;
  }, [userId]);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError("");
    setDebug("");

    console.log("[HomeScreen] fetching:", endpoint);

    try {
      const res = await fetch(endpoint);

      const ct = res.headers.get("content-type") ?? "";
      console.log("[HomeScreen] status:", res.status);
      console.log("[HomeScreen] content-type:", ct);

      const raw = await res.text();
      console.log("[HomeScreen] raw length:", raw.length);
      console.log("[HomeScreen] raw head:", raw.slice(0, 300));

      setDebug(
        [
          `status=${res.status}`,
          `content-type=${ct || "(none)"}`,
          `raw.length=${raw.length}`,
          `raw.head=${raw.slice(0, 120).replace(/\s+/g, " ")}`,
        ].join("\n")
      );

      // 200 でもエラーHTMLが返るケースがあるため、必ず parse を試みる
      let data: unknown;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        const msg = "JSON.parse failed. Server returned non-JSON content.";
        console.error("[HomeScreen] JSON.parse failed:", e);
        throw new Error(msg);
      }

      if (!Array.isArray(data)) {
        const msg = "Response JSON is not an array (unexpected shape).";
        console.error("[HomeScreen] unexpected JSON shape:", data);
        throw new Error(msg);
      }

      const arr = data as StravaActivity[];
      console.log("[HomeScreen] parsed array length:", arr.length);

      setActivities(arr);
    } catch (e: any) {
      const msg = typeof e?.message === "string" ? e.message : String(e);
      console.error("[HomeScreen] loadActivities error:", e);
      setError(msg);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    // userId が変わったら自動再取得
    loadActivities();
  }, [loadActivities]);

  const headerTitle = useMemo(() => {
    return `Home (Activities)`;
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{headerTitle}</Text>

        <View style={styles.headerButtons}>
          <Pressable
            style={({ pressed }) => [styles.smallButton, pressed && styles.smallButtonPressed]}
            onPress={loadActivities}
          >
            <Text style={styles.smallButtonText}>Refresh</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.smallButton,
              styles.smallButtonDanger,
              pressed && styles.smallButtonPressed,
            ]}
            onPress={onSignOut}
          >
            <Text style={styles.smallButtonText}>Sign out</Text>
          </Pressable>
        </View>
      </View>

      {/* Meta */}
      <Text style={styles.meta}>
        userId: {userId} / activities: {activities.length}
      </Text>

      {/* Loading / Error */}
      {loading && (
        <View style={styles.infoBox}>
          <ActivityIndicator />
          <Text style={styles.infoText}>Loading...</Text>
        </View>
      )}

      {!!error && (
        <View style={[styles.infoBox, styles.errorBox]}>
          <Text style={[styles.infoText, styles.errorText]}>Error: {error}</Text>
          {!!debug && (
            <Text style={[styles.debugText, styles.errorText]} selectable>
              {debug}
            </Text>
          )}
        </View>
      )}

      {!error && !!debug && (
        <View style={styles.infoBox}>
          <Text style={styles.debugText} selectable>
            {debug}
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={activities}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const sport = item.sport_type || item.type || "-";
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name || "(no name)"}</Text>
              <Text style={styles.cardSub}>
                {sport} / {formatDistance(item.distance)} / {formatDuration(item.moving_time)}
              </Text>
              <Text style={styles.cardSub}>{formatDate(item.start_date_local)}</Text>
              <Text style={styles.cardId}>id: {item.id}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No activities.</Text>
              <Text style={styles.emptyHint}>
                If you expected data, check the debug box above and the browser console logs.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: { fontSize: 20, fontWeight: "700" },
  headerButtons: { flexDirection: "row", gap: 8 },
  smallButton: {
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  smallButtonDanger: {
    backgroundColor: "#5a0b0b",
  },
  smallButtonPressed: { opacity: 0.8 },
  smallButtonText: { color: "#fff", fontWeight: "600" },

  meta: { marginBottom: 10, color: "#444" },

  infoBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    gap: 6,
  },
  infoText: { color: "#333" },
  debugText: { color: "#333", fontSize: 12, lineHeight: 16 },

  errorBox: { borderColor: "#f0b4b4", backgroundColor: "#fff6f6" },
  errorText: { color: "#7a0b0b" },

  listContent: { paddingBottom: 24 },
  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  cardSub: { color: "#444", marginBottom: 2 },
  cardId: { color: "#777", marginTop: 4, fontSize: 12 },

  emptyBox: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
  },
  emptyText: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  emptyHint: { color: "#555" },
});
