import { supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound } from "../utils/AppError.js";
import { normalizePhone } from "../utils/credentials.js";

/**
 * GET /profile — returns the authenticated user's profile + their documents.
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();

  if (error || !profile) throw notFound("Profile not found");

  const { data: documents } = await supabaseAdmin
    .from("kyc_documents")
    .select("id, doc_type, file_name, mime_type, size_bytes, created_at")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  res.json({ profile, documents: documents || [] });
});

/**
 * PUT /profile — upserts KYC/profile data for the authenticated merchant.
 * A profile is always reset to 'pending' when the user edits it after a
 * rejection, so admins re-review the changes.
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const patch = { ...req.body };

  // Always store the sign-in identifier in canonical 234XXXXXXXXXX form so
  // the login lookup (which resolves any input format to this form) matches.
  if (patch.phone) patch.phone = normalizePhone(patch.phone);

  // If the user is editing after rejection, re-queue for review.
  const { data: current } = await supabaseAdmin
    .from("profiles")
    .select("approval_status")
    .eq("id", req.user.id)
    .single();

  if (current?.approval_status === "rejected") {
    patch.approval_status = "pending";
    patch.rejection_reason = null;
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(patch)
    .eq("id", req.user.id)
    .select("*")
    .single();

  if (error) throw badRequest(error.message);
  res.json({ profile: data });
});

/**
 * POST /profile/submit — merchant signals KYC is complete and ready for review.
 * Validates that mandatory docs (an ID + a selfie) have been uploaded.
 */
export const submitForReview = asyncHandler(async (req, res) => {
  const { data: docs } = await supabaseAdmin
    .from("kyc_documents")
    .select("doc_type")
    .eq("user_id", req.user.id);

  const types = new Set((docs || []).map((d) => d.doc_type));
  const hasId = [...types].some((t) => t.startsWith("id_"));
  const hasSelfie = types.has("selfie");

  if (!hasId || !hasSelfie) {
    throw badRequest(
      "Please upload at least one government ID document and a selfie before submitting.",
    );
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ approval_status: "pending", kyc_tier: "tier_1" })
    .eq("id", req.user.id)
    .select("approval_status, kyc_tier")
    .single();

  if (error) throw badRequest(error.message);
  res.json({
    ...data,
    message: "KYC submitted. Your account is now pending admin approval.",
  });
});
