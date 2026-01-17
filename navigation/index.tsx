import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * Temporary placeholder navigation to unblock TypeScript builds.
 *
 * The app currently uses App.tsx as the minimal router:
 *  - AuthScreen -> HomeScreen (with athleteId)
 *
 * We will re-introduce React Navigation later with proper screen wrappers.
 */
export default function Navigation() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigation (temporary)</Text>
      <Text style={styles.note}>
        This file is intentionally a placeholder to unblock builds. The app entry is App.tsx.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  note: { color: "#666", textAlign: "center" },
});
