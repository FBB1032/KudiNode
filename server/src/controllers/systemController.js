import { supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound } from "../utils/AppError.js";
import { auditLog } from "../utils/audit.js";

const DEFAULT_CONFIG = {
  loan_thresholds: { max_loan_amount: 5000000, min_credit_score: 60, default_term_months: 12, interest_rate_monthly: 4.5 },
  notifications: { email_alerts: true, sms_notifications: true, push_notifications: true, daily_summary: "08:00" },
  security: { two_factor_required: "admins_only", session_timeout_minutes: 30, ip_whitelist_enabled: false, audit_logs: true },
  data_retention: { transaction_logs_years: 7, user_activity_years: 2, backup_frequency: "daily", archive_policy: "cold_storage" },
};

async function loadConfig() {
  const { data } = await supabaseAdmin.from("system_config").select("*");
  const cfg = { ...DEFAULT_CONFIG };
  for (const row of data || []) {
    cfg[row.key] = row.value;
  }
  return cfg;
}

/**
 * GET /admin/settings — returns all system config as a flat object.
 */
export const getSystemSettings = asyncHandler(async (_req, res) => {
  const config = await loadConfig();
  res.json({ config });
});

/**
 * PUT /admin/settings  { config: { key: value, ... } }
 * Merges provided keys into system_config. Super Admin only.
 */
export const updateSystemSettings = asyncHandler(async (req, res) => {
  const { config } = req.body;
  if (!config || typeof config !== "object") {
    throw badRequest("Body must contain a `config` object with key/value pairs");
  }

  for (const [key, value] of Object.entries(config)) {
    await supabaseAdmin
      .from("system_config")
      .upsert({ key, value, updated_by: req.user.id, updated_at: new Date().toISOString() }, { onConflict: "key" });
  }

  await auditLog(
    req.user.id,
    "update_settings",
    "system_config",
    null,
    { updated_keys: Object.keys(config) },
    req.ip,
  );
  const updated = await loadConfig();
  res.json({ config: updated, message: "System configuration updated." });
});