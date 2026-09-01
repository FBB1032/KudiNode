import { supabaseAdmin } from "../config/supabase.js";

export async function auditLog(
  adminId,
  action,
  resourceType,
  resourceId = null,
  details = {},
  ip = null,
) {
  try {
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: adminId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: ip,
    });
  } catch {
    // Non-fatal: audit failure should not break the operation.
  }
}