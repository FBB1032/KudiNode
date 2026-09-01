import { supabaseAdmin } from "../config/supabase.js";
import { unauthorized, forbidden } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Extracts the Bearer token, validates it against Supabase Auth, and attaches
 * `req.user` (the auth user) and `req.accessToken` for downstream handlers.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw unauthorized("Missing bearer token");

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) throw unauthorized("Invalid or expired token");

  req.user = data.user;
  req.accessToken = token;
  next();
});

/**
 * Requires the authenticated user to be an active admin in the `admin_users`
 * RBAC table. Must run after requireAuth. Attaches `req.adminRole` and
 * `req.adminName` for downstream permission checks.
 */
export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("role, full_name, is_active")
    .eq("id", req.user.id)
    .single();

  if (error || !data) throw forbidden("Admin account not found");
  if (!data.is_active) throw forbidden("Admin account is deactivated");

  req.adminRole = data.role;
  req.adminName = data.full_name;
  next();
});

/**
 * Optional authentication middleware. Attaches user if token is valid,
 * but allows request to proceed if missing or invalid.
 */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const { data } = await supabaseAdmin.auth.getUser(token);
      if (data?.user) {
        req.user = data.user;
        req.accessToken = token;
      }
    } catch {
      // Ignore invalid token in optional auth
    }
  }
  next();
});
