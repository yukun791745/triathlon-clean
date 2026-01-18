// src/lib/supabaseClient.ts
import "react-native-url-polyfill/auto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Expo(Web含む)では EXPO_PUBLIC_* がクライアントに公開される前提。
 * ここで env が空の場合でも「アプリ全体がクラッシュしない」ことを最優先にする。
 */

function getEnv(name: string): string {
  // Expo/Webで process.env が undefined になるケースに備える
  const v =
    (typeof process !== "undefined" && process.env && (process.env as any)[name]) ||
    "";
  return String(v || "").trim();
}

const supabaseUrl = getEnv("EXPO_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY");

// 未設定時に createClient() しない（= ここが重要）
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// 画面側でエラーメッセージを出せるように理由を返す
export function getSupabaseInitError(): string | null {
  if (supabase) return null;

  const missing: string[] = [];
  if (!supabaseUrl) missing.push("EXPO_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("EXPO_PUBLIC_SUPABASE_ANON_KEY");

  return `Supabase env missing: ${missing.join(", ")}`;
}
