// src/lib/settings.native.ts
import * as SecureStore from "expo-secure-store";
import type { UserSettings } from "./settings.shared";
import { DEFAULT_SETTINGS, mergeWithDefaults } from "./settings.shared";

export { DEFAULT_SETTINGS, mergeWithDefaults } from "./settings.shared";
export type { HrZonesBpm, UserSettings } from "./settings.shared";
function keyFor(athleteId: string) {
  return `triathlon.settings.${athleteId}`;
}

export async function loadSettings(athleteId: string): Promise<UserSettings> {
  const raw = await SecureStore.getItemAsync(keyFor(athleteId));
  if (!raw) return DEFAULT_SETTINGS;

  try {
    return mergeWithDefaults(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(athleteId: string, next: UserSettings): Promise<void> {
  await SecureStore.setItemAsync(keyFor(athleteId), JSON.stringify(next));
}