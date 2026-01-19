// src/lib/settings.ts
// Cross-platform facade:
// - Web: uses settings.web.ts
// - Native: uses settings.native.ts
//
// This file exists so imports like "../lib/settings" work consistently,
// while keeping platform split implementations.

import { Platform } from "react-native";

// Types: both platform files must export identical types.
// We source the types from .web for TS convenience.
import type { HrZonesBpm as HrZonesBpmT, UserSettings as UserSettingsT } from "./settings.web";

export type HrZonesBpm = HrZonesBpmT;
export type UserSettings = UserSettingsT;

type Impl = typeof import("./settings.web");

const impl: Impl = Platform.OS === "web" ? require("./settings.web") : require("./settings.native");

export const DEFAULT_SETTINGS = impl.DEFAULT_SETTINGS;
export const loadSettings = impl.loadSettings;
export const saveSettings = impl.saveSettings;
