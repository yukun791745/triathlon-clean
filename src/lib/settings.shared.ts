// src/lib/settings.shared.ts

export type HrZonesBpm = {
  z1Max: number;
  z2Max: number;
  z3Max: number;
  z4Max: number;
  z5Max: number;
};

export type UserSettings = {
  // ---- Core ----
  maxHr: number; // bpm
  lthr: number;  // bpm
  ftp: number;   // watts

  // ---- Optional ----
  restingHr?: number;  // bpm
  weightKg?: number;   // kg

  // ---- Needed by existing tss.ts / SettingsScreen.tsx ----
  runThresholdPaceSecPerKm: number; // sec / km
  cssSecPer100m: number;            // sec / 100m
  hrZones: HrZonesBpm;              // bpm zone max boundaries
};

export const DEFAULT_SETTINGS: UserSettings = {
  maxHr: 180,
  lthr: 160,
  ftp: 200,
  restingHr: 55,
  weightKg: 63,

  // reasonable defaults (後でUIから上書き)
  runThresholdPaceSecPerKm: 300, // 5:00 /km
  cssSecPer100m: 140,            // 2:20 /100m

  hrZones: {
    z1Max: 120,
    z2Max: 140,
    z3Max: 155,
    z4Max: 170,
    z5Max: 180,
  },
};

export function mergeWithDefaults(raw: Partial<UserSettings>): UserSettings {
  // shallow merge + nested hrZones merge
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    hrZones: {
      ...DEFAULT_SETTINGS.hrZones,
      ...(raw.hrZones ?? {}),
    },
  };
}