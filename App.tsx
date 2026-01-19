cd /Users/yujirotsutsumi/Desktop/triathlon-clean

cat > App.tsx <<'TS'
import React, { useMemo, useState } from "react";
import { Platform } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
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
  const [athleteId, setAthleteId] = useState<string>("34646703"); // まず固定（成功優先）

  const navTheme = useMemo(
    () => ({
      dark: false,
      colors: {
        primary: "#2563eb",
        background: "#ffffff",
        card: "#ffffff",
        text: "#111827",
        border: "#e5e7eb",
        notification: "#2563eb",
      },
    }),
    []
  );

  // 起動直後は必ず Sign In（成功パターン）
  if (!signedIn) {
    return (
      <AuthScreen
        onSignIn={(id: string) => {
          setAthleteId(id || "34646703");
          setSignedIn(true);
        }}
      />
    );
  }

  return (
    <NavigationContainer theme={navTheme as any}>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarHideOnKeyboard: Platform.OS !== "web",
        }}
      >
        <Tab.Screen name="Activities" options={{ title: "Activities" }}>
          {() => (
            <ActivitiesScreen
              // ここは今の ActivitiesScreen 実装に合わせて props を渡さない（内部で固定ID/URLを使っている）
              onSignOut={() => setSignedIn(false)}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Settings" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
TS
