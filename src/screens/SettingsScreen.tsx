// src/screens/SettingsScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, UserSettings } from "../lib/settings";

type Props = {
  athleteId: string;
};

function toInt(v: string, fallback: number) {
  const n = parseInt(v.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function toSecFromPace(mm: string, ss: string, fallbackSec: number) {
  const m = toInt(mm, Math.floor(fallbackSec / 60));
  const s = toInt(ss, fallbackSec % 60);
  return Math.max(0, m * 60 + s);
}

function toPaceParts(totalSec: number) {
  const sec = Math.max(0, Math.floor(totalSec));
  return { mm: String(Math.floor(sec / 60)), ss: String(sec % 60).padStart(2, "0") };
}

export default function SettingsScreen({ athleteId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Save feedback (Alertに依存しない)
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // pace input parts
  const paceParts = useMemo(() => toPaceParts(settings.runThresholdPaceSecPerKm), [settings.runThresholdPaceSecPerKm]);
  const cssParts = useMemo(() => toPaceParts(settings.cssSecPer100m), [settings.cssSecPer100m]);

  const [runMm, setRunMm] = useState(paceParts.mm);
  const [runSs, setRunSs] = useState(paceParts.ss);

  const [cssMm, setCssMm] = useState(cssParts.mm);
  const [cssSs, setCssSs] = useState(cssParts.ss);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loaded = await loadSettings();
        const merged = { ...loaded, athleteId: athleteId || loaded.athleteId };
        if (!mounted) return;

        setSettings(merged);

        const rp = toPaceParts(merged.runThresholdPaceSecPerKm);
        setRunMm(rp.mm);
        setRunSs(rp.ss);

        const cp = toPaceParts(merged.cssSecPer100m);
        setCssMm(cp.mm);
        setCssSs(cp.ss);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [athleteId]);

  function validate(next: UserSettings): string | null {
    if (next.lthr <= 0 || next.maxHr <= 0 || next.ftp <= 0) return "maxHR / LTHR / FTP は正の数で入力してください。";
    const z = next.hrZones;
    if (!(z.z1Max < z.z2Max && z.z2Max < z.z3Max && z.z3Max < z.z4Max && z.z4Max < z.z5Max)) {
      return "HRゾーン境界は Z1 < Z2 < Z3 < Z4 < Z5 の順にしてください。";
    }
    return null;
  }

  async function onSave() {
    setSaveMsg(null);
    setSaveErr(null);

    const next: UserSettings = {
      ...settings,
      athleteId: athleteId || settings.athleteId,
      runThresholdPaceSecPerKm: toSecFromPace(runMm, runSs, settings.runThresholdPaceSecPerKm),
      cssSecPer100m: toSecFromPace(cssMm, cssSs, settings.cssSecPer100m),
      hrZones: {
        ...settings.hrZones,
        // 事故防止: z5Max は maxHr に追従
        z5Max: settings.maxHr,
      },
    };

    const msg = validate(next);
    if (msg) {
      setSaveErr(msg);
      return;
    }

    setSaving(true);
    try {
      await saveSettings(next);
      setSettings(next);
      // 保存後、表示も整形（秒2桁）
      const rp = toPaceParts(next.runThresholdPaceSecPerKm);
      setRunMm(rp.mm);
      setRunSs(rp.ss);
      const cp = toPaceParts(next.cssSecPer100m);
      setCssMm(cp.mm);
      setCssSs(cp.ss);

      setSaveMsg("保存しました。");
    } catch (e: any) {
      setSaveErr(String(e?.message || e));
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

      <View style={styles.card}>
        <Text style={styles.cardTitle}>アカウント</Text>
        <View style={styles.row}>
          <Text style={styles.label}>athleteId</Text>
          <Text style={styles.value}>{athleteId || settings.athleteId || "--"}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>心拍（bpm）</Text>

        <FieldInt
          label="Max HR"
          value={settings.maxHr}
          onChange={(n) => setSettings((s) => ({ ...s, maxHr: n, hrZones: { ...s.hrZones, z5Max: n } }))}
        />
        <FieldInt
          label="Rest HR（任意）"
          value={settings.restingHr ?? 0}
          onChange={(n) => setSettings((s) => ({ ...s, restingHr: n }))}
        />
        <FieldInt label="LTHR（閾値）" value={settings.lthr} onChange={(n) => setSettings((s) => ({ ...s, lthr: n }))} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>バイク</Text>
        <FieldInt label="FTP（W）" value={settings.ftp} onChange={(n) => setSettings((s) => ({ ...s, ftp: n }))} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ラン</Text>
        <PaceField
          label="閾値ペース（/km）"
          mm={runMm}
          ss={runSs}
          onChangeMm={setRunMm}
          onChangeSs={setRunSs}
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
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>HRゾーン境界（bpm）</Text>
        <Text style={styles.note}>Z5上限は Max HR と同じ値に固定します。</Text>

        <FieldInt label="Z1 上限" value={settings.hrZones.z1Max} onChange={(n) => setSettings((s) => ({ ...s, hrZones: { ...s.hrZones, z1Max: n } }))} />
        <FieldInt label="Z2 上限" value={settings.hrZones.z2Max} onChange={(n) => setSettings((s) => ({ ...s, hrZones: { ...s.hrZones, z2Max: n } }))} />
        <FieldInt label="Z3 上限" value={settings.hrZones.z3Max} onChange={(n) => setSettings((s) => ({ ...s, hrZones: { ...s.hrZones, z3Max: n } }))} />
        <FieldInt label="Z4 上限" value={settings.hrZones.z4Max} onChange={(n) => setSettings((s) => ({ ...s, hrZones: { ...s.hrZones, z4Max: n } }))} />

        <View style={styles.row}>
          <Text style={styles.label}>Z5 上限</Text>
          <Text style={styles.value}>{settings.maxHr}</Text>
        </View>
      </View>

      <Pressable onPress={onSave} disabled={saving} style={[styles.saveBtn, saving && { opacity: 0.6 }]}>
        <Text style={styles.saveBtnText}>{saving ? "保存中..." : "保存する"}</Text>
      </Pressable>

      {/* 反応が見える保存メッセージ（Alert非依存） */}
      {saveMsg && <Text style={styles.saveMsg}>{saveMsg}</Text>}
      {saveErr && <Text style={styles.saveErr}>保存に失敗: {saveErr}</Text>}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function FieldInt({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={String(value)}
        onChangeText={(t) => onChange(toInt(t, value))}
        keyboardType={Platform.OS === "web" ? "numeric" : "number-pad"}
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
}: {
  label: string;
  mm: string;
  ss: string;
  onChangeMm: (v: string) => void;
  onChangeSs: (v: string) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.paceWrap}>
        <TextInput
          style={[styles.input, styles.pace]}
          value={mm}
          onChangeText={onChangeMm}
          keyboardType={Platform.OS === "web" ? "numeric" : "number-pad"}
          onBlur={() => onChangeMm(String(toInt(mm, 0)))}
        />
        <Text style={styles.paceSep}>:</Text>
        <TextInput
          style={[styles.input, styles.pace]}
          value={ss}
          onChangeText={onChangeSs}
          keyboardType={Platform.OS === "web" ? "numeric" : "number-pad"}
          onBlur={() => onChangeSs(String(toInt(ss, 0)).padStart(2, "0"))}
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

  saveBtn: {
    marginTop: 16,
    backgroundColor: "#111",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700" },

  saveMsg: { marginTop: 10, color: "#111", fontSize: 12 },
  saveErr: { marginTop: 10, color: "red", fontSize: 12 },
});
