/**
 * Domain-level API functions for the KudiNode mobile app.
 * These map 1:1 to the Node backend endpoints.
 */
import { api } from "./apiClient";
import { tokenStore } from "./tokenStore";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "suspended";
export type KycTier = "tier_0" | "tier_1" | "tier_2" | "tier_3";

export type DocType =
  | "id_nin"
  | "id_driver_license"
  | "id_passport"
  | "id_voter_card"
  | "selfie"
  | "ledger"
  | "proof_of_business";

export interface Profile {
  id: string;
  role: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  preferred_language: string | null;
  bvn: string | null;
  nin: string | null;
  trade_name: string | null;
  market_cluster: string | null;
  commodity_type: string | null;
  esusu_coop_name: string | null;
  wema_account_number: string | null;
  wema_account_name: string | null;
  region: string | null;
  kyc_tier: KycTier;
  approval_status: ApprovalStatus;
  rejection_reason: string | null;
  trust_score: number | null;
  created_at: string;
}

export interface SessionUser {
  id: string;
  phone: string;
  full_name: string | null;
  role: string;
  approval_status: ApprovalStatus;
  kyc_tier: KycTier;
}

// ── Auth ────────────────────────────────────────────────
// Merchants register with email + password + phone; they later sign in with
// their phone number + a 4-digit PIN.
export async function signup(input: {
  email: string;
  password: string;
  phone: string;
  full_name: string;
  preferred_language?: string;
}) {
  const res = await api.post<{
    user: { id: string; phone: string; email: string };
    session: { access_token: string; refresh_token: string } | null;
    message: string;
  }>("/auth/signup", input, false);

  // Persist the KYC session so the pending user can upload docs & fill profile.
  if (res.session) {
    await tokenStore.save(res.session.access_token, res.session.refresh_token);
  }
  return res;
}

export async function login(phone: string, pin: string): Promise<SessionUser> {
  const res = await api.post<{
    session: { access_token: string; refresh_token: string };
    user: SessionUser;
  }>("/auth/login", { phone, pin }, false);

  await tokenStore.save(res.session.access_token, res.session.refresh_token);
  return res.user;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    await tokenStore.clear();
  }
}

// ── Profile ─────────────────────────────────────────────
export async function getProfile() {
  return api.get<{ profile: Profile; documents: any[] }>("/profile");
}

export async function updateProfile(patch: Partial<Profile>) {
  return api.put<{ profile: Profile }>("/profile", patch);
}

export async function submitForReview() {
  return api.post<{
    approval_status: ApprovalStatus;
    kyc_tier: KycTier;
    message: string;
  }>("/profile/submit");
}

// ── Uploads ─────────────────────────────────────────────
/**
 * Uploads a captured photo (from expo-camera) to the backend, which proxies it
 * into private Supabase Storage and records metadata linked to the user.
 *
 * @param uri       local file URI returned by CameraView.takePictureAsync()
 * @param docType   which artifact this represents
 */
export async function uploadDocument(uri: string, docType: DocType) {
  const form = new FormData();
  const name = `${docType}-${Date.now()}.jpg`;
  // React Native FormData accepts a file descriptor object at runtime; the DOM
  // typings don't model this, so we cast to `any`.
  form.append("file", {
    uri,
    name,
    type: "image/jpeg",
  } as any);
  form.append("doc_type", docType);

  return api.postForm<{ document: { id: string; doc_type: DocType } }>(
    "/uploads",
    form,
  );
}
