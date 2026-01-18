// src/lib/settings.web.ts
export type HrZonesBpm = {
  z1Max: number;
  z2Max: number;
  z3Max: number;
  z4Max: number;
  z5Max: number; // = maxHR
};

export type UserSettings = {
  athleteId?: string;

  maxHr: number;
  restingHr?: number;
  lthr: number;

  ftp: number;

  runThresholdPaceSecPerKm: number;
  cssSecPer100m: number;

  hrZones: HrZonesBpm;
};

const KEY = "triathlon_app_user_settings_v1";

export const DEFAULT_SETTINGS: UserSettings = {
  maxHr: 173,
  restingHr: 50,
  lthr: 161,
  ftp: 195,
  runThresholdPaceSecPerKm: 271,
  cssSecPer100m: 140,
  hrZones: { z1Max: 120, z2Max: 140, z3Max: 155, z4Max: 170, z5Max: 180 },
};

function mergeWithDefaults(parsed: any): UserSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    hrZones: { ...DEFAULT_SETTINGS.hrZones, ...(parsed?.hrZones || {}) },
  };
}

export async function loadSettings(): Promise<UserSettings> {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return mergeWithDefaults(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(next: UserSettings): Promise<void> {
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
