import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazily construct the server-side client so that merely importing this module
// (which happens transitively from layout.tsx via db.ts) does not crash pages
// that never touch the database. The env check now fires on first real use.
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  // Server-side client using service role key (bypasses RLS)
  _client = createClient(supabaseUrl, supabaseServiceKey);
  return _client;
}

// Proxy preserves the existing `import { supabase }` + `supabase.rpc(...)` API
// while deferring construction (and the env-var check) until first access.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
