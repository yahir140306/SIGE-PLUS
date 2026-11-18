import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env?.SUPABASE_URL || process.env?.SUPABASE_URL || "";
const supabaseAnonKey =
  import.meta.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("placeholder") &&
    supabaseUrl.startsWith("http"),
);

if (!isSupabaseConfigured && process.env.NODE_ENV !== "test") {
  console.warn(
    "⚠️ Variables de entorno de Supabase no configuradas. Operando en modo local/contingencia.",
  );
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-anon-key",
);
