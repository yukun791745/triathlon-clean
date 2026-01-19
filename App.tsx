// App.tsx
import React, { useMemo, useState } from "react";
import { Platform } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
import AuthScreen from "./src/screens/AuthScreen";
import ActivitiesScreen from "./src/screens/ActivitiesScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

type RootTabParamList = {
  Activities: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  // 成功パターン：起動直後はAuth、完了したらTabs（下部ナビ）
  const [signedIn, setSignedIn] = useState(false);
  const [athleteId, setAthleteId] = useState<string>("34646703"); // Authで上書き

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

  // 認証ゲートはここ1箇所に固定（重複を排除）
  if (!signedIn) {
    return (
      <AuthScreen
        onSignIn={(id) => {
          setAthleteId(id);
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
          // webはキーボードでタブを隠さない
          tabBarHideOnKeyboard: Platform.OS !== "web",
        }}
      >
        <Tab.Screen name="Activities" options={{ title: "Activities" }}>
          {(props) => (
            <ActivitiesScreen
              {...props}
              // いまはActivitiesScreen側が userId を固定しているが、
              // 後で Props 化するならここで渡せる
              // athleteId={athleteId}
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
