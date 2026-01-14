import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const NAV_HEIGHT = 64;

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.dateText}>2026年1月10日（金）</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="settings-outline" size={22} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>AIコーチのひとこと</Text>
          <Text style={styles.heroSubtitle}>
            今日はコンディション良好。高強度トレーニングに最適です。レース前の勢いを維持するため、テンポランを推奨します。
          </Text>
        </View>

        {/* AIコーチカード */}
        <View style={[styles.card, styles.coachCard]}>
          <View style={styles.coachHeader}>
            <Ionicons name="star" size={18} color="#FFD54A" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>AIコーチのひとこと</Text>
          </View>
          <View style={styles.coachBody}>
            <Text style={styles.coachBodyText}>
              あなたの最近の負荷から判断すると、今日はテンポラン（LT付近）を45分行うことを提案します。ウォームアップを十分に。
            </Text>
            <TouchableOpacity style={styles.linkRow}>
              <Text style={styles.linkText}>AIコーチに相談する</Text>
              <Ionicons name="chevron-forward" size={18} color="#4F6BFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* フィットネス概要カード */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>フィットネス概要</Text>
            <TouchableOpacity>
              <Text style={styles.smallLink}>詳細を見る</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>87</Text>
              <Text style={styles.metricLabel}>フィットネス</Text>
              <Text style={[styles.metricDiff, { color: "#4F6BFF" }]}>+3</Text>
              <Text style={styles.metricUnit}>（CTL）</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>62</Text>
              <Text style={styles.metricLabel}>疲労</Text>
              <Text style={[styles.metricDiff, { color: "#FF4DA6" }]}>-8</Text>
              <Text style={styles.metricUnit}>（ATL）</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>25</Text>
              <Text style={styles.metricLabel}>コンディション</Text>
              <Text style={[styles.metricDiff, { color: "#6C63FF" }]}>+11</Text>
              <Text style={styles.metricUnit}>（TSB）</Text>
            </View>
          </View>
        </View>

        {/* 最近のアクティビティカード */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>最近のアクティビティ</Text>
            <TouchableOpacity>
              <Text style={styles.smallLink}>AIコーチのコメントを見る</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityRow}>
            <View style={styles.activityLeft}>
              <Text style={styles.activityTitle}>持久力スイムセッション</Text>
              <Text style={styles.activityMeta}>2026年1月9日（木）17:30  •  スイム</Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={styles.activityStat}>3.2 km</Text>
              <Text style={styles.activityStatSmall}>1:24</Text>
              <Text style={styles.activityStatSmall}>Pace 2:38/100m</Text>
              <Text style={styles.activityStatSmall}>TSS 68</Text>
            </View>
          </View>
        </View>

        {/* 参加予定レースカード */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>参加予定レース</Text>
            <TouchableOpacity>
              <Text style={styles.smallLink}>すべてのレースを見る</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.raceItem}>
            <View style={styles.raceLeft}>
              <View style={styles.badgeA}>
                <Text style={styles.badgeText}>A</Text>
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.raceTitle}>オリンピックディスタンス・トライアスロン</Text>
                <Text style={styles.raceMeta}>日付: 2026年1月18日（日） ・ あと8日</Text>
                <Text style={styles.raceMeta}>目標 2:30:00 ・ 予想 2:28:15</Text>
              </View>
            </View>
          </View>

          <View style={styles.raceItem}>
            <View style={styles.raceLeft}>
              <View style={styles.badgeB}>
                <Text style={styles.badgeText}>B</Text>
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.raceTitle}>スプリント・トライアスロン大会</Text>
                <Text style={styles.raceMeta}>日付: 2026年2月15日（日） ・ あと36日</Text>
                <Text style={styles.raceMeta}>目標 1:15:00 ・ 予想 1:13:42</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 最新ニュースカード */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>最新ニュース</Text>
            <TouchableOpacity>
              <Text style={styles.smallLink}>すべてのニュースを見る</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.newsList}>
            <View style={styles.newsItem}>
              <Text style={styles.newsTitle}>2026アイアンマン世界選手権プレビュー：注目すべきトップ候補選手（Triathlete）</Text>
              <View style={styles.tagsRow}>
                <View style={styles.tag}><Text style={styles.tagText}>日本語要約あり</Text></View>
              </View>
            </View>

            <View style={styles.newsItem}>
              <Text style={styles.newsTitle}>冬のトレーニング戦略：オフシーズンを無駄にしない方法（Triathlon Magazine）</Text>
            </View>

            <View style={styles.newsItem}>
              <Text style={styles.newsTitle}>バイクフィットの基礎：なぜプロフェッショナルなフィッティングが重要なのか（Slowtwitch）</Text>
              <View style={styles.tagsRow}>
                <View style={styles.tag}><Text style={styles.tagText}>日本語要約あり</Text></View>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: NAV_HEIGHT + 24 }} />
      </ScrollView>

      {/* 固定ボトムナビゲーション */}
      <View style={styles.bottomNav}>
        <NavItem icon="home" label="ホーム" active />
        <NavItem icon="barbell" label="トレーニング" />
        <NavItem icon="flag" label="レース" />
        <NavItem icon="chatbubble-ellipses" label="AIコーチ" />
        <NavItem icon="newspaper" label="ニュース" />
        <NavItem icon="settings" label="設定" />
      </View>
    </SafeAreaView>
  );
}

/* 小さなコンポーネント: ナビアイテム */
function NavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <TouchableOpacity style={styles.navItem}>
      <Ionicons
        name={icon as any}
        size={20}
        color={active ? "#FF5A5F" : "#777"}
        style={{ marginBottom: 2 }}
      />
      <Text style={[styles.navLabel, active ? { color: "#FF5A5F", fontWeight: "600" } : {}]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { padding: 16, paddingBottom: 32 },
  headerRow: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: { fontSize: 16, fontWeight: "700", color: "#111" },
  iconButton: { padding: 8 },

  hero: {
    backgroundColor: "#EAF0FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  heroTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6, color: "#222" },
  heroSubtitle: { fontSize: 14, color: "#333", lineHeight: 20 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    // shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  coachCard: {
    backgroundColor: "#EAF6FF",
  },
  coachHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  coachBody: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
  },
  coachBodyText: { color: "#333", fontSize: 14, marginBottom: 10 },
  linkRow: { flexDirection: "row", alignItems: "center", alignSelf: "flex-end" },
  linkText: { color: "#4F6BFF", fontWeight: "600", marginRight: 6 },

  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  smallLink: { color: "#666", fontSize: 13 },

  metricsRow: { flexDirection: "row", justifyContent: "space-between" },
  metricItem: { alignItems: "center", flex: 1 },
  metricValue: { fontSize: 20, fontWeight: "800", color: "#111" },
  metricLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  metricDiff: { fontSize: 12, fontWeight: "700", marginTop: 6 },
  metricUnit: { fontSize: 11, color: "#999" },

  activityRow: { flexDirection: "row", justifyContent: "space-between" },
  activityLeft: { flex: 1, paddingRight: 8 },
  activityRight: { width: 110, alignItems: "flex-end" },
  activityTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  activityMeta: { fontSize: 12, color: "#666" },
  activityStat: { fontSize: 15, fontWeight: "700", color: "#111" },
  activityStatSmall: { fontSize: 12, color: "#666" },

  raceItem: { marginBottom: 12 },
  raceLeft: { flexDirection: "row", alignItems: "flex-start" },
  badgeA: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFCDD2",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeB: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFE0B2",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontWeight: "800", color: "#8B0000" },
  raceTitle: { fontSize: 14, fontWeight: "700" },
  raceMeta: { fontSize: 12, color: "#666" },

  newsList: {},
  newsItem: { paddingVertical: 8, borderBottomColor: "#F1F1F1", borderBottomWidth: 1 },
  newsTitle: { fontSize: 14, color: "#111" },
  tagsRow: { flexDirection: "row", marginTop: 6 },
  tag: { backgroundColor: "#E5E8FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  tagText: { fontSize: 11, color: "#4F6BFF" },

  bottomNav: {
    height: NAV_HEIGHT,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopColor: "#EEE",
    borderTopWidth: 1,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 12 : 0,
  },
  navItem: { alignItems: "center", justifyContent: "center", width: 56 },
  navLabel: { fontSize: 11, color: "#777" },
});
