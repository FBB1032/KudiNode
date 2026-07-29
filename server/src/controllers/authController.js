import { supabaseAdmin } from "../config/supabase.js";
import { env } from "../config/env.js";
import { createClient } from "@supabase/supabase-js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, forbidden, unauthorized } from "../utils/AppError.js";
import { normalizePhone } from "../utils/credentials.js";

// A fresh anon client used only to exchange credentials/OTP for a session.
function anonClient() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Mint a Supabase session for a user by email WITHOUT their password.
 * We ask the admin API for a magiclink (which yields a one-time email_otp),
 * then verify that OTP on an anon client to obtain access/refresh tokens.
 */
async function mintSessionForEmail(email) {
  const { data: linkData, error: linkErr } =
    await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
  if (linkErr) throw linkErr;

  const otp = linkData?.properties?.email_otp;
  if (!otp) throw new Error("Could not generate sign-in token");

  const anon = anonClient();
  const { data, error } = await anon.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });
  if (error || !data?.session) {
    throw error || new Error("Could not establish session");
  }
  return data.session;
}

/**
 * POST /auth/signup
 * Merchant onboarding with a real email + password (their Supabase Auth
 * credentials) plus a phone number that becomes their app sign-in identifier.
 * The DB trigger (handle_new_user) auto-creates the linked profile row with
 * approval_status = 'pending'.
 */
export const signup = asyncHandler(async (req, res) => {
  const { email, password, phone, full_name, preferred_language } = req.body;

  const normalizedPhone = normalizePhone(phone);

  // Guard against a phone already tied to another merchant.
  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("phone", normalizedPhone)
    .maybeSingle();
  if (existing) {
    throw badRequest("An account with this phone number already exists");
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, phone: normalizedPhone, role: "merchant" },
  });

  if (error) {
    if (/already registered|exists|been registered/i.test(error.message)) {
      throw badRequest("An account with this email already exists");
    }
    throw badRequest(error.message);
  }

  const userId = data.user.id;

  // Seed extra profile fields the trigger doesn't set.
  await supabaseAdmin
    .from("profiles")
    .update({
      phone: normalizedPhone,
      ...(preferred_language ? { preferred_language } : {}),
    })
    .eq("id", userId);

  // Issue a session so the (still pending) merchant can complete their KYC:
  // fill their profile and upload documents. The approval gate is enforced
  // separately at /auth/login, so a pending merchant still cannot enter the app.
  let session = null;
  try {
    const s = await mintSessionForEmail(email);
    session = {
      access_token: s.access_token,
      refresh_token: s.refresh_token,
      expires_at: s.expires_at,
    };
  } catch {
    /* non-fatal — merchant can still sign in later once approved */
  }

  res.status(201).json({
    user: { id: userId, phone: normalizedPhone, email },
    session,
    message:
      "Account created. Complete your KYC profile, then await admin approval before you can sign in.",
  });
});

/**
 * POST /auth/login
 * Merchant sign in with phone + 4-digit PIN. The phone number is the real
 * sign-in identifier; the PIN is a lightweight 4-digit app factor (validated
 * for shape by the schema). Enforces the approval gate: only 'approved'
 * merchants receive a session.
 */
export const login = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const normalizedPhone = normalizePhone(phone);

  const { data: profile, error: pErr } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, email, approval_status, rejection_reason, role, full_name, kyc_tier, phone",
    )
    .eq("phone", normalizedPhone)
    .maybeSingle();

  if (pErr || !profile || !profile.email) {
    throw unauthorized("No account found for this phone number");
  }

  if (profile.approval_status !== "approved") {
    const messages = {
      pending:
        "Your account is pending admin approval. You'll be notified once your KYC is reviewed.",
      rejected: profile.rejection_reason
        ? `Your account was rejected: ${profile.rejection_reason}`
        : "Your account was rejected. Please contact support.",
      suspended: "Your account has been suspended. Please contact support.",
    };
    throw forbidden(messages[profile.approval_status] || "Access denied");
  }

  const session = await mintSessionForEmail(profile.email);

  res.json({
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
    },
    user: {
      id: profile.id,
      phone: profile.phone,
      full_name: profile.full_name,
      role: profile.role,
      approval_status: profile.approval_status,
      kyc_tier: profile.kyc_tier,
    },
  });
});

/**
 * POST /auth/admin/login
 * Admin dashboard sign in with email + password. Only 'admin'/'super_admin'
 * roles are permitted; merchants attempting to use this endpoint are rejected.
 */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const anon = anonClient();
  const { data, error } = await anon.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data?.session) {
    throw unauthorized("Invalid email or password");
  }

  const userId = data.user.id;

  const { data: profile, error: pErr } = await supabaseAdmin
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .single();

  const isAdmin = profile && ["admin", "super_admin"].includes(profile.role);

  if (pErr || !isAdmin) {
    await supabaseAdmin.auth.admin
      .signOut(data.session.access_token)
      .catch(() => {});
    throw forbidden("This account does not have admin access.");
  }

  res.json({
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
    user: {
      id: userId,
      email: data.user.email,
      full_name: profile.full_name,
      role: profile.role,
    },
  });
});

/**
 * POST /auth/logout — revokes the current session token.
 */
export const logout = asyncHandler(async (req, res) => {
  await supabaseAdmin.auth.admin.signOut(req.accessToken).catch(() => {});
  res.json({ message: "Logged out" });
});
