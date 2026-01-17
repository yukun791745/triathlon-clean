import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { supabase } from "../lib/supabaseClient";

/**
 * Minimal ActivitiesScreen (TSX)
 * - Accepts API responses that are either:
 *   - top-level array: [ { ... }, ... ]
 *   - or wrapped: { activities: [ ... ] }
 */

const GET_ACTIVITIES_BASE =
  (typeof process !== "undefined" && (process.env as any).EXPO_PUBLIC_GET_ACTIVITIES_URL) ||
  "https://storied-donut-fd8311.netlify.app/.netlify/functions/get-activities";

export default function ActivitiesScreen({ onSignOut }: { onSignOut?: () => void }) {
  const [activities, setActivities] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function loadActivities() {
    setLoading(true);
    setError(null);
    try {
      const userId = "34646703"; // 必要なら session から取得するように変更してください
      const url = `${GET_ACTIVITIES_BASE}?userId=${encodeURIComponent(userId)}&per_page=30`;
      console.log("[Activities] fetch ->", url);
      const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
      console.log("[Activities] status", res.status, res.statusText);
      const text = await res.text();
      console.log("[Activities] raw response:", text);
      + const text = await res.text();
      + console.log("[Activities] raw_len:", text?.length);
      + console.log("[Activities] raw_start:", text?.slice(0,1000));
      + try {
      +   const tmp = JSON.parse(text);
      +   console.log("[Activities] IN-APP PARSED_TYPE:", Array.isArray(tmp)?'array':'object', "length:", Array.isArray(tmp)?tmp.length:'-');
      + } catch (e) {
      +   console.error("[Activities] IN-APP JSON parse error:", e);
      +   console.log("[Activities] raw_start_on_error:", text?.slice(0,2000));
      + }

      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.error("[Activities] JSON parse error:", e);
        setError("Invalid JSON response from server");
        setActivities([]);
        return;
      }

      // Handle both: top-level array OR { activities: [...] } wrapper
      let arr: any[] = [];
      if (Array.isArray(parsed)) {
        arr = parsed;
      } else if (Array.isArray(parsed?.activities)) {
        arr = parsed.activities;
      } else if (parsed?.activities) {
        arr = [parsed.activities];
      } else {
        arr = [];
      }

      setActivities(arr);
      console.log("[Activities] parsed length:", arr.length);
    } catch (err) {
      console.error("[Activities] fetch error:", err);
      setError(String(err));
      setActivities([]);
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
    const name = item.name || item.type || "Activity";
    const start = item.start_date || item.start_date_local || item.start || "";
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontWeight: "700" }}>{activities ? `${activities.length} activities` : "Activities"}</Text>
          <View style={{ flexDirection: "row" }}>
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
