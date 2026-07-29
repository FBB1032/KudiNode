import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

/**
 * Admin client — uses the SERVICE ROLE key. Bypasses RLS.
 * Use ONLY on the server for privileged operations (writes, signed URLs,
 * admin queries). NEVER expose the service role key to any client.
 */
export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/**
 * Returns a request-scoped client that acts *as the calling user* by
 * attaching their access token. RLS policies therefore apply, giving us
 * defence-in-depth even on the server.
 */
export function supabaseAsUser(accessToken) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
