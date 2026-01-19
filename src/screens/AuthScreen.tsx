import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

type Props = {
  onSignedIn: (athleteId: string) => void;
};

const DEFAULT_ATHLETE_ID = "34646703";

export default function AuthScreen({ onSignedIn }: Props) {
  const [athleteId, setAthleteId] = useState("");

  function handleContinue() {
    const trimmed = athleteId.trim();
    const idToUse = trimmed.length > 0 ? trimmed : DEFAULT_ATHLETE_ID;

    console.log("[AuthScreen] continue with athleteId =", idToUse);
    onSignedIn(idToUse);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <Text style={styles.label}>Athlete ID (temporary)</Text>
      <TextInput
        value={athleteId}
        onChangeText={setAthleteId}
        placeholder={DEFAULT_ATHLETE_ID}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Continue" onPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
});
