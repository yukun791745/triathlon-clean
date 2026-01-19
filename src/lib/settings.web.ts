// src/lib/settings.web.ts
import type { UserSettings } from "./settings.shared";
import { DEFAULT_SETTINGS, mergeWithDefaults } from "./settings.shared";
export { DEFAULT_SETTINGS, mergeWithDefaults } from "./settings.shared";
export type { HrZonesBpm, UserSettings } from "./settings.shared";

function keyFor(athleteId: string) {
  return `triathlon.settings.${athleteId}`;
}

export async function loadSettings(athleteId: string): Promise<UserSettings> {
  try {
    const raw = localStorage.getItem(keyFor(athleteId));
    if (!raw) return DEFAULT_SETTINGS;
    return mergeWithDefaults(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(athleteId: string, next: UserSettings): Promise<void> {
  try {
    localStorage.setItem(keyFor(athleteId), JSON.stringify(next));
  } catch {
    // ignore
  }
}