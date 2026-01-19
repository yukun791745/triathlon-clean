// App.tsx
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
  const [athleteId, setAthleteId] = useState<string | null>(null);

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

  // 1) 起動直後は必ず Auth
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

  // 2) サインイン後に Tabs（下部ナビ復活）
  return (
    <NavigationContainer theme={navTheme as any}>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarHideOnKeyboard: Platform.OS !== "web",
        }}
      >
        <Tab.Screen name="Activities" options={{ title: "Activities" }}>
          {(props) => (
            <ActivitiesScreen
              {...props}
              athleteId={athleteId ?? "34646703"}
              onSignOut={() => {
                setSignedIn(false);
                setAthleteId(null);
              }}
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
