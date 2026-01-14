import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>ここに Figma の Home 画面に似た要素を置きます</Text>

        <TouchableOpacity style={styles.button} onPress={() => { /* デモ用の空ハンドラ */ }}>
          <Text style={styles.buttonText}>ボタン（タップ）</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.helper}>この画面はテンプレートです。スクショを PR に添付して先生に見せてね。</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: 16 },
  card: { width: "100%", maxWidth: 420, padding: 20, backgroundColor: "#f7f8fa", borderRadius: 12, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#444", marginBottom: 16, textAlign: "center" },
  button: { backgroundColor: "#246BFD", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
  helper: { marginTop: 16, color: "#888", fontSize: 12 },
});
