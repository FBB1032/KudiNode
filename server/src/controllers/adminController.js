import { supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound } from "../utils/AppError.js";
import { auditLog } from "../utils/audit.js";

/**
 * GET /admin/users?status=pending&search=&page=1&limit=20
 * Lists merchant profiles for the admin dashboard, with filtering + pagination.
 */
export const listUsers = asyncHandler(async (req, res) => {
  const { status, search = "", region, page = "1", limit = "20" } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "merchant")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("approval_status", status);
  if (region) query = query.eq("region", region);
  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,phone.ilike.%${search}%,wema_account_number.ilike.%${search}%,email.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query;
  if (error) throw badRequest(error.message);

  res.json({
    users: data,
    pagination: {
      page: pageNum,
      limit: pageSize,
      total: count || 0,
      pages: Math.ceil((count || 0) / pageSize),
    },
  });
});

/**
 * GET /admin/users/:id — full dossier: profile + documents (with signed URLs).
 */
export const getUserDossier = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !profile) throw notFound("User not found");

  const { data: docs } = await supabaseAdmin
    .from("kyc_documents")
    .select(
      "id, doc_type, bucket, storage_path, file_name, mime_type, created_at",
    )
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  // Attach short-lived signed URLs so the admin can view each artifact.
  const documents = await Promise.all(
    (docs || []).map(async (d) => {
      const { data: signed } = await supabaseAdmin.storage
        .from(d.bucket)
        .createSignedUrl(d.storage_path, 60 * 10);
      return {
        id: d.id,
        doc_type: d.doc_type,
        file_name: d.file_name,
        mime_type: d.mime_type,
        created_at: d.created_at,
        url: signed?.signedUrl || null,
      };
    }),
  );

  res.json({ profile, documents });
});

/** Shared helper to change status + write an audit record. */
async function setStatus(adminId, userId, status, reason = null) {
  const patch = {
    approval_status: status,
    rejection_reason: status === "rejected" ? reason : null,
    reviewed_by: adminId,
    reviewed_at: new Date().toISOString(),
  };
  if (status === "approved") patch.kyc_tier = "tier_1";

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("id, approval_status, rejection_reason, kyc_tier")
    .single();

  if (error) throw badRequest(error.message);
  if (!data) throw notFound("User not found");

  await supabaseAdmin.from("admin_actions").insert({
    admin_id: adminId,
    target_user: userId,
    action: status,
    reason,
  });

  await auditLog(
    adminId,
    `${status}_merchant`,
    "merchant",
    userId,
    { rejection_reason: reason || null },
  );

  return data;
}

/** POST /admin/users/:id/approve */
export const approveUser = asyncHandler(async (req, res) => {
  const result = await setStatus(req.user.id, req.params.id, "approved");
  res.json({ ...result, message: "User approved. They can now sign in." });
});

/** POST /admin/users/:id/reject  { reason } */
export const rejectUser = asyncHandler(async (req, res) => {
  const result = await setStatus(
    req.user.id,
    req.params.id,
    "rejected",
    req.body.reason,
  );
  res.json({
    ...result,
    message: "User rejected. A notice has been recorded.",
  });
});

/** POST /admin/users/:id/suspend  { reason? } */
export const suspendUser = asyncHandler(async (req, res) => {
  const result = await setStatus(
    req.user.id,
    req.params.id,
    "suspended",
    req.body?.reason || null,
  );
  res.json({ ...result, message: "User suspended." });
});

/** GET /admin/stats — headline counts for the dashboard. */
export const getStats = asyncHandler(async (_req, res) => {
  const statuses = ["pending", "approved", "rejected", "suspended"];
  const counts = {};
  await Promise.all(
    statuses.map(async (s) => {
      const { count } = await supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "merchant")
        .eq("approval_status", s);
      counts[s] = count || 0;
    }),
  );
  counts.total = Object.values(counts).reduce((a, b) => a + b, 0);
  res.json({ stats: counts });
});
