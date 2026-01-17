import "react-native-url-polyfill/auto";
import React, { useState } from "react";
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [athleteId, setAthleteId] = useState<string>("");

  return signedIn ? (
    <HomeScreen
      athleteId={athleteId}
      onSignOut={() => {
        setSignedIn(false);
        setAthleteId("");
      }}
    />
  ) : (
    <AuthScreen
      onSignIn={(id: string) => {
        setAthleteId(id);
        setSignedIn(true);
      }}
    />
  );
}
