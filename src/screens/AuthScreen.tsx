import React, { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";

type Props = {
  onSignedIn: (athleteId: string) => void;
};

/**
 * AuthScreen
 * - athleteId を入力して Continue
 * - 未入力なら DEFAULT_ATHLETE_ID を使って Continue
 * - 「毎回入力が面倒」を解消するための最小実装
 */
export default function AuthScreen({ onSignedIn }: Props) {
  // あなたの既定 athleteId（必要ならここだけ変更）
  const DEFAULT_ATHLETE_ID = "34646703";

  const [athleteIdInput, setAthleteIdInput] = useState<string>("");

  const effectiveAthleteId = useMemo(() => {
    const trimmed = (athleteIdInput ?? "").trim();
    return trimmed.length > 0 ? trimmed : DEFAULT_ATHLETE_ID;
  }, [athleteIdInput]);

  const handleContinue = useCallback(() => {
    // 入力が空でも DEFAULT を採用して進む
    onSignedIn(effectiveAthleteId);
  }, [effectiveAthleteId, onSignedIn]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.h1}>Sign In</Text>
        <Text style={styles.p}>
          Strava athleteId を入力して Continue を押してください。
          未入力の場合は既定値で進みます。
        </Text>

        <Text style={styles.label}>athleteId</Text>
        <TextInput
          value={athleteIdInput}
          onChangeText={setAthleteIdInput}
          placeholder={DEFAULT_ATHLETE_ID}
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Default: {DEFAULT_ATHLETE_ID}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "#fff" },
  card: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  h1: { fontSize: 20, fontWeight: "700", marginBottom: 8, color: "#111827" },
  p: { color: "#374151", marginBottom: 14, lineHeight: 20 },
  label: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  note: { marginTop: 10, color: "#6b7280", fontSize: 12 },
});