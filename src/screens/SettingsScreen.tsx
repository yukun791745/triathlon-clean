import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Platform } from "react-native";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, UserSettings } from "../lib/settings";

type Props = {
  athleteId: string;
};

function digitsOnly(s: string) {
  return (s ?? "").replace(/[^\d]/g, "");
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function toIntSafe(s: string, fallback: number) {
  const v = parseInt(digitsOnly(s), 10);
  return Number.isFinite(v) ? v : fallback;
}

function toPaceParts(totalSec: number) {
  const sec = Math.max(0, Math.floor(totalSec || 0));
  return {
    mm: String(Math.floor(sec / 60)),
    ss: String(sec % 60).padStart(2, "0"),
  };
}

function toSecFromParts(mm: string, ss: string, fallbackSec: number) {
  const m = toIntSafe(mm, Math.floor(fallbackSec / 60));
  const s = toIntSafe(ss, fallbackSec % 60);
  return Math.max(0, m * 60 + clampInt(s, 0, 59));
}

export default function SettingsScreen({ athleteId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // 入力は string で保持（入力途中を壊さない）
  const [maxHrStr, setMaxHrStr] = useState(String(DEFAULT_SETTINGS.maxHr));
  const [restHrStr, setRestHrStr] = useState(String(DEFAULT_SETTINGS.restingHr ?? 0));
  const [lthrStr, setLthrStr] = useState(String(DEFAULT_SETTINGS.lthr));
  const [ftpStr, setFtpStr] = useState(String(DEFAULT_SETTINGS.ftp));

  const initRun = useMemo(() => toPaceParts(DEFAULT_SETTINGS.runThresholdPaceSecPerKm), []);
  const initCss = useMemo(() => toPaceParts(DEFAULT_SETTINGS.cssSecPer100m), []);

  const [runMm, setRunMm] = useState(initRun.mm);
  const [runSs, setRunSs] = useState(initRun.ss);

  const [cssMm, setCssMm] = useState(initCss.mm);
  const [cssSs, setCssSs] = useState(initCss.ss);

  const [z1Str, setZ1Str] = useState(String(DEFAULT_SETTINGS.hrZones.z1Max));
  const [z2Str, setZ2Str] = useState(String(DEFAULT_SETTINGS.hrZones.z2Max));
  const [z3Str, setZ3Str] = useState(String(DEFAULT_SETTINGS.hrZones.z3Max));
  const [z4Str, setZ4Str] = useState(String(DEFAULT_SETTINGS.hrZones.z4Max));

  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loaded = await loadSettings();
        if (!mounted) return;

        const merged: UserSettings = {
          ...DEFAULT_SETTINGS,
          ...loaded,
          athleteId: athleteId || loaded.athleteId,
          hrZones: { ...DEFAULT_SETTINGS.hrZones, ...(loaded.hrZones || {}) },
        };

        setSettings(merged);

        setMaxHrStr(String(merged.maxHr));
        setRestHrStr(String(merged.restingHr ?? 0));
        setLthrStr(String(merged.lthr));
        setFtpStr(String(merged.ftp));

        const rp = toPaceParts(merged.runThresholdPaceSecPerKm);
        setRunMm(rp.mm);
        setRunSs(rp.ss);

        const cp = toPaceParts(merged.cssSecPer100m);
        setCssMm(cp.mm);
        setCssSs(cp.ss);

        setZ1Str(String(merged.hrZones.z1Max));
        setZ2Str(String(merged.hrZones.z2Max));
        setZ3Str(String(merged.hrZones.z3Max));
        setZ4Str(String(merged.hrZones.z4Max));

        setMsg("");
      } catch (e: any) {
        setMsg(`load error: ${String(e?.message || e)}`);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [athleteId]);

  function normalizeSs(v: string) {
    const n = clampInt(toIntSafe(v, 0), 0, 59);
    return String(n).padStart(2, "0");
  }

  async function onSave() {
    setMsg("");
    setSaving(true);

    try {
      const maxHr = toIntSafe(maxHrStr, settings.maxHr);
      const restingHr = toIntSafe(restHrStr, settings.restingHr ?? 0);
      const lthr = toIntSafe(lthrStr, settings.lthr);
      const ftp = toIntSafe(ftpStr, settings.ftp);

      const z1 = toIntSafe(z1Str, settings.hrZones.z1Max);
      const z2 = toIntSafe(z2Str, settings.hrZones.z2Max);
      const z3 = toIntSafe(z3Str, settings.hrZones.z3Max);
      const z4 = toIntSafe(z4Str, settings.hrZones.z4Max);

      const runPace = toSecFromParts(runMm, runSs, settings.runThresholdPaceSecPerKm);
      const cssPace = toSecFromParts(cssMm, cssSs, settings.cssSecPer100m);

      // バリデーション（最小）
      if (maxHr <= 0 || lthr <= 0 || ftp <= 0) {
        setMsg("入力エラー: MaxHR / LTHR / FTP は正の数で入力してください。");
        return;
      }
      if (!(z1 < z2 && z2 < z3 && z3 < z4 && z4 < maxHr)) {
        setMsg("入力エラー: HRゾーンは Z1 < Z2 < Z3 < Z4 < MaxHR の順にしてください。");
        return;
      }

      const next: UserSettings = {
        ...settings,
        athleteId: athleteId || settings.athleteId,
        maxHr,
        restingHr: restingHr > 0 ? restingHr : undefined,
        lthr,
        ftp,
        runThresholdPaceSecPerKm: runPace,
        cssSecPer100m: cssPace,
        hrZones: {
          z1Max: z1,
          z2Max: z2,
          z3Max: z3,
          z4Max: z4,
          z5Max: maxHr, // 常に maxHr
        },
      };

      await saveSettings(next);
      setSettings(next);

      // 表示も整形して揃える（秒2桁）
      setRunSs(normalizeSs(runSs));
      setCssSs(normalizeSs(cssSs));

      setMsg("保存しました。");
    } catch (e: any) {
      setMsg(`保存に失敗: ${String(e?.message || e)}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator />
        <Text style={styles.note}>loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>設定</Text>
      <Text style={styles.note}>TSS / CTL / ATL / TSB と心拍ゾーン集計に使う個人設定です。</Text>

      {!!msg && (
        <View style={styles.msgBox}>
          <Text style={styles.msgText}>{msg}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>アカウント</Text>
        <Row label="athleteId" right={athleteId || settings.athleteId || "--"} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>心拍（bpm）</Text>
        <Field label="Max HR" value={maxHrStr} onChange={setMaxHrStr} />
        <Field label="Rest HR（任意）" value={restHrStr} onChange={setRestHrStr} />
        <Field label="LTHR（閾値）" value={lthrStr} onChange={setLthrStr} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>バイク</Text>
        <Field label="FTP（W）" value={ftpStr} onChange={setFtpStr} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ラン</Text>
        <PaceField
          label="閾値ペース（/km）"
          mm={runMm}
          ss={runSs}
          onChangeMm={setRunMm}
          onChangeSs={setRunSs}
          onBlurSs={() => setRunSs((v) => normalizeSs(v))}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>スイム</Text>
        <PaceField
          label="CSS（/100m）"
          mm={cssMm}
          ss={cssSs}
          onChangeMm={setCssMm}
          onChangeSs={setCssSs}
          onBlurSs={() => setCssSs((v) => normalizeSs(v))}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>HRゾーン境界（bpm）</Text>
        <Text style={styles.note}>Z5上限は Max HR と同じ値に固定します。</Text>

        <Field label="Z1 上限" value={z1Str} onChange={setZ1Str} />
        <Field label="Z2 上限" value={z2Str} onChange={setZ2Str} />
        <Field label="Z3 上限" value={z3Str} onChange={setZ3Str} />
        <Field label="Z4 上限" value={z4Str} onChange={setZ4Str} />

        <Row label="Z5 上限" right={digitsOnly(maxHrStr) || "--"} />
      </View>

      <Pressable onPress={onSave} disabled={saving} style={[styles.saveBtn, saving && { opacity: 0.6 }]}>
        <Text style={styles.saveBtnText}>{saving ? "保存中..." : "保存する"}</Text>
      </Pressable>

      <Text style={[styles.note, { marginTop: 10 }]}>
        platform: {Platform.OS}
      </Text>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function Row({ label, right }: { label: string; right: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{right}</Text>
    </View>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(t) => onChange(digitsOnly(t))}
        keyboardType="number-pad"
      />
    </View>
  );
}

function PaceField({
  label,
  mm,
  ss,
  onChangeMm,
  onChangeSs,
  onBlurSs,
}: {
  label: string;
  mm: string;
  ss: string;
  onChangeMm: (v: string) => void;
  onChangeSs: (v: string) => void;
  onBlurSs: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.paceWrap}>
        <TextInput
          style={[styles.input, styles.pace]}
          value={mm}
          onChangeText={(t) => onChangeMm(digitsOnly(t))}
          keyboardType="number-pad"
        />
        <Text style={styles.paceSep}>:</Text>
        <TextInput
          style={[styles.input, styles.pace]}
          value={ss}
          onChangeText={(t) => onChangeSs(digitsOnly(t))}
          onBlur={onBlurSs}
          keyboardType="number-pad"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  h1: { fontSize: 20, fontWeight: "700" },
  note: { marginTop: 6, color: "#666", fontSize: 12 },

  msgBox: { marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: "#f7f7f7" },
  msgText: { fontSize: 12, color: "#333" },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginTop: 12 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 10 },
  label: { width: 150, color: "#333", fontSize: 13 },
  value: { color: "#111", fontSize: 13 },

  input: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 90,
    textAlign: "right",
  },

  paceWrap: { flexDirection: "row", alignItems: "center" },
  pace: { minWidth: 60 },
  paceSep: { paddingHorizontal: 6, color: "#666" },

  saveBtn: { marginTop: 14, backgroundColor: "#111", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
