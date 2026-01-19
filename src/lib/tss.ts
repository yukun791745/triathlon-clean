// src/lib/tss.ts
import type { UserSettings } from "./settings.shared";

export type Sport = "ride" | "run" | "swim" | "other";

export type TssResult = {
  tss: number | null;
  method:
    | "pTSS_np"
    | "pTSS_avgPower"
    | "rTSS_paceStream"
    | "rTSS_avgPace"
    | "sTSS_css"
    | "hrTSS_lthr"
    | "n/a";
  details: string; // 画面に出せる短い説明
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function hoursFromSec(sec: number) {
  return Math.max(0, sec) / 3600;
}

export function sportFromStrava(activity: { type?: string; sport_type?: string }): Sport {
  const raw = (activity.sport_type || activity.type || "").toLowerCase();
  if (raw.includes("ride") || raw.includes("bike") || raw.includes("cycling")) return "ride";
  if (raw.includes("run")) return "run";
  if (raw.includes("swim")) return "swim";
  return "other";
}

/**
 * Bike TSS (Power-based)
 * - NP があれば pTSS_np
 * - なければ avgPower をNP近似として pTSS_avgPower
 */
export function computeBikeTss({
  durationSec,
  ftp,
  normalizedPower,
  avgPower,
}: {
  durationSec: number;
  ftp: number;
  normalizedPower?: number | null;
  avgPower?: number | null;
}): TssResult {
  if (!(ftp > 0) || !(durationSec > 0)) return { tss: null, method: "n/a", details: "missing ftp or duration" };

  const np = (typeof normalizedPower === "number" && normalizedPower > 0)
    ? normalizedPower
    : (typeof avgPower === "number" && avgPower > 0 ? avgPower : null);

  if (!np) return { tss: null, method: "n/a", details: "no power data (np/avgPower missing)" };

  const IF = np / ftp;
  const tss = (durationSec * np * IF) / (ftp * 3600) * 100;

  const method = (typeof normalizedPower === "number" && normalizedPower > 0) ? "pTSS_np" : "pTSS_avgPower";
  const details = `${method}: NP≈${Math.round(np)}W, FTP=${Math.round(ftp)}W, IF=${IF.toFixed(2)}`;

  return { tss: Math.round(tss), method, details };
}

/**
 * Run TSS (pace-based, minimal version)
 * - pace streamがあるなら avgSpeed を stream から算出して rTSS_paceStream
 * - 無いなら avgPaceSecPerKm から rTSS_avgPace
 *
 * 定義: rTSS = hours * (IF_run^2) * 100
 * IF_run = avgSpeed / thresholdSpeed
 */
export function computeRunTss({
  durationSec,
  thresholdPaceSecPerKm,
  avgPaceSecPerKm,
  paceStreamSecPerKm,
}: {
  durationSec: number;
  thresholdPaceSecPerKm: number;
  avgPaceSecPerKm?: number | null;
  paceStreamSecPerKm?: Array<number | null | undefined> | null;
}): TssResult {
  if (!(thresholdPaceSecPerKm > 0) || !(durationSec > 0)) {
    return { tss: null, method: "n/a", details: "missing threshold pace or duration" };
  }

  const thrSpeed = 1000 / thresholdPaceSecPerKm; // m/s

  const stream = Array.isArray(paceStreamSecPerKm) ? paceStreamSecPerKm : null;

  // streamがある場合：有効サンプルの平均ペース→平均速度
  if (stream && stream.length > 0) {
    let sum = 0;
    let cnt = 0;
    for (const p of stream) {
      const v = typeof p === "number" ? p : NaN;
      if (!Number.isFinite(v) || v <= 0) continue;
      sum += v;
      cnt += 1;
    }
    if (cnt > 0) {
      const avgPace = sum / cnt;
      const avgSpeed = 1000 / avgPace;
      const IF = clamp(avgSpeed / thrSpeed, 0, 2.0);
      const tss = hoursFromSec(durationSec) * IF * IF * 100;
      return {
        tss: Math.round(tss),
        method: "rTSS_paceStream",
        details: `rTSS_paceStream: avgPace=${avgPace.toFixed(0)}s/km, thr=${thresholdPaceSecPerKm}s/km, IF=${IF.toFixed(2)}`,
      };
    }
  }

  // streamが無い/無効：平均ペースから
  const ap = typeof avgPaceSecPerKm === "number" && avgPaceSecPerKm > 0 ? avgPaceSecPerKm : null;
  if (!ap) return { tss: null, method: "n/a", details: "no pace data" };

  const avgSpeed = 1000 / ap;
  const IF = clamp(avgSpeed / thrSpeed, 0, 2.0);
  const tss = hoursFromSec(durationSec) * IF * IF * 100;

  return {
    tss: Math.round(tss),
    method: "rTSS_avgPace",
    details: `rTSS_avgPace: avgPace=${ap.toFixed(0)}s/km, thr=${thresholdPaceSecPerKm}s/km, IF=${IF.toFixed(2)}`,
  };
}

/**
 * Swim TSS (CSS-based, minimal)
 * IF_swim = CSS_pace / avg_pace  (pace小さい=速いので比は CSS/avg)
 * sTSS = hours * IF^2 * 100
 */
export function computeSwimTss({
  durationSec,
  distanceM,
  cssSecPer100m,
}: {
  durationSec: number;
  distanceM: number;
  cssSecPer100m: number;
}): TssResult {
  if (!(durationSec > 0) || !(distanceM > 0) || !(cssSecPer100m > 0)) {
    return { tss: null, method: "n/a", details: "missing duration/distance/css" };
  }

  const avgPaceSecPer100 = durationSec / (distanceM / 100);
  const IF = clamp(cssSecPer100m / avgPaceSecPer100, 0, 2.0);
  const tss = hoursFromSec(durationSec) * IF * IF * 100;

  return {
    tss: Math.round(tss),
    method: "sTSS_css",
    details: `sTSS_css: avg=${avgPaceSecPer100.toFixed(1)}s/100m, css=${cssSecPer100m}s/100m, IF=${IF.toFixed(2)}`,
  };
}

/**
 * HR-based fallback (簡易)
 * ※ 本来は hrTSS/TRIMP 系は定義が流派で異なるため、まずは「暫定」扱い。
 * ここでは LTHR 比で近似: intensity = avgHR / LTHR
 */
export function computeHrTssFallback({
  durationSec,
  avgHr,
  lthr,
}: {
  durationSec: number;
  avgHr?: number | null;
  lthr: number;
}): TssResult {
  if (!(durationSec > 0) || !(lthr > 0) || !(typeof avgHr === "number" && avgHr > 0)) {
    return { tss: null, method: "n/a", details: "missing avgHR/LTHR/duration" };
  }
  const IF = clamp(avgHr / lthr, 0, 2.0);
  const tss = hoursFromSec(durationSec) * IF * IF * 100;
  return { tss: Math.round(tss), method: "hrTSS_lthr", details: `hrTSS_lthr: avgHR=${avgHr}, LTHR=${lthr}, IF=${IF.toFixed(2)}` };
}

/**
 * Activity summary + settings から「最も妥当な方法」でTSSを出すルーティング
 * （streams が入ったら paceStream/np を渡せるように拡張）
 */
export function computeTssForActivity(
  activity: {
    type?: string;
    sport_type?: string;
    moving_time?: number;
    elapsed_time?: number;
    distance?: number;
    average_watts?: number;
    weighted_average_watts?: number; // Stravaにある場合
    average_heartrate?: number;
  },
  settings: UserSettings
): TssResult {
  const sport = sportFromStrava(activity);
  const durationSec = (activity.moving_time ?? activity.elapsed_time ?? 0) || 0;

  if (sport === "ride") {
    return computeBikeTss({
      durationSec,
      ftp: settings.ftp,
      normalizedPower: typeof activity.weighted_average_watts === "number" ? activity.weighted_average_watts : null,
      avgPower: typeof activity.average_watts === "number" ? activity.average_watts : null,
    });
  }

  if (sport === "run") {
    // summaryしか無い段階では avgPace を出せる（distance/time）
    const dist = activity.distance ?? 0;
    const avgPaceSecPerKm = dist > 0 ? (durationSec / (dist / 1000)) : null;
    return computeRunTss({
      durationSec,
      thresholdPaceSecPerKm: settings.runThresholdPaceSecPerKm,
      avgPaceSecPerKm,
      paceStreamSecPerKm: null,
    });
  }

  if (sport === "swim") {
    return computeSwimTss({
      durationSec,
      distanceM: activity.distance ?? 0,
      cssSecPer100m: settings.cssSecPer100m,
    });
  }

  // other は暫定でHR fallbackを試す
  return computeHrTssFallback({
    durationSec,
    avgHr: typeof activity.average_heartrate === "number" ? activity.average_heartrate : null,
    lthr: settings.lthr,
  });
}
