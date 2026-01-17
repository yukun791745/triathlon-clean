import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

/**
 * Minimal AuthScreen
 * - collects Athlete ID then calls onSignIn(athleteId)
 */
type Props = {
  onSignIn: (athleteId: string) => void;
};

export default function AuthScreen({ onSignIn }: Props) {
  const [athleteId, setAthleteId] = useState("");

  const canContinue = athleteId.trim().length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in (Minimal)</Text>

      <Text style={styles.label}>Athlete ID (temporary)</Text>
      <TextInput
        value={athleteId}
        onChangeText={setAthleteId}
        placeholder="e.g. 34646703"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          !canContinue && styles.buttonDisabled,
          pressed && canContinue && styles.buttonPressed,
        ]}
        disabled={!canContinue}
        onPress={() => onSignIn(athleteId.trim())}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>

      <Text style={styles.note}>
        This is a placeholder Auth screen. OAuth/Supabase session integration will be wired after UI flow is stable.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  note: { marginTop: 12, color: "#666", fontSize: 12 },
});
