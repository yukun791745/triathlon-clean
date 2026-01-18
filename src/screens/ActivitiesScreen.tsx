import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Button, FlatList, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabaseClient";

/**
 * ActivitiesScreen (NO navigation dependency)
 * - Fetches activities from Netlify function
 * - Shows a list
 * - Sign Out: calls supabase.auth.signOut() then calls onSignOut (parent can switch screen)
 */

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

      if (!res.ok) {
        // Try to show a helpful error message
        let msg = `HTTP ${res.status}`;
        try {
          const j = JSON.parse(text);
          msg = j?.error ? `${msg}: ${j.error}` : msg;
        } catch {}
        setError(msg);
        console.error("[ActivitiesScreen] non-OK:", res.status, text);
        return;
      }

      try {
        const json = JSON.parse(text);
        const list = Array.isArray(json?.activities) ? json.activities : [];
        setActivities(list);
      } catch (e) {
        setError("Invalid JSON response");
        console.error("[ActivitiesScreen] JSON parse error:", e, "raw:", text.slice(0, 400));
      }
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

      // Parent router (App.tsx) should flip signed-in state
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
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{name}</Text>
        {start ? <Text style={styles.sub}>{start}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Activities</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.count}>
            {activities ? `${activities.length} activities` : "Activities"}
          </Text>

          <View style={styles.rowButtons}>
            <Button title="Refresh" onPress={fetchActivities} />
            <View style={{ width: 10 }} />
            <Button title="Sign Out" onPress={signOut} />
          </View>
        </View>

        <View style={{ height: 12 }} />

        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text style={{ color: "red" }}>Error: {error}</Text>
        ) : activities && activities.length > 0 ? (
          <FlatList
            data={activities}
            keyExtractor={(it, i) => (it?.id ? String(it.id) : String(i))}
            renderItem={renderItem}
          />
        ) : (
          <Text>No activities found.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "700" },
  card: { marginTop: 12, backgroundColor: "#fff", padding: 12, borderRadius: 12, minHeight: 200 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowButtons: { flexDirection: "row", alignItems: "center" },
  count: { fontWeight: "700" },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 16, fontWeight: "600" },
  sub: { color: "#666", marginTop: 2 },
});
