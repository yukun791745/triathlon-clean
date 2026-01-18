import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, ActivityIndicator, StyleSheet } from "react-native";

type Props = {
  athleteId: string;
  onSignOut?: () => void;
};

const GET_ACTIVITIES_BASE =
  (typeof process !== "undefined" && (process.env as any).EXPO_PUBLIC_GET_ACTIVITIES_URL) ||
  "https://storied-donut-fd8311.netlify.app/.netlify/functions/get-activities";

export default function HomeScreen({ athleteId, onSignOut }: Props) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadActivities() {
    setLoading(true);
    setError(null);

    const userId = athleteId || "34646703";
    const url = `${GET_ACTIVITIES_BASE}?userId=${encodeURIComponent(userId)}&per_page=30`;

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
      setActivities(list);
    } catch (e: any) {
      console.error("[HomeScreen] ERROR", e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  function renderItem({ item }: { item: any }) {
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{item.name ?? "Activity"}</Text>
        <Text style={styles.sub}>{item.start_date ?? item.start_date_local}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Home (Activities)</Text>

      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>{activities.length} activities</Text>
          <Button title="Sign Out" onPress={onSignOut} />
        </View>

        {loading && <ActivityIndicator />}
        {error && <Text style={{ color: "red" }}>{error}</Text>}

        <FlatList
          data={activities}
          keyExtractor={(it, i) => String(it.id ?? i)}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 20, fontWeight: "700" },
  card: { marginTop: 12, backgroundColor: "#fff", padding: 12, borderRadius: 12 },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 16, fontWeight: "600" },
  sub: { color: "#666" },
});
