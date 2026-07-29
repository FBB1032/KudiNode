/**
 * Merchant credential helpers.
 *
 * Merchants register with a real **email + password** (their true Supabase Auth
 * credentials, securely hashed by Supabase) and additionally provide a **phone
 * number** which becomes their sign-in identifier in the mobile app.
 *
 * At login the app sends `phone + 4-digit PIN`. The phone is resolved to the
 * merchant's account server-side; the PIN is a lightweight app-level factor
 * (per spec it may be any 4 digits) and is validated for shape only.
 */

/**
 * Normalise a Nigerian phone number to canonical `234XXXXXXXXXX` form.
 *   0801 234 5678  -> 2348012345678
 *   +2348012345678 -> 2348012345678
 *   8012345678     -> 2348012345678
 */
export function normalizePhone(raw) {
  let p = String(raw || "").replace(/\D/g, "");
  if (p.startsWith("234")) return p;
  if (p.startsWith("0")) return "234" + p.slice(1);
  if (p.length === 10) return "234" + p;
  return p;
}
