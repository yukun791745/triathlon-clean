import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

type Props = {
  onSignIn: (athleteId: string) => void;
};

const DEFAULT_ATHLETE_ID = "34646703";

export default function AuthScreen({ onSignIn }: Props) {
  const [athleteId, setAthleteId] = useState("");

  function handleContinue() {
    const trimmed = athleteId.trim();
    const idToUse = trimmed.length > 0 ? trimmed : DEFAULT_ATHLETE_ID;
    onSignIn(idToUse);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in (Minimal)</Text>

      <Text style={styles.label}>Athlete ID (temporary)</Text>
      <TextInput
        value={athleteId}
        onChangeText={setAthleteId}
        placeholder={`e.g. ${DEFAULT_ATHLETE_ID}`}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      {/* disabled を使わない */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>

      <Text style={styles.note}>
        Placeholder Auth screen. OAuth will be wired later.
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
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  note: { marginTop: 12, color: "#666", fontSize: 12 },
});
