import { supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound } from "../utils/AppError.js";
import { auditLog } from "../utils/audit.js";

// ── Credit / Loans ──────────────────────────────────────────────────────────

export const listLoans = asyncHandler(async (req, res) => {
  const { status, page = "1", limit = "50" } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("loans")
    .select("*, merchant:merchant_id(full_name, phone, trade_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) throw badRequest(error.message);

  res.json({ loans: data, pagination: { page: pageNum, limit: pageSize, total: count || 0, pages: Math.ceil((count || 0) / pageSize) } });
});

export const createLoan = asyncHandler(async (req, res) => {
  const { merchant_id, purpose, amount } = req.body;
  const { data, error } = await supabaseAdmin
    .from("loans")
    .insert({ merchant_id, purpose, amount, created_by: req.user.id, status: "new" })
    .select()
    .single();
  if (error) throw badRequest(error.message);

  await auditLog(req.user.id, "create_loan", "loan", data.id, { merchant_id, amount }, req.ip);
  res.status(201).json({ loan: data });
});

export const updateLoan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) throw badRequest("Status is required");

  const { data, error } = await supabaseAdmin
    .from("loans")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw notFound("Loan not found");

  await auditLog(req.user.id, "update_loan", "loan", id, { status }, req.ip);
  res.json({ loan: data });
});

// ── Co-op / Esusu ───────────────────────────────────────────────────────────

export const listCoopGroups = asyncHandler(async (req, res) => {
  const { page = "1", limit = "50" } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabaseAdmin
    .from("coop_groups")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw badRequest(error.message);

  res.json({ groups: data, pagination: { page: pageNum, limit: pageSize, total: count || 0, pages: Math.ceil((count || 0) / pageSize) } });
});

export const createCoopGroup = asyncHandler(async (req, res) => {
  const { name, members, contribution, account_number } = req.body;
  const { data, error } = await supabaseAdmin
    .from("coop_groups")
    .insert({ name, members, contribution, account_number, created_by: req.user.id })
    .select()
    .single();
  if (error) throw badRequest(error.message);

  await auditLog(req.user.id, "create_coop_group", "coop_group", data.id, { name }, req.ip);
  res.status(201).json({ group: data });
});

export const updateCoopGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, members, contribution, health, status, account_number } = req.body;
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (members !== undefined) patch.members = members;
  if (contribution !== undefined) patch.contribution = contribution;
  if (health !== undefined) patch.health = health;
  if (status !== undefined) patch.status = status;
  if (account_number !== undefined) patch.account_number = account_number;

  const { data, error } = await supabaseAdmin
    .from("coop_groups")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw notFound("Co-op group not found");

  await auditLog(req.user.id, "update_coop_group", "coop_group", id, patch, req.ip);
  res.json({ group: data });
});

// ── Risk ────────────────────────────────────────────────────────────────────

export const getRiskData = asyncHandler(async (req, res) => {
  const { data: flags, error: fErr } = await supabaseAdmin
    .from("risk_flags")
    .select("*, merchant:merchant_id(full_name, phone, trade_name)")
    .order("created_at", { ascending: false });
  if (fErr) throw badRequest(fErr.message);

  const { count: total } = await supabaseAdmin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "merchant");

  res.json({
    flags,
    summary: { total_merchants: total || 0, open_flags: flags.filter((f) => f.status === "open").length },
  });
});

export const createRiskFlag = asyncHandler(async (req, res) => {
  const { merchant_id, level, reason } = req.body;
  const { data, error } = await supabaseAdmin
    .from("risk_flags")
    .insert({ merchant_id, level, reason, created_by: req.user.id })
    .select()
    .single();
  if (error) throw badRequest(error.message);

  await auditLog(req.user.id, "create_risk_flag", "risk_flag", data.id, { merchant_id, level }, req.ip);
  res.status(201).json({ flag: data });
});

export const updateRiskFlag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { level, status } = req.body;
  const patch = {};
  if (level !== undefined) patch.level = level;
  if (status !== undefined) patch.status = status;

  const { data, error } = await supabaseAdmin
    .from("risk_flags")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw notFound("Risk flag not found");

  await auditLog(req.user.id, "update_risk_flag", "risk_flag", id, patch, req.ip);
  res.json({ flag: data });
});

// ── Reports Export ──────────────────────────────────────────────────────────

export const exportReport = asyncHandler(async (req, res) => {
  const { format = "json" } = req.query;

  const { data: merchants, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, phone, email, trade_name, region, kyc_tier, approval_status, trust_score, created_at")
    .eq("role", "merchant")
    .order("created_at", { ascending: false });

  if (error) throw badRequest(error.message);

  await auditLog(req.user.id, "export_report", "report", null, { format, count: merchants?.length }, req.ip);

  if (format === "csv") {
    const headers = ["ID", "Full Name", "Phone", "Email", "Trade Name", "Region", "KYC Tier", "Approval Status", "Trust Score", "Created At"];
    const rows = (merchants || []).map((m) => [
      m.id,
      `"${(m.full_name || "").replace(/"/g, '""')}"`,
      `"${(m.phone || "").replace(/"/g, '""')}"`,
      `"${(m.email || "").replace(/"/g, '""')}"`,
      `"${(m.trade_name || "").replace(/"/g, '""')}"`,
      `"${(m.region || "").replace(/"/g, '""')}"`,
      m.kyc_tier,
      m.approval_status,
      m.trust_score ?? 0,
      m.created_at,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=kudinode_report_${new Date().toISOString().split("T")[0]}.csv`);
    return res.send(csv);
  }

  res.json({ merchants, count: merchants?.length || 0 });
});