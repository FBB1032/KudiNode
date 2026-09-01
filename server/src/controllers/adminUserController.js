import { supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound, forbidden } from "../utils/AppError.js";
import { auditLog } from "../utils/audit.js";
import { ADMIN_ROLES } from "../config/permissions.js";

/**
 * GET /admin/admins — list admin users (paginated, filterable by role).
 */
export const listAdminUsers = asyncHandler(async (req, res) => {
  const { role, search = "", page = "1", limit = "50" } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("admin_users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (role) query = query.eq("role", role);
  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%`,
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
 * POST /admin/admins  { email, password, full_name, role, phone? }
 * Creates a Supabase Auth user + admin_users row. Super Admin only.
 */
export const createAdminUser = asyncHandler(async (req, res) => {
  const { email, password, full_name, role, phone } = req.body;

  if (!ADMIN_ROLES[role]) throw badRequest("Invalid admin role");

  const { data: existing } = await supabaseAdmin
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) throw badRequest("An admin with this email already exists");

  const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: "admin", is_admin_staff: true },
  });
  if (error) {
    if (/already registered|exists|been registered/i.test(error.message)) {
      throw badRequest("An account with this email already exists");
    }
    throw badRequest(error.message);
  }

  const { data: admin, error: insErr } = await supabaseAdmin
    .from("admin_users")
    .insert({
      id: user.id,
      role,
      full_name,
      email,
      phone: phone || null,
      created_by: req.user.id,
    })
    .select()
    .single();

  if (insErr) throw badRequest(insErr.message);

  await auditLog(
    req.user.id,
    "create_admin",
    "admin_user",
    user.id,
    { role, email, target_full_name: full_name },
    req.ip,
  );

  res.status(201).json({
    user: {
      id: admin.id,
      role: admin.role,
      full_name: admin.full_name,
      email: admin.email,
      is_active: admin.is_active,
      created_at: admin.created_at,
    },
    message: `Admin account created with role: ${ADMIN_ROLES[role].label}`,
  });
});

/**
 * PUT /admin/admins/:id/role  { role }
 * Changes an admin's role. Super Admin only; cannot demote self below admin.
 */
export const updateAdminRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!ADMIN_ROLES[role]) throw badRequest("Invalid admin role");

  const { data: target, error } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !target) throw notFound("Admin user not found");

  if (id === req.user.id && role !== "super_admin") {
    throw forbidden("You cannot demote your own account");
  }

  // Prevent removing the last active super admin.
  if (target.role === "super_admin" && role !== "super_admin") {
    const { count } = await supabaseAdmin
      .from("admin_users")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("is_active", true);
    if ((count || 0) <= 1) {
      throw forbidden("Cannot demote the last active Super Admin");
    }
  }

  const { data, error: updErr } = await supabaseAdmin
    .from("admin_users")
    .update({ role })
    .eq("id", id)
    .select()
    .single();
  if (updErr) throw badRequest(updErr.message);

  await auditLog(
    req.user.id,
    "update_admin_role",
    "admin_user",
    id,
    { from: target.role, to: role },
    req.ip,
  );

  res.json({
    user: {
      id: data.id,
      role: data.role,
      full_name: data.full_name,
      email: data.email,
      is_active: data.is_active,
    },
    message: `Role updated to ${ADMIN_ROLES[role].label}`,
  });
});

/**
 * DELETE /admin/admins/:id — soft-delete (deactivate). Super Admin only.
 */
export const deleteAdminUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    throw forbidden("You cannot deactivate your own account");
  }

  const { data: target, error } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !target) throw notFound("Admin user not found");

  if (target.role === "super_admin") {
    const { count } = await supabaseAdmin
      .from("admin_users")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("is_active", true);
    if ((count || 0) <= 1) {
      throw forbidden("Cannot deactivate the last active Super Admin");
    }
  }

  const { data, error: delErr } = await supabaseAdmin
    .from("admin_users")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();
  if (delErr) throw badRequest(delErr.message);

  await auditLog(
    req.user.id,
    "deactivate_admin",
    "admin_user",
    id,
    { target_full_name: target.full_name, target_email: target.email },
    req.ip,
  );

  res.json({ message: "Admin account deactivated.", id });
});

/**
 * GET /admin/audit-log — searchable admin audit trail.
 * super_admin, admin, compliance_officer only.
 */
export const getAuditLog = asyncHandler(async (req, res) => {
  const {
    action,
    adminId,
    resourceType,
    page = "1",
    limit = "50",
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("admin_audit_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (action) query = query.eq("action", action);
  if (adminId) query = query.eq("admin_id", adminId);
  if (resourceType) query = query.eq("resource_type", resourceType);

  const { data, error, count } = await query;
  if (error) throw badRequest(error.message);

  // admin_audit_log.admin_id references auth.users(id), not public.admin_users,
  // so a PostgREST embedded join cannot pull in full_name/email/role here.
  // Fetch the admin profiles in one batch and merge by id instead.
  const adminIds = [...new Set((data || []).map((e) => e.admin_id))];
  let adminMap = {};
  if (adminIds.length) {
    const { data: admins } = await supabaseAdmin
      .from("admin_users")
      .select("id, full_name, email, role")
      .in("id", adminIds);
    adminMap = Object.fromEntries(
      (admins || []).map((a) => [a.id, a]),
    );
  }
  const entries = (data || []).map((e) => ({
    ...e,
    admin: adminMap[e.admin_id] || null,
  }));

  res.json({
    entries,
    pagination: {
      page: pageNum,
      limit: pageSize,
      total: count || 0,
      pages: Math.ceil((count || 0) / pageSize),
    },
  });
});