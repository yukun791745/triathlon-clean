// src/lib/hrZones.ts
import type { HrZonesBpm } from "./settings";

export type HrZoneKey = "z1" | "z2" | "z3" | "z4" | "z5";

export type HrZoneSummary = {
  totalSeconds: number;          // 有効HRサンプルの合計秒（推定）
  secondsByZone: Record<HrZoneKey, number>;
  pctByZone: Record<HrZoneKey, number>; // 0-100
};

export function zoneForHr(hr: number, zones: HrZonesBpm): HrZoneKey {
  if (hr <= zones.z1Max) return "z1";
  if (hr <= zones.z2Max) return "z2";
  if (hr <= zones.z3Max) return "z3";
  if (hr <= zones.z4Max) return "z4";
  return "z5";
}

/**
 * HR stream からゾーン滞在率を推定します。
 * - hrSeries: bpm配列（欠損や0は無効扱い）
 * - sampleSec: サンプル間隔（不明な場合は 1 を入れてOK）
 */
export function summarizeHrZones(
  hrSeries: Array<number | null | undefined>,
  zones: HrZonesBpm,
  sampleSec: number = 1
): HrZoneSummary {
  const secondsByZone: Record<HrZoneKey, number> = { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 };

  const dt = Number.isFinite(sampleSec) && sampleSec > 0 ? sampleSec : 1;

  let totalSeconds = 0;
  for (const v of hrSeries) {
    const hr = typeof v === "number" ? v : NaN;
    if (!Number.isFinite(hr) || hr <= 0) continue;

    const z = zoneForHr(hr, zones);
    secondsByZone[z] += dt;
    totalSeconds += dt;
  }

  const pctByZone: Record<HrZoneKey, number> = { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 };
  if (totalSeconds > 0) {
    (Object.keys(secondsByZone) as HrZoneKey[]).forEach((k) => {
      pctByZone[k] = (secondsByZone[k] / totalSeconds) * 100;
    });
  }

  return { totalSeconds, secondsByZone, pctByZone };
}
