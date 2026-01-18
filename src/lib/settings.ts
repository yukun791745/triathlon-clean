// src/lib/settings.ts
// Web: localStorage
// Native (Expo): expo-secure-store が入っていれば SecureStore を使う（動的 import）
// どちらも無い場合はメモリにフォールバック（最低限動く）

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

// 初期値（後であなたの実データを入れる）
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

function isWeb() {
  // Expo web でも window はある。native では無い。
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

let memoryCache: string | null = null;

async function secureStoreGetItem(key: string): Promise<string | null> {
  try {
    // 動的 import：Web ビルドで SecureStore が無くても落とさない
    const SecureStore = await import("expo-secure-store");
    if (SecureStore?.getItemAsync) {
      return await SecureStore.getItemAsync(key);
    }
  } catch {
    // ignore
  }
  return null;
}

async function secureStoreSetItem(key: string, value: string): Promise<void> {
  try {
    const SecureStore = await import("expo-secure-store");
    if (SecureStore?.setItemAsync) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
  } catch {
    // ignore
  }
}

function mergeWithDefaults(parsed: any): UserSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    hrZones: { ...DEFAULT_SETTINGS.hrZones, ...(parsed?.hrZones || {}) },
  };
}

export async function loadSettings(): Promise<UserSettings> {
  // 1) web: localStorage
  if (isWeb()) {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return mergeWithDefaults(JSON.parse(raw));
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  // 2) native: SecureStore（あれば）
  const raw = await secureStoreGetItem(KEY);
  if (raw) {
    try {
      return mergeWithDefaults(JSON.parse(raw));
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  // 3) fallback: memory
  if (memoryCache) {
    try {
      return mergeWithDefaults(JSON.parse(memoryCache));
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  return DEFAULT_SETTINGS;
}

export async function saveSettings(next: UserSettings): Promise<void> {
  const raw = JSON.stringify(next);

  if (isWeb()) {
    window.localStorage.setItem(KEY, raw);
    return;
  }

  await secureStoreSetItem(KEY, raw);
  memoryCache = raw;
}
