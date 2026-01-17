import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

/**
 * Temporary placeholder to unblock TypeScript builds.
 * (We are currently using HomeScreen.tsx for the activities list.)
 */
export default function ActivitiesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ActivitiesScreen (temporary)</Text>
      <Text style={styles.note}>
        This screen is temporarily simplified to unblock builds. The app currently uses HomeScreen.tsx.
      </Text>
      <Button title="OK" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  note: { color: "#666", marginBottom: 16 },
});
