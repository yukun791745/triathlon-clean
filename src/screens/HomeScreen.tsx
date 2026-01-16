import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { supabase } from "../lib/supabaseClient";

/**
 * HomeScreen
 * - calls the Netlify function to get activities
 * - shows a simple list (activity name + date)
 *
 * NOTE: This uses a hardcoded example userId query param (34646703) used earlier during debugging.
 * Replace the userId or make it dynamic if needed.
 */

const GET_ACTIVITIES_BASE =
  // Optionally use an env var: EXPO_PUBLIC_GET_ACTIVITIES_URL
  (typeof process !== "undefined" && (process.env as any).EXPO_PUBLIC_GET_ACTIVITIES_URL) ||
  "https://storied-donut-fd8311.netlify.app/.netlify/functions/get-activities";

export default function HomeScreen({ onSignOut }: { onSignOut?: () => void }) {
  const [activities, setActivities] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadActivities() {
    setLoading(true);
    setError(null);
    try {
      // Replace or compute userId dynamically if you have it saved in session metadata
      const userId = "34646703";
      const url = `${GET_ACTIVITIES_BASE}?userId=${encodeURIComponent(userId)}&per_page=30`;
      console.log("[HomeScreen] fetching activities from:", url);
      const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
      console.log("[HomeScreen] status:", res.status, res.statusText);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        // Expecting { activities: [...] } as earlier
        setActivities(Array.isArray(json.activities) ? json.activities : json.activities ? [json.activities] : []);
      } catch (e) {
        // If response is plain text or not JSON
        setError("Invalid JSON response");
        console.error("[HomeScreen] parse error", e, "raw:", text);
      }
    } catch (err) {
      setError(String(err));
      console.error("[HomeScreen] fetch error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    if (onSignOut) onSignOut();
  }

  function renderItem({ item }: { item: any }) {
    // Try to show common Strava activity fields if present
    const name = item.name || item.type || "Activity";
    const start = item.start_date || item.start_date_local || item.start;
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{name}</Text>
        {start ? <Text style={styles.sub}>{start}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Home (Activities)</Text>

      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontWeight: "700" }}>{activities ? `${activities.length} activities` : "Activities"}</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button title="Refresh" onPress={loadActivities} />
            <View style={{ width: 8 }} />
            <Button title="Sign Out" onPress={signOut} />
          </View>
        </View>

        <View style={{ height: 12 }} />

        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text style={{ color: "red" }}>Error: {error}</Text>
        ) : activities && activities.length > 0 ? (
          <FlatList data={activities} keyExtractor={(it, i) => (it.id ? String(it.id) : String(i))} renderItem={renderItem} />
        ) : (
          <Text>No activities found.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 20, fontWeight: "700" },
  card: { marginTop: 12, backgroundColor: "#fff", padding: 12, borderRadius: 12, minHeight: 200 },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 16, fontWeight: "600" },
  sub: { color: "#666", marginTop: 2 },
});
