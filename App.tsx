import "react-native-url-polyfill/auto";
import React, { useState } from "react";
import AuthScreen from "./src/screens/AuthScreen";
import Navigation from "./navigation";

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [athleteId, setAthleteId] = useState<string>("");

  return signedIn ? (
    <Navigation
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
