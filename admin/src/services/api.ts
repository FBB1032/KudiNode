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

// ── Auth ────────────────────────────────────────────────
export async function adminLogin(email: string, password: string) {
  // Dedicated admin endpoint — validates the email/password AND the admin role
  // server-side, so merchants (phone+PIN accounts) can never sign in here.
  const res = await request<{
    session: { access_token: string };
    user: { id: string; role: string; full_name: string | null };
  }>("/auth/admin/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });

  adminToken.set(res.session.access_token);
  return res.user;
}

export function adminLogout() {
  request("/auth/logout", { method: "POST" }).catch(() => {});
  adminToken.clear();
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
