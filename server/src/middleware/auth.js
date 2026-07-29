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
 * Requires the authenticated user to have an admin/super_admin role in
 * their profile. Must run after requireAuth.
 */
export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", req.user.id)
    .single();

  if (error || !data) throw forbidden("Profile not found");
  if (!["admin", "super_admin"].includes(data.role)) {
    throw forbidden("Admin privileges required");
  }
  req.role = data.role;
  next();
});
