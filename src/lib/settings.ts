// src/lib/settings.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  runThresholdPaceSecPerKm: number; // e.g., 270 for 4:30/km

  // Swim
  cssSecPer100m: number; // e.g., 140 for 2:20/100m

  // Zones
  hrZones: HrZonesBpm;
};

const KEY = "triathlon_app_user_settings_v1";

export const DEFAULT_SETTINGS: UserSettings = {
  maxHr: 180,
  restingHr: 50,
  lthr: 165,
  ftp: 200,
  runThresholdPaceSecPerKm: 270,
  cssSecPer100m: 140,
  hrZones: {
    z1Max: 120,
    z2Max: 140,
    z3Max: 155,
    z4Max: 170,
    z5Max: 180,
  },
};

export async function loadSettings(): Promise<UserSettings> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed, hrZones: { ...DEFAULT_SETTINGS.hrZones, ...(parsed?.hrZones || {}) } };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(next: UserSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
