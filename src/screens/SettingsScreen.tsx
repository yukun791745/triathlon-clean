// src/screens/SettingsScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";

import { DEFAULT_SETTINGS, loadSettings, saveSettings, type UserSettings } from "../lib/settings";

// ---------- utils ----------
function clampInt(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function toIntOrNaN(s: string) {
  const n = parseInt((s ?? "").trim(), 10);
  return Number.isFinite(n) ? n : NaN;
}

function pad2(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return String(x).padStart(2, "0");
}

function splitToMinSec(totalSec: number) {
  const safe = Number.isFinite(totalSec) ? Math.max(0, Math.round(totalSec)) : 0;
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return { m, s };
}

function composeMinSec(minStr: string, secStr: string) {
  const m = clampInt(toIntOrNaN(minStr), 0, 999);
  const s = clampInt(toIntOrNaN(secStr), 0, 59);
  return m * 60 + s;
}

function formatMinSec(totalSec: number) {
  const { m, s } = splitToMinSec(totalSec);
  return `${m}:${pad2(s)}`;
}

// ---------- component ----------
export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // core numeric fields (string state for TextInput)
  const [maxHr, setMaxHr] = useState<string>("");
  const [lthr, setLthr] = useState<string>("");
  const [ftp, setFtp] = useState<string>("");

  // optional
  const [restingHr, setRestingHr] = useState<string>("");

  // Run threshold pace (sec/km) => min/sec inputs
  const [runPaceMin, setRunPaceMin] = useState<string>("");
  const [runPaceSec, setRunPaceSec] = useState<string>("");

  // CSS (sec/100m) => min/sec inputs
  const [cssMin, setCssMin] = useState<string>("");
  const [cssSec, setCssSec] = useState<string>("");

  // HR Zones (max values in bpm)
  const [z1Max, setZ1Max] = useState<string>("");
  const [z2Max, setZ2Max] = useState<string>("");
  const [z3Max, setZ3Max] = useState<string>("");
  const [z4Max, setZ4Max] = useState<string>("");
  const [z5Max, setZ5Max] = useState<string>("");

  // Load once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        setStatusMsg(null);

        const s = await loadSettings();

        if (!mounted) return;

        setMaxHr(String(s.maxHr ?? DEFAULT_SETTINGS.maxHr));
        setLthr(String(s.lthr ?? DEFAULT_SETTINGS.lthr));
        setFtp(String(s.ftp ?? DEFAULT_SETTINGS.ftp));
        setRestingHr(s.restingHr != null ? String(s.restingHr) : "");

        // run pace
        const run = splitToMinSec(s.runThresholdPaceSecPerKm ?? DEFAULT_SETTINGS.runThresholdPaceSecPerKm);
        setRunPaceMin(String(run.m));
        setRunPaceSec(pad2(run.s)); // ✅ 2桁

        // css
        const css = splitToMinSec(s.cssSecPer100m ?? DEFAULT_SETTINGS.cssSecPer100m);
        setCssMin(String(css.m));
        setCssSec(pad2(css.s)); // ✅ 2桁

        const hz = s.hrZones ?? DEFAULT_SETTINGS.hrZones;
        setZ1Max(String(hz.z1Max));
        setZ2Max(String(hz.z2Max));
        setZ3Max(String(hz.z3Max));
        setZ4Max(String(hz.z4Max));
        setZ5Max(String(hz.z5Max));
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(`Failed to load settings: ${String(e)}`);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const preview = useMemo(() => {
    const runSec = composeMinSec(runPaceMin, runPaceSec);
    const cssSecTotal = composeMinSec(cssMin, cssSec);
    return {
      runPace: formatMinSec(runSec) + " /km",
      css: formatMinSec(cssSecTotal) + " /100m",
    };
  }, [runPaceMin, runPaceSec, cssMin, cssSec]);

  const onSave = useCallback(async () => {
    setErrorMsg(null);
    setStatusMsg(null);

    // basic validation & normalize
    const nextMaxHr = clampInt(toIntOrNaN(maxHr), 60, 240);
    const nextLthr = clampInt(toIntOrNaN(lthr), 60, 240);
    const nextFtp = clampInt(toIntOrNaN(ftp), 50, 600);

    // resting HR optional
    const rhrRaw = restingHr.trim();
    const nextRestingHr =
      rhrRaw.length === 0 ? undefined : clampInt(toIntOrNaN(rhrRaw), 25, 120);

    const runSec = composeMinSec(runPaceMin, runPaceSec);
    const cssSecTotal = composeMinSec(cssMin, cssSec);

    // Zones
    const nz1 = clampInt(toIntOrNaN(z1Max), 40, 240);
    const nz2 = clampInt(toIntOrNaN(z2Max), 40, 240);
    const nz3 = clampInt(toIntOrNaN(z3Max), 40, 240);
    const nz4 = clampInt(toIntOrNaN(z4Max), 40, 240);
    const nz5 = clampInt(toIntOrNaN(z5Max), 40, 240);

    // sanity checks
    if (!(nz1 <= nz2 && nz2 <= nz3 && nz3 <= nz4 && nz4 <= nz5)) {
      setErrorMsg("HR zones must be non-decreasing (Z1 <= Z2 <= Z3 <= Z4 <= Z5).");
      return;
    }
    if (nz5 !== nextMaxHr) {
      // z5Max is defined as maxHR in your earlier type comment
      setErrorMsg("Z5 max should equal MaxHR (please set Z5 max = MaxHR).");
      return;
    }

    const next: UserSettings = {
      athleteId: undefined, // (reserved)
      maxHr: nextMaxHr,
      restingHr: nextRestingHr,
      lthr: nextLthr,
      ftp: nextFtp,
      runThresholdPaceSecPerKm: runSec,
      cssSecPer100m: cssSecTotal,
      hrZones: {
        z1Max: nz1,
        z2Max: nz2,
        z3Max: nz3,
        z4Max: nz4,
        z5Max: nz5,
      },
    };

    try {
      setSaving(true);
      await saveSettings(next);

      // ✅ Save後のUI反映（秒2桁に整形）
      const run = splitToMinSec(runSec);
      setRunPaceMin(String(run.m));
      setRunPaceSec(pad2(run.s));

      const css = splitToMinSec(cssSecTotal);
      setCssMin(String(css.m));
      setCssSec(pad2(css.s));

      setMaxHr(String(nextMaxHr));
      setLthr(String(nextLthr));
      setFtp(String(nextFtp));
      setRestingHr(nextRestingHr != null ? String(nextRestingHr) : "");

      setZ1Max(String(nz1));
      setZ2Max(String(nz2));
      setZ3Max(String(nz3));
      setZ4Max(String(nz4));
      setZ5Max(String(nz5));

      setStatusMsg("Saved!");
      // 2秒後に消す
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (e) {
      setErrorMsg(`Save failed: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  }, [
    maxHr,
    lthr,
    ftp,
    restingHr,
    runPaceMin,
    runPaceSec,
    cssMin,
    cssSec,
    z1Max,
    z2Max,
    z3Max,
    z4Max,
    z5Max,
  ]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator />
        <Text style={styles.note}>Loading settings…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Settings</Text>

        {/* status */}
        {errorMsg ? (
          <View style={[styles.banner, styles.bannerError]}>
            <Text style={styles.bannerText}>{errorMsg}</Text>
          </View>
        ) : null}
        {statusMsg ? (
          <View style={[styles.banner, styles.bannerOk]}>
            <Text style={styles.bannerText}>{statusMsg}</Text>
          </View>
        ) : null}

        {/* Athlete */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key metrics</Text>

          <View style={styles.row}>
            <Field label="FTP (W)" value={ftp} onChangeText={setFtp} />
            <Field label="LTHR (bpm)" value={lthr} onChangeText={setLthr} />
          </View>

          <View style={styles.row}>
            <Field label="MaxHR (bpm)" value={maxHr} onChangeText={setMaxHr} />
            <Field label="Resting HR (bpm, optional)" value={restingHr} onChangeText={setRestingHr} />
          </View>
        </View>

        {/* Run */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Run</Text>

          <Text style={styles.label}>Threshold pace (/km)</Text>
          <View style={styles.minSecRow}>
            <MinSecInput
              minLabel="min"
              secLabel="sec"
              minValue={runPaceMin}
              secValue={runPaceSec}
              onMinChange={setRunPaceMin}
              onSecChange={(v) => setRunPaceSec(v)}
            />
            <Text style={styles.preview}>{preview.runPace}</Text>
          </View>
        </View>

        {/* Swim */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Swim</Text>

          <Text style={styles.label}>CSS (/100m)</Text>
          <View style={styles.minSecRow}>
            <MinSecInput
              minLabel="min"
              secLabel="sec"
              minValue={cssMin}
              secValue={cssSec}
              onMinChange={setCssMin}
              onSecChange={(v) => setCssSec(v)}
            />
            <Text style={styles.preview}>{preview.css}</Text>
          </View>
        </View>

        {/* HR Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Heart rate zones (bpm)</Text>
          <Text style={styles.noteSmall}>Z5 max must equal MaxHR.</Text>

          <View style={styles.row}>
            <Field label="Z1 max" value={z1Max} onChangeText={setZ1Max} />
            <Field label="Z2 max" value={z2Max} onChangeText={setZ2Max} />
          </View>
          <View style={styles.row}>
            <Field label="Z3 max" value={z3Max} onChangeText={setZ3Max} />
            <Field label="Z4 max" value={z4Max} onChangeText={setZ4Max} />
          </View>
          <View style={styles.row}>
            <Field label="Z5 max" value={z5Max} onChangeText={setZ5Max} />
            <View style={{ flex: 1 }} />
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* bottom save bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={onSave}
          disabled={saving}
          style={[styles.saveBtn, saving ? styles.saveBtnDisabled : null]}
        >
          <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save"}</Text>
        </TouchableOpacity>

        <Text style={styles.bottomHint}>
          {Platform.OS === "web"
            ? "Saved settings persist in browser storage."
            : "Saved settings persist on device."}
        </Text>
      </View>
    </View>
  );
}

// ---------- small components ----------
function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={styles.input}
        value={props.value}
        onChangeText={(t) => props.onChangeText(t.replace(/[^\d]/g, ""))}
        keyboardType="numeric"
        placeholder="0"
      />
    </View>
  );
}

function MinSecInput(props: {
  minLabel: string;
  secLabel: string;
  minValue: string;
  secValue: string;
  onMinChange: (v: string) => void;
  onSecChange: (v: string) => void;
}) {
  return (
    <View style={styles.minSecBox}>
      <View style={styles.minSecItem}>
        <Text style={styles.minSecLabel}>{props.minLabel}</Text>
        <TextInput
          style={styles.input}
          value={props.minValue}
          onChangeText={(t) => props.onMinChange(t.replace(/[^\d]/g, ""))}
          keyboardType="numeric"
          placeholder="0"
        />
      </View>

      <Text style={styles.colon}>:</Text>

      <View style={styles.minSecItem}>
        <Text style={styles.minSecLabel}>{props.secLabel}</Text>
        <TextInput
          style={styles.input}
          value={props.secValue}
          onChangeText={(t) => {
            const cleaned = t.replace(/[^\d]/g, "");
            // 入力中も 2桁寄せを優先（ただし空文字は許容）
            if (cleaned.length === 0) return props.onSecChange("");
            const n = clampInt(toIntOrNaN(cleaned), 0, 59);
            props.onSecChange(pad2(n)); // ✅ 常に2桁
          }}
          keyboardType="numeric"
          placeholder="00"
          maxLength={2}
        />
      </View>
    </View>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 16 },
  center: { justifyContent: "center", alignItems: "center" },

  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },

  section: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },

  row: { flexDirection: "row", gap: 12 },
  field: { flex: 1, marginBottom: 10 },

  label: { fontSize: 12, color: "#333", marginBottom: 6 },
  note: { marginTop: 8, color: "#666" },
  noteSmall: { marginTop: -2, marginBottom: 8, color: "#666", fontSize: 12 },

  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },

  banner: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  bannerOk: { backgroundColor: "#e9f6ee", borderWidth: 1, borderColor: "#bfe6cc" },
  bannerError: { backgroundColor: "#fdecec", borderWidth: 1, borderColor: "#f3b5b5" },
  bannerText: { color: "#222" },

  minSecRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  minSecBox: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  minSecItem: { width: 100 },
  minSecLabel: { fontSize: 12, color: "#333", marginBottom: 6 },
  colon: { fontSize: 20, fontWeight: "700", paddingBottom: 8, color: "#333" },
  preview: { color: "#333", fontWeight: "600" },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  saveBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  bottomHint: { marginTop: 8, fontSize: 12, color: "#666", textAlign: "center" },
});
