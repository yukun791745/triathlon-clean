import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

type ActivityItem = {
  id: number;
  name?: string;
  start_date?: string;
};

type Props = {
  onSignOut?: () => void;
};

export default function ActivitiesScreen({ onSignOut }: Props) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const userId = "34646703";
  const perPage = 30;
  const url = `https://storied-donut-fd8311.netlify.app/.netlify/functions/get-activities?userId=${userId}&per_page=${perPage}`;
  const navigation = useNavigation();

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(url);
      const text = await res.text();

      if (__DEV__) {
        console.log("[Activities] fetch ->", url);
        console.log("[Activities] status", res.status, res.statusText);
        console.log("[Activities] raw response head:", (text || "").slice(0, 400));
      }

      let arr: ActivityItem[] = [];
      try {
        arr = JSON.parse(text);
      } catch (parseErr) {
        arr = [];
        if (__DEV__) {
          console.log("[Activities] JSON parse error:", parseErr);
        }
      }

      setActivities(arr);
      if (__DEV__) {
        console.log("[Activities] parsed length:", arr.length);
      }
    } catch (err) {
      if (__DEV__) {
        console.log("[Activities] fetch error:", err);
      }
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // 発火確認用ハンドラ（必ずログと Alert を出す）
  const handleSignOut = useCallback(() => {
    console.log("[Activities] signOut pressed (TEMP CHECK)");
    Alert.alert("SIGN OUT", "signOut pressed (TEMP CHECK)", [{ text: "OK" }]);

    if (typeof onSignOut === "function") {
      console.log("[Activities] calling parent onSignOut() (TEMP CHECK)");
      onSignOut();
      return;
    }

    // フォールバック：navigation.reset（必要に応じてルート名を変更）
    try {
      // @ts-ignore
      navigation.reset({
        index: 0,
        routes: [{ name: "SignIn" }],
      });
      console.log("[Activities] navigation.reset called (TEMP CHECK)");
    } catch (err) {
      console.log("[Activities] navigation.reset failed (TEMP CHECK):", err);
    }
  }, [navigation, onSignOut]);

  const renderItem = ({ item }: { item: ActivityItem }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name ?? "—"}</Text>
      <Text style={styles.sub}>{item.start_date ?? ""}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Activities</Text>

        <View style={styles.controls}>
          <Text style={styles.count}>{activities.length} activities</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              fetchActivities();
            }}
          >
            <Text style={styles.buttonText}>REFRESH</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signout]}
            onPress={handleSignOut}
          >
            <Text style={styles.buttonText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={activities}
            keyExtractor={(i) => String(i.id)}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            style={{ width: "100%" }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 360,
    maxWidth: "90%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 3,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  count: {
    marginRight: 8,
    fontSize: 12,
    color: "#333",
  },
  button: {
    backgroundColor: "#0b84ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 6,
  },
  signout: {
    backgroundColor: "#2b9cff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  item: {
    paddingVertical: 10,
  },
  title: {
    fontWeight: "700",
  },
  sub: {
    color: "#666",
    marginTop: 2,
    fontSize: 12,
  },
  sep: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
});
