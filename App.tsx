import "react-native-url-polyfill/auto"; // <-- keep this at top
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "./src/lib/supabaseClient";
import AuthScreen from "./src/screens/AuthScreen";
// swap HomeMinimal -> HomeScreen
import HomeScreen from "./src/screens/HomeScreen";

/**
 * Minimal router:
 * - show AuthScreen when not logged in
 * - show HomeScreen when logged in (activities)
 *
 * ENV: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY must be set in your Expo environment
 */
export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

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

  return signedIn ? <HomeScreen onSignOut={() => setSignedIn(false)} /> : <AuthScreen onSignIn={() => setSignedIn(true)} />;
}
