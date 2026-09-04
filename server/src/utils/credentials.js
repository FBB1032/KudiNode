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
 *   08012345678    -> 2348012345678
 */
export function normalizePhone(raw) {
  let p = String(raw || "").replace(/\D/g, "");
  
  // Already in correct format
  if (p.startsWith("234") && p.length === 13) return p;
  
  // Has leading 0 (e.g., 08012345678)
  if (p.startsWith("0") && p.length === 11) return "234" + p.slice(1);
  
  // Missing 234 prefix, 10 digits (e.g., 8012345678)
  if (p.length === 10) return "234" + p;

  // Return as-is if we can't normalize (will likely fail validation)
  return p;
}

/**
 * Every format the same raw phone may be stored under in `profiles.phone`
 * (signup normalizes, but historical/KYC-screen writes may not have).
 * Returned in lookup priority order: canonical first.
 */
export function phoneLookupCandidates(raw) {
  const canonical = normalizePhone(raw);
  const digits = String(raw || "").replace(/\D/g, "");
  const candidates = new Set();

  if (canonical) candidates.add(canonical);
  if (canonical.startsWith("234") && canonical.length === 13) {
    const local = canonical.slice(3); // 8012345678
    candidates.add(local);            // stored without prefix
    candidates.add("0" + local);       // stored with leading 0
  }
  if (digits) candidates.add(digits);  // stored exactly as entered

  return [...candidates].filter(Boolean);
}
