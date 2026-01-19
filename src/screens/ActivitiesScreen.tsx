import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Button, FlatList, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabaseClient";

const GET_ACTIVITIES_BASE =
  (typeof process !== "undefined" && (process.env as any).EXPO_PUBLIC_GET_ACTIVITIES_URL) ||
  "https://storied-donut-fd8311.netlify.app/.netlify/functions/get-activities";

type Props = {
  onSignOut?: () => void;
};

export default function ActivitiesScreen({ onSignOut }: Props) {
  const [activities, setActivities] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const perPage = 30;
  const userId = "34646703"; // TODO: make dynamic later

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${GET_ACTIVITIES_BASE}?userId=${encodeURIComponent(userId)}&per_page=${perPage}`;
      console.log("[ActivitiesScreen] fetching:", url);

      const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
      const text = await res.text();
      console.log("[ActivitiesScreen] raw:", text.slice(0, 200));

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = JSON.parse(text);
          msg = j?.error ? `${msg}: ${j.error}` : msg;
        } catch {}
        setError(msg);
        console.error("[ActivitiesScreen] non-OK:", res.status, text);
        return;
      }

      let json: any;
      try {
        json = JSON.parse(text);
      } catch (e) {
        setError("Invalid JSON response");
        console.error("[ActivitiesScreen] JSON parse error:", e, "raw:", text.slice(0, 400));
        return;
      }

      // ✅ Netlify function が配列を直接返すパターンと {activities:[...]} の両対応
      const list = Array.isArray(json) ? json : Array.isArray(json?.activities) ? json.activities : [];
      setActivities(list);
      console.log("[ActivitiesScreen] activities:", list.length);
    } catch (e) {
      setError(String(e));
      console.error("[ActivitiesScreen] fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const signOut = useCallback(async () => {
    try {
      console.log("[ActivitiesScreen] signOut pressed");
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("[ActivitiesScreen] signOut error:", signOutError);
        Alert.alert("Sign out failed", signOutError.message);
        return;
      }
      onSignOut?.();
      console.log("[ActivitiesScreen] signed out OK");
    } catch (e) {
      console.error("[ActivitiesScreen] signOut exception:", e);
      Alert.alert("Sign out failed", String(e));
    }
  }, [onSignOut]);

  function renderItem({ item }: { item: any }) {
    const name = item?.name || item?.type || "Activity";
    const start = item?.start_date_local || item?.start_date || item?.start;
    const sport = item?.sport_type || item?.type;
    return (
      <View style={styles.item}>
        <Text style={styles.title}>
          {name} {sport ? `(${sport})` : ""}
        </Text>
        {start ? <Text style={styles.sub}>{start}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Activities</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.count}>{activities ? `${activities.length} activities` : "Activities"}</Text>

          <View style={styles.rowButtons}>
            <Button title="Refresh" onPress={fetchActivities} />
            <View style={{ width: 10 }} />
            <Button title="Sign Out" onPress={signOut} />
          </View>
        </View>

        <View style={{ height: 12 }} />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.note}>Loading...</Text>
          </View>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : activities && activities.length > 0 ? (
          <FlatList data={activities} keyExtractor={(item) => String(item?.id ?? Math.random())} renderItem={renderItem} />
        ) : (
          <Text style={styles.note}>No activities found.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  header: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, flex: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowButtons: { flexDirection: "row", alignItems: "center" },
  count: { fontWeight: "700" },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 16 },
  note: { color: "#666", marginTop: 6 },
  error: { color: "crimson" },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontWeight: "600" },
  sub: { color: "#666", marginTop: 4, fontSize: 12 },
});
