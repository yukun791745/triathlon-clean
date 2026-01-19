import React, { useMemo, useState } from "react";
import { Platform } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AuthScreen from "./src/screens/AuthScreen";
import ActivitiesScreen from "./src/screens/ActivitiesScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

type RootTabParamList = {
  Activities: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [athleteId, setAthleteId] = useState<string>("34646703"); // デフォルト（AuthScreen側の挙動に合わせて後で整理可）

  const navTheme = useMemo(() => {
    return {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: "#2563eb",
        background: "#ffffff",
        card: "#ffffff",
        text: "#111827",
        border: "#e5e7eb",
        notification: "#2563eb",
      },
    };
  }, []);

  if (!signedIn) {
    return (
      <AuthScreen
        onSignedIn={(id: string) => {
          setAthleteId(id);
          setSignedIn(true);
        }}
      />
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarHideOnKeyboard: Platform.OS !== "web",
        }}
      >
        <Tab.Screen name="Activities" options={{ title: "Activities" }}>
          {() => <ActivitiesScreen athleteId={athleteId} onSignOut={() => setSignedIn(false)} />}
        </Tab.Screen>

        <Tab.Screen name="Settings" options={{ title: "Settings" }}>
          {() => <SettingsScreen athleteId={athleteId} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}