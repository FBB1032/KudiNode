import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^(\+?234|0)?[0-9]{10}$/, "Invalid Nigerian phone number");

// Optional numeric identifier: either omitted/empty, or exactly 11 digits.
const optionalElevenDigits = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{11}$/.test(v), {
    message: "Must be exactly 11 digits",
  })
  .optional()
  .transform((v) => (v ? v : undefined));

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
  bvn: optionalElevenDigits,
  nin: optionalElevenDigits,
  trade_name: z.string().trim().max(160).optional(),
  market_cluster: z.string().trim().max(160).optional(),
  commodity_type: z.string().trim().max(160).optional(),
  esusu_coop_name: z.string().trim().max(160).optional(),
  wema_account_number: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{10}$/.test(v), {
      message: "Account number must be 10 digits",
    })
    .optional()
    .transform((v) => (v ? v : undefined)),
  wema_account_name: z.string().trim().max(160).optional(),
  region: z.string().trim().max(80).optional(),
});

/** POST /admin/users/:id/reject */
export const rejectSchema = z.object({
  reason: z.string().trim().min(3, "A rejection reason is required").max(500),
});

export const ADMIN_ROLE_VALUES = [
  "super_admin",
  "operations_manager",
  "risk_officer",
  "credit_analyst",
  "compliance_officer",
];

/** POST /admin/admins — create a new admin user (super_admin only) */
export const createAdminSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().trim().min(2).max(120),
  role: z.enum(ADMIN_ROLE_VALUES),
  phone: z.string().trim().optional(),
});

/** PUT /admin/admins/:id/role — change an admin's role */
export const updateAdminRoleSchema = z.object({
  role: z.enum(ADMIN_ROLE_VALUES),
});

/** POST /admin/credit/loans */
export const createLoanSchema = z.object({
  merchant_id: z.string().uuid(),
  purpose: z.string().trim().max(200).optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
});

/** PUT /admin/credit/loans/:id */
export const updateLoanSchema = z.object({
  status: z.enum(["new", "review", "approved", "declined", "more_info"]),
});

/** POST /admin/coop/groups */
export const createCoopGroupSchema = z.object({
  name: z.string().trim().min(2).max(160),
  members: z.coerce.number().int().min(0).default(0),
  contribution: z.coerce.number().min(0).default(0),
  account_number: z.string().trim().max(20).optional(),
});

/** PUT /admin/coop/groups/:id */
export const updateCoopGroupSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  members: z.coerce.number().int().min(0).optional(),
  contribution: z.coerce.number().min(0).optional(),
  health: z.enum(["healthy", "at_risk", "critical"]).optional(),
  status: z.enum(["active", "pending", "inactive"]).optional(),
  account_number: z.string().trim().max(20).optional(),
});

/** POST /admin/risk/flags */
export const createRiskFlagSchema = z.object({
  merchant_id: z.string().uuid().nullable().optional(),
  level: z.enum(["high", "medium", "low"]).default("medium"),
  reason: z.string().trim().max(500).optional(),
});

/** PUT /admin/risk/flags/:id */
export const updateRiskFlagSchema = z.object({
  level: z.enum(["high", "medium", "low"]).optional(),
  status: z.enum(["open", "reviewed", "resolved"]).optional(),
});

/** PUT /admin/settings */
export const settingsSchema = z.object({
  config: z.record(z.string(), z.any()),
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
