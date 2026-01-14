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
import { Ionicons } from "@expo/vector-icons";

const NAV_HEIGHT = 64;

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.dateText}>2026年1月10日（金）</Text>
        <TouchableOpacity style={styles.iconButton} accessibilityLabel="設定">
          <Ionicons name="settings-outline" size={22} color="#222" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* セクション1: AIコーチ */}
        <View style={[styles.card, styles.coachOuter]}>
          <View style={styles.coachInner}>
            <View style={styles.coachHeader}>
              <Ionicons name="star" size={18} color="#FFD54A" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>AIコーチのひとこと</Text>
            </View>
            <Text style={styles.coachText}>
              今日はコンディション良好。高強度トレーニングに最適です。レース前の勢いを維持するため、テンポランを推奨します。
            </Text>
            <TouchableOpacity style={styles.coachLink}>
              <Text style={styles.linkText}>AIコーチに相談する</Text>
              <Ionicons name="chevron-forward" size={16} color="#4F6BFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* セクション2: フィットネス概要 */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>フィットネス概要</Text>
            <TouchableOpacity>
              <Text style={styles.smallLink}>詳細を見る ＞</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metricsRow}>
            <MiniMetric label="フィットネス" value="87" unit="CTL" diff="+3" diffColor="#4F6BFF" />
            <MiniMetric label="疲労" value="62" unit="ATL" diff="-8" diffColor="#FF4DA6" />
            <MiniMetric label="コンディション" value="25" unit="TSB" diff="+11" diffColor="#6C63FF" />
          </View>
        </View>

        {/* セクション3: 最近のアクティビティ */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>最近のアクティビティ</Text>
            <TouchableOpacity>
              <Text style={styles.smallLink}>AIコーチのコメントを見る ＞</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityBox}>
            <View style={styles.activityLeft}>
              <Text style={styles.activityTitle}>持久力スイムセッション</Text>
              <View style={styles.metaRow}>
                <Text style={styles.activityMeta}>2026年1月9日（木） 17:30</Text>
                <View style={styles.tag}><Text style={styles.tagText}>スイム</Text></View>
              </View>
            </View>

            <View style={styles.activityRight}>
              <Stat label="距離" value="3.2 km" />
              <Stat label="時間" value="1:24" />
              <Stat label="ペース" value="2:38 /100m" />
              <Stat label="TSS" value="68" />
            </View>
          </View>
        </View>

        {/* セクション4: 参加予定レース */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>参加予定レース</Text>
            <TouchableOpacity>
              <Text style={styles.smallLink}>すべてのレースを見る ＞</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.raceRow}>
            <View style={styles.raceLeft}>
              <View style={[styles.badge, styles.badgeA]}><Text style={styles.badgeText}>A</Text></View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.raceTitle}>オリンピックディスタンス・トライアスロン</Text>
                <Text style={styles.raceMeta}>日付: 2026年1月18日（日） ・ あと8日</Text>

                <View style={styles.raceTimes}>
                  <View style={styles.timeCol}>
                    <Text style={styles.timeLabel}>目標</Text>
                    <Text style={styles.timeValue}>2:30:00</Text>
                  </View>
                  <View style={styles.timeCol}>
                    <Text style={styles.timeLabel}>予想</Text>
                    <Text style={[styles.timeValue, { color: "#FF4D4D" }]}>2:28:15</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.raceRow}>
            <View style={styles.raceLeft}>
              <View style={[styles.badge, styles.badgeB]}><Text style={styles.badgeText}>B</Text></View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.raceTitle}>スプリント・トライアスロン大会</Text>
                <Text style={styles.raceMeta}>日付: 2026年2月15日（日） ・ あと36日</Text>

                <View style={styles.raceTimes}>
                  <View style={styles.timeCol}>
                    <Text style={styles.timeLabel}>目標</Text>
                    <Text style={styles.timeValue}>1:15:00</Text>
                  </View>
                  <View style={styles.timeCol}>
                    <Text style={styles.timeLabel}>予想</Text>
                    <Text style={[styles.timeValue, { color: "#FF4D4D" }]}>1:13:42</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* セクション5: 最新ニュース */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>最新ニュース</Text>
            <TouchableOpacity>
              <Text style={styles.smallLink}>すべてのニュースを見る ＞</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.newsList}>
            <View style={styles.newsItem}>
              <Text style={styles.newsTitle}>2026アイアンマン世界選手権プレビュー：注目すべきトップ候補選手（Triathlete）</Text>
              <Text style={styles.newsSource}>Triathlete</Text>
              <View style={styles.tagsRow}>
                <View style={styles.newsTag}><Text style={styles.newsTagText}>日本語要約あり</Text></View>
              </View>
            </View>

            <View style={styles.newsItem}>
              <Text style={styles.newsTitle}>冬のトレーニング戦略：オフシーズンを無駄にしない方法（Triathlon Magazine）</Text>
              <Text style={styles.newsSource}>Triathlon Magazine</Text>
            </View>

            <View style={styles.newsItem}>
              <Text style={styles.newsTitle}>バイクフィットの基礎：なぜプロフェッショナルなフィッティングが重要なのか（Slowtwitch）</Text>
              <Text style={styles.newsSource}>Slowtwitch</Text>
              <View style={styles.tagsRow}>
                <View style={styles.newsTag}><Text style={styles.newsTagText}>日本語要約あり</Text></View>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: NAV_HEIGHT + 24 }} />
      </ScrollView>

      {/* 固定ボトムナビ */}
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

/* 小コンポーネント */
function MiniMetric({ label, value, unit, diff, diffColor }: any) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValueBig}>{value}</Text>
      <Text style={styles.metricUnitSmall}>{unit}</Text>
      <Text style={[styles.metricDiffSmall, { color: diffColor }]}>{diff}</Text>
      <Text style={styles.metricLabelSmall}>{label}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function NavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <TouchableOpacity style={styles.navItem}>
      <Ionicons name={icon as any} size={20} color={active ? "#FF5A5F" : "#9B9B9B"} />
      <Text style={[styles.navLabel, active ? { color: "#FF5A5F", fontWeight: "600" } : {}]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* スタイル */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { padding: 16, paddingBottom: 32 },

  /* Header */
  headerRow: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  dateText: { fontSize: 15, fontWeight: "700", color: "#111" },
  iconButton: { padding: 8 },

  /* Card general */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
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
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  smallLink: { color: "#666", fontSize: 13 },

  /* Coach card (outer blue + inner white bubble) */
  coachOuter: { backgroundColor: "#EEF3FF", padding: 14, borderRadius: 14 },
  coachInner: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12 },
  coachHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  coachText: { color: "#333", fontSize: 14, lineHeight: 20, textAlign: "left", marginBottom: 10 },
  coachLink: { flexDirection: "row", alignItems: "center", alignSelf: "flex-end" },
  linkText: { color: "#4F6BFF", fontWeight: "600", marginRight: 6 },

  /* Metrics */
  metricsRow: { flexDirection: "row", justifyContent: "space-between" },
  metricCard: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F3F5",
  },
  metricValueBig: { fontSize: 20, fontWeight: "800", color: "#111" },
  metricUnitSmall: { fontSize: 12, color: "#999", marginTop: 4 },
  metricDiffSmall: { fontSize: 12, fontWeight: "700", marginTop: 6 },
  metricLabelSmall: { fontSize: 12, color: "#666", marginTop: 8 },

  /* Activity */
  activityBox: { flexDirection: "row", justifyContent: "space-between" },
  activityLeft: { flex: 1, paddingRight: 8 },
  activityRight: { width: 120, alignItems: "flex-end" },
  activityTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center" },
  activityMeta: { fontSize: 12, color: "#666" },
  tag: { backgroundColor: "#EDE7FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  tagText: { fontSize: 12, color: "#6C63FF", fontWeight: "600" },
  statRow: { alignItems: "flex-end" },
  statLabel: { fontSize: 11, color: "#888" },
  statValue: { fontSize: 14, fontWeight: "700", color: "#2F6BFF" },

  /* Races */
  raceRow: { paddingVertical: 8, borderBottomWidth: 0 },
  raceLeft: { flexDirection: "row", alignItems: "flex-start" },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  badgeA: { backgroundColor: "#FFCDD2" },
  badgeB: { backgroundColor: "#FFE0B2" },
  badgeText: { fontWeight: "800", color: "#8B0000" },
  raceTitle: { fontSize: 14, fontWeight: "700" },
  raceMeta: { fontSize: 12, color: "#666", marginTop: 6 },
  raceTimes: { flexDirection: "row", marginTop: 8 },
  timeCol: { flex: 1 },
  timeLabel: { fontSize: 11, color: "#888" },
  timeValue: { fontSize: 14, fontWeight: "700", color: "#111" },

  /* News */
  newsList: {},
  newsItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F5F6F8" },
  newsTitle: { fontSize: 14, fontWeight: "700", color: "#111" },
  newsSource: { fontSize: 12, color: "#999", marginTop: 6 },
  tagsRow: { flexDirection: "row", marginTop: 8 },
  newsTag: { backgroundColor: "#F0EBFF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  newsTagText: { fontSize: 11, color: "#6C63FF", fontWeight: "700" },

  /* Bottom nav */
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
  navLabel: { fontSize: 11, color: "#9B9B9B", marginTop: 2 },
});
