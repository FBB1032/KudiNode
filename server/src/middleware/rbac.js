import { forbidden } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { hasPermission } from "../config/permissions.js";

export function requirePermission(resource, action) {
  return asyncHandler(async (req, _res, next) => {
    if (!req.adminRole) {
      throw forbidden("Admin role not resolved");
    }
    if (!hasPermission(req.adminRole, resource, action)) {
      throw forbidden(
        `Insufficient permissions: ${action} on ${resource}`,
      );
    }
    next();
  });
}