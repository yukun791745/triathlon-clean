// App.tsx
import React, { useMemo, useState } from "react";
import { Platform } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens（存在している前提）
import AuthScreen from "./src/screens/AuthScreen";
import ActivitiesScreen from "./src/screens/ActivitiesScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

// もし Fitness/Training など他のタブがあるなら後で追加でOK
// import TrainingScreen from "./src/screens/TrainingScreen";
// import FitnessDetailScreen from "./src/screens/FitnessDetailScreen";

type RootTabParamList = {
  Activities: undefined;
  Settings: undefined;
  // Training: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  /**
   * 成功パターンの要件:
   * - 起動直後は AuthScreen（Sign In）
   * - Sign In 成功後に Tabs 表示（下部ナビ復活）
   *
   * 現状は Supabase 認証が安定していない可能性があるので、
   * まずは「AuthScreen から onSignedIn を呼んだら Tabs に遷移」する設計に固定します。
   */
  const [signedIn, setSignedIn] = useState(false);

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

  // Auth が出ることを最優先（ここがあなたの「成功パターン」）
  if (!signedIn) {
    return (
      <AuthScreen
        onSignedIn={() => setSignedIn(true)}
        // 必要なら初期状態で web だけ自動サインイン等も後でやれる
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
        <Tab.Screen
          name="Activities"
          options={{ title: "Activities" }}
        >
          {(props) => (
            <ActivitiesScreen
              {...props}
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
