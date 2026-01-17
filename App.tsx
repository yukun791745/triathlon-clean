cat > App.tsx <<‘EOF’
import “react-native-url-polyfill/auto”;
import React, { useState } from “react”;
import { View, ActivityIndicator } from “react-native”;
import AuthScreen from “./src/screens/AuthScreen”;
import HomeScreen from “./src/screens/HomeScreen”;

/**
	•	Minimal router (NO Supabase session gating yet)
	•		•	show AuthScreen when not “signed in”
	•		•	show HomeScreen when “signed in”
	•	
	•	NOTE:
	•	OAuth/Supabase session integration will be wired after the basic UI flow is stable.
*/
export default function App() {
const [initializing] = useState(false);
const [signedIn, setSignedIn] = useState(false);

if (initializing) {
return (
<View style={{ flex: 1, alignItems: “center”, justifyContent: “center” }}>


);
}

return signedIn ? (
<HomeScreen onSignOut={() => setSignedIn(false)} />
) : (
<AuthScreen onSignIn={() => setSignedIn(true)} />
);
}
EOF
