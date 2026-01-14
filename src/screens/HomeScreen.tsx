import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Home</Text>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>ようこそ</Text>
          <Text style={styles.heroSubtitle}>ここに Figma の Home に合わせた主要情報を表示します</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>サンプルカード</Text>
          <Text style={styles.cardBody}>説明文や要約をここに入れます。ボタンでアクションを試せます。</Text>
          <TouchableOpacity style={styles.button} onPress={() => { /* デモ用 */ }}>
            <Text style={styles.buttonText}>主要アクション</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipText}>下書き: デザイン要素や余白、色は後で Figma に合わせて調整します</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scroll: { padding: 20, alignItems: "center" },
  header: { fontSize: 24, fontWeight: "700", alignSelf: "flex-start", marginBottom: 12 },
  hero: { width: "100%", padding: 16, backgroundColor: "#f0f4ff", borderRadius: 12, marginBottom: 16 },
  heroTitle: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: "#444" },
  card: { width: "100%", padding: 16, backgroundColor: "#f7f8fa", borderRadius: 12, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  cardBody: { fontSize: 14, color: "#333", marginBottom: 12 },
  button: { alignSelf: "flex-start", backgroundColor: "#246BFD", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
  tip: { marginTop: 8 },
  tipText: { fontSize: 12, color: "#666" },
});
