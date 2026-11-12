import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";
  return { url, anonKey };
}

export function isSecretKeyMistake(key: string): boolean {
  return key.startsWith("sb_secret_");
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) return false;
  if (
    url.includes("your-project-id") ||
    anonKey.includes("your-supabase-anon-key") ||
    anonKey.includes("your_key_here") ||
    anonKey.includes("ISI_DENGAN_")
  ) {
    return false;
  }
  if (isSecretKeyMistake(anonKey)) {
    return false;
  }
  return url.startsWith("https://") || url.startsWith("http://");
}

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const { url, anonKey } = getSupabaseEnv();

  if (isSecretKeyMistake(anonKey)) {
    throw new Error(
      "Kunci yang dimasukkan adalah Secret Key (sb_secret_...). Demi keamanan, gunakan Publishable / Anon Key (awalan sb_publishable_...) pada file .env.local lalu restart server."
    );
  }

  if (!isSupabaseConfigured()) {
    throw new Error(
      "Konfigurasi Supabase belum lengkap. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY (Publishable Key) sudah diisi pada file .env.local, lalu restart npm run dev."
    );
  }

  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
