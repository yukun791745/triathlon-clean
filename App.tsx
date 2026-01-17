import "react-native-url-polyfill/auto";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { supabase } from "./src/lib/supabaseClient";
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";

type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSignedIn(!!session);
      setInitializing(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={signedIn ? "Home" : "Auth"}>
        <Stack.Screen name="Auth">
          {() => <AuthScreen onSignIn={() => setSignedIn(true)} />}
        </Stack.Screen>

        <Stack.Screen name="Home">
          {() => (
            <HomeScreen
              onSignOut={async () => {
                try {
                  await supabase.auth.signOut();
                } finally {
                  setSignedIn(false);
                }
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
