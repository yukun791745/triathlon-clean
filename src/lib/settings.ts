// src/lib/settings.ts
import { Platform } from "react-native";

export type { HrZonesBpm, UserSettings } from "./settings.shared";
export { DEFAULT_SETTINGS } from "./settings.shared";

type NativeImpl = typeof import("./settings.native");
type WebImpl = typeof import("./settings.web");

const impl: NativeImpl | WebImpl =
  Platform.OS === "web" ? require("./settings.web") : require("./settings.native");

export const loadSettings = impl.loadSettings as (athleteId: string) => Promise<import("./settings.shared").UserSettings>;
export const saveSettings = impl.saveSettings as (
  athleteId: string,
  next: import("./settings.shared").UserSettings
) => Promise<void>;