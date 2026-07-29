import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^(\+?234|0)?[0-9]{10}$/, "Invalid Nigerian phone number");

const elevenDigits = z
  .string()
  .trim()
  .regex(/^\d{11}$/, "Must be exactly 11 digits");

const pin = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "PIN must be exactly 4 digits");

/**
 * POST /auth/signup — merchant onboarding.
 * Merchants register with a real email + password (their Supabase Auth
 * credentials) plus a phone number used as their app sign-in identifier.
 */
export const signupSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone,
  full_name: z.string().trim().min(2).max(120),
  preferred_language: z.string().trim().optional(),
});

/**
 * POST /auth/login — merchant sign in with phone + password.
 * The phone resolves the account, password is authenticated via Supabase Auth.
 */
export const loginSchema = z.object({
  phone,
  password: z.string().min(1, "Password is required"),
});

/** POST /auth/admin/login — admin dashboard sign in with email + password */
export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

/** PUT /profile — merchant fills / updates KYC profile data */
export const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(120).optional(),
  phone: phone.optional(),
  preferred_language: z.string().trim().optional(),
  bvn: elevenDigits.optional(),
  nin: elevenDigits.optional(),
  trade_name: z.string().trim().max(160).optional(),
  market_cluster: z.string().trim().max(160).optional(),
  commodity_type: z.string().trim().max(160).optional(),
  esusu_coop_name: z.string().trim().max(160).optional(),
  wema_account_number: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Account number must be 10 digits")
    .optional(),
  wema_account_name: z.string().trim().max(160).optional(),
  region: z.string().trim().max(80).optional(),
});

/** POST /admin/users/:id/reject */
export const rejectSchema = z.object({
  reason: z.string().trim().min(3, "A rejection reason is required").max(500),
});

export const DOC_TYPES = [
  "id_nin",
  "id_driver_license",
  "id_passport",
  "id_voter_card",
  "selfie",
  "ledger",
  "proof_of_business",
];
