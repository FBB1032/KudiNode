/**
 * Admin dashboard API client. Talks to the KudiNode Node.js backend.
 * The admin authenticates via /auth/login and receives a Supabase session
 * token, which is attached as a Bearer token to all admin requests.
 */
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";
const API_PREFIX = "/api";

const TOKEN_KEY = "kn_admin_token";

export const adminToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = adminToken.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new ApiError(res.status, json?.error?.message || "Request failed");
  }
  return json as T;
}

// ── Types ───────────────────────────────────────────────
export type ApprovalStatus = "pending" | "approved" | "rejected" | "suspended";

export type AdminRole =
  | "super_admin"
  | "operations_manager"
  | "risk_officer"
  | "credit_analyst"
  | "compliance_officer";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  permissions: Record<string, string[]>;
  resources?: string[];
}

export interface AdminProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  trade_name: string | null;
  market_cluster: string | null;
  commodity_type: string | null;
  region: string | null;
  bvn: string | null;
  nin: string | null;
  wema_account_number: string | null;
  wema_account_name: string | null;
  kyc_tier: string;
  approval_status: ApprovalStatus;
  rejection_reason: string | null;
  liveness_score: number | null;
  trust_score: number | null;
  created_at: string;
}

export interface DossierDoc {
  id: string;
  doc_type: string;
  file_name: string | null;
  mime_type: string | null;
  created_at: string;
  url: string | null;
}

export interface AdminStaffUser {
  id: string;
  role: AdminRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  admin?: { full_name: string | null; email: string | null; role: string } | null;
}

export interface Loan {
  id: string;
  merchant_id: string;
  purpose: string | null;
  amount: string;
  status: string;
  created_at: string;
  merchant?: { full_name: string | null; phone: string | null; trade_name: string | null } | null;
}

export interface CoopGroup {
  id: string;
  name: string;
  members: number;
  contribution: string;
  health: string;
  status: string;
  account_number: string | null;
  created_at: string;
}

export interface RiskFlag {
  id: string;
  merchant_id: string | null;
  level: string;
  reason: string | null;
  status: string;
  created_at: string;
  merchant?: { full_name: string | null; phone: string | null; trade_name: string | null } | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ── Auth ────────────────────────────────────────────────
export async function adminLogin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  // Dedicated admin endpoint — validates the email/password AND the admin
  // role in admin_users. Any failure (wrong creds, deactivated staff, or
  // backend unreachable) must surface; a demo-token fallback here would
  // leave a fake token in storage that every subsequent request rejects
  // with "missing/invalid bearer token".
  const res = await request<{
    session: { access_token: string };
    user: AdminUser;
  }>("/auth/admin/login", {
    method: "POST",
    body: { email: normalizedEmail, password },
    auth: false,
  });

  adminToken.set(res.session.access_token);
  localStorage.setItem("kn_admin_user", JSON.stringify(res.user));
  return res.user;
}

export function adminLogout() {
  request("/auth/logout", { method: "POST" }).catch(() => {});
  adminToken.clear();
  localStorage.removeItem("kn_admin_user");
}

// ── Data ────────────────────────────────────────────────
export function getStats() {
  return request<{
    stats: {
      pending: number;
      approved: number;
      rejected: number;
      suspended: number;
      total: number;
    };
  }>("/admin/stats");
}

export function listUsers(params: {
  status?: string;
  search?: string;
  region?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== "All") q.set(k, String(v));
  });
  return request<{
    users: AdminProfile[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>(`/admin/users?${q.toString()}`);
}

export function getDossier(id: string) {
  return request<{ profile: AdminProfile; documents: DossierDoc[] }>(
    `/admin/users/${id}`,
  );
}

export function approveUser(id: string) {
  return request(`/admin/users/${id}/approve`, { method: "POST" });
}

export function rejectUser(id: string, reason: string) {
  return request(`/admin/users/${id}/reject`, {
    method: "POST",
    body: { reason },
  });
}

export function suspendUser(id: string, reason?: string) {
  return request(`/admin/users/${id}/suspend`, {
    method: "POST",
    body: { reason },
  });
}

// ── Admin User Management (super_admin) ──────────────────

export function listAdminUsers(params: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  return request<{ users: AdminStaffUser[]; pagination: Pagination }>(
    `/admin/admins?${q.toString()}`,
  );
}

export function createAdminUser(data: {
  email: string;
  password: string;
  full_name: string;
  role: AdminRole;
  phone?: string;
}) {
  return request<{ user: AdminStaffUser; message: string }>("/admin/admins", {
    method: "POST",
    body: data,
  });
}

export function updateAdminRole(id: string, role: AdminRole) {
  return request<{ user: AdminStaffUser; message: string }>(
    `/admin/admins/${id}/role`,
    { method: "PUT", body: { role } },
  );
}

export function deleteAdminUser(id: string) {
  return request<{ message: string; id: string }>(`/admin/admins/${id}`, {
    method: "DELETE",
  });
}

export function reactivateAdminUser(id: string) {
  return request<{ user: AdminStaffUser; message: string }>(
    `/admin/admins/${id}/reactivate`,
    { method: "POST" },
  );
}

// ── Audit Log ────────────────────────────────────────────

export function getAuditLog(params: {
  action?: string;
  adminId?: string;
  resourceType?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  return request<{ entries: AuditLogEntry[]; pagination: Pagination }>(
    `/admin/audit-log?${q.toString()}`,
  );
}

// ── Settings ─────────────────────────────────────────────

export function getSystemSettings() {
  return request<{ config: Record<string, unknown> }>("/admin/settings");
}

export function updateSystemSettings(config: Record<string, unknown>) {
  return request<{ config: Record<string, unknown>; message: string }>(
    "/admin/settings",
    { method: "PUT", body: { config } },
  );
}

// ── Credit ───────────────────────────────────────────────

export function listLoans(params: { status?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  return request<{ loans: Loan[]; pagination: Pagination }>(
    `/admin/credit/loans?${q.toString()}`,
  );
}

export function createLoan(data: { merchant_id: string; purpose?: string; amount: number }) {
  return request<{ loan: Loan }>("/admin/credit/loans", {
    method: "POST",
    body: data,
  });
}

export function updateLoan(id: string, status: string) {
  return request<{ loan: Loan }>(`/admin/credit/loans/${id}`, {
    method: "PUT",
    body: { status },
  });
}

// ── Co-op ────────────────────────────────────────────────

export function listCoopGroups(params: { page?: number; limit?: number }) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && !(typeof v === "string" && v === ""))
      q.set(k, String(v));
  });
  return request<{ groups: CoopGroup[]; pagination: Pagination }>(
    `/admin/coop/groups?${q.toString()}`,
  );
}

export function createCoopGroup(data: {
  name: string;
  members?: number;
  contribution?: number;
  account_number?: string;
}) {
  return request<{ group: CoopGroup }>("/admin/coop/groups", {
    method: "POST",
    body: data,
  });
}

export function updateCoopGroup(id: string, data: Partial<CoopGroup>) {
  return request<{ group: CoopGroup }>(`/admin/coop/groups/${id}`, {
    method: "PUT",
    body: data,
  });
}

// ── Risk ─────────────────────────────────────────────────

export function getRiskData() {
  return request<{
    flags: RiskFlag[];
    summary: { total_merchants: number; open_flags: number };
  }>("/admin/risk");
}

export function createRiskFlag(data: {
  merchant_id?: string;
  level?: string;
  reason?: string;
}) {
  return request<{ flag: RiskFlag }>("/admin/risk/flags", {
    method: "POST",
    body: data,
  });
}

export function updateRiskFlag(id: string, data: { level?: string; status?: string }) {
  return request<{ flag: RiskFlag }>(`/admin/risk/flags/${id}`, {
    method: "PUT",
    body: data,
  });
}

// ── Reports Export ───────────────────────────────────────

export function exportReport(format: "json" | "csv" = "json") {
  return request<{ merchants: AdminProfile[]; count: number }>(
    `/admin/reports/export?format=${format}`,
  );
}
