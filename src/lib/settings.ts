cat > src/lib/settings.ts <<'EOF'
// src/lib/settings.ts
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export type HrZonesBpm = {
  z1Max: number;
  z2Max: number;
  z3Max: number;
  z4Max: number;
  z5Max: number; // = maxHR
};

export type UserSettings = {
  athleteId?: string;

  // HR
  maxHr: number;
  restingHr?: number;
  lthr: number;

  // Bike
  ftp: number;

  // Run
  runThresholdPaceSecPerKm: number;

  // Swim
  cssSecPer100m: number;

  // Zones
  hrZones: HrZonesBpm;
};

const KEY = "triathlon_app_user_settings_v1";

export const DEFAULT_SETTINGS: UserSettings = {
  maxHr: 180,
  restingHr: 50,
  lthr: 165,
  ftp: 200,
  runThresholdPaceSecPerKm: 270, // 4:30/km
  cssSecPer100m: 140, // 2:20/100m
  hrZones: {
    z1Max: 120,
    z2Max: 140,
    z3Max: 155,
    z4Max: 170,
    z5Max: 180,
  },
};

function mergeSettings(parsed: any): UserSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...(parsed || {}),
    hrZones: {
      ...DEFAULT_SETTINGS.hrZones,
      ...((parsed && parsed.hrZones) || {}),
    },
  };
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return await SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function loadSettings(): Promise<UserSettings> {
  const raw = await getItem(KEY);
  if (!raw) return DEFAULT_SETTINGS;

  try {
    const parsed = JSON.parse(raw);
    return mergeSettings(parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(next: UserSettings): Promise<void> {
  await setItem(KEY, JSON.stringify(next));
}
EOF
