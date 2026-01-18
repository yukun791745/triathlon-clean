import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../src/screens/HomeScreen";
import TrainingScreen from "../src/screens/TrainingScreen";
import FitnessDetailScreen from "../src/screens/FitnessDetailScreen";
import SessionsListScreen from "../src/screens/SessionsListScreen";
import SessionDetailScreen from "../src/screens/SessionDetailScreen";
import SettingsScreen from "../src/screens/SettingsScreen";

type Props = {
  athleteId: string;
  onSignOut: () => void;
};

type TrainingStackParamList = {
  TrainingMain: undefined;
  FitnessDetail: undefined;
  SessionsList: undefined;
  SessionDetail: { activityId?: string } | undefined;
};

const Tab = createBottomTabNavigator();
const TrainingStack = createNativeStackNavigator<TrainingStackParamList>();

function ComingSoon({ title }: { title: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.h1}>{title}</Text>
      <Text style={styles.p}>準備中</Text>
    </View>
  );
}

function TrainingStackNavigator() {
  return (
    <TrainingStack.Navigator>
      <TrainingStack.Screen name="TrainingMain" component={TrainingScreen} options={{ title: "トレーニング" }} />
      <TrainingStack.Screen name="FitnessDetail" component={FitnessDetailScreen} options={{ title: "フィットネス詳細" }} />
      <TrainingStack.Screen name="SessionsList" component={SessionsListScreen} options={{ title: "セッション一覧" }} />
      <TrainingStack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: "セッション詳細" }} />
    </TrainingStack.Navigator>
  );
}

export default function Navigation({ athleteId, onSignOut }: Props) {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: true }}>
        <Tab.Screen name="ホーム">
          {() => <HomeScreen athleteId={athleteId} onSignOut={onSignOut} />}
        </Tab.Screen>

        <Tab.Screen name="トレーニング" component={TrainingStackNavigator} />

        <Tab.Screen name="レース">{() => <ComingSoon title="レース" />}</Tab.Screen>
        <Tab.Screen name="AIコーチ">{() => <ComingSoon title="AIコーチ" />}</Tab.Screen>
        <Tab.Screen name="ニュース">{() => <ComingSoon title="ニュース" />}</Tab.Screen>

        <Tab.Screen name="設定">
          {() => <SettingsScreen athleteId={athleteId} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  h1: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  p: { color: "#666" },
});
