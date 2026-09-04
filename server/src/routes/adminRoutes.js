import { Router } from "express";
import {
  listUsers,
  getUserDossier,
  approveUser,
  rejectUser,
  suspendUser,
  getStats,
} from "../controllers/adminController.js";
import {
  listAdminUsers,
  createAdminUser,
  updateAdminRole,
  deleteAdminUser,
  reactivateAdminUser,
  getAuditLog,
} from "../controllers/adminUserController.js";
import {
  getSystemSettings,
  updateSystemSettings,
} from "../controllers/systemController.js";
import {
  listLoans,
  createLoan,
  updateLoan,
  listCoopGroups,
  createCoopGroup,
  updateCoopGroup,
  getRiskData,
  createRiskFlag,
  updateRiskFlag,
  exportReport,
} from "../controllers/domainController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import {
  rejectSchema,
  createAdminSchema,
  updateAdminRoleSchema,
  createLoanSchema,
  updateLoanSchema,
  createCoopGroupSchema,
  updateCoopGroupSchema,
  createRiskFlagSchema,
  updateRiskFlagSchema,
  settingsSchema,
} from "../schemas/index.js";

const router = Router();

// Every admin route requires a valid session AND an active admin role.
router.use(requireAuth, requireAdmin);

// Dashboard
router.get("/stats", requirePermission("dashboard", "view"), getStats);

// Merchants — KYC audit
router.get("/users", requirePermission("merchants", "view"), listUsers);
router.get("/users/:id", requirePermission("merchants", "view"), getUserDossier);
router.post(
  "/users/:id/approve",
  requirePermission("merchants", "approve"),
  approveUser,
);
router.post(
  "/users/:id/reject",
  requirePermission("merchants", "reject"),
  validateBody(rejectSchema),
  rejectUser,
);
router.post(
  "/users/:id/suspend",
  requirePermission("merchants", "suspend"),
  suspendUser,
);

// Admin user management (super_admin only)
router.get("/admins", requirePermission("admin_users", "view"), listAdminUsers);
router.post(
  "/admins",
  requirePermission("admin_users", "create"),
  validateBody(createAdminSchema),
  createAdminUser,
);
router.put(
  "/admins/:id/role",
  requirePermission("admin_users", "edit"),
  validateBody(updateAdminRoleSchema),
  updateAdminRole,
);
// Super Admin reactivates a deactivated admin account.
router.post(
  "/admins/:id/reactivate",
  requirePermission("admin_users", "edit"),
  reactivateAdminUser,
);
router.delete(
  "/admins/:id",
  requirePermission("admin_users", "delete"),
  deleteAdminUser,
);

// Audit log (super_admin, admin, compliance_officer)
router.get("/audit-log", requirePermission("audit_log", "view"), getAuditLog);

// System settings (super_admin only for edit; view for admin/ops)
router.get("/settings", requirePermission("settings", "view"), getSystemSettings);
router.put(
  "/settings",
  requirePermission("settings", "edit"),
  validateBody(settingsSchema),
  updateSystemSettings,
);

// Credit
router.get("/credit/loans", requirePermission("credit", "view"), listLoans);
router.post(
  "/credit/loans",
  requirePermission("credit", "create"),
  validateBody(createLoanSchema),
  createLoan,
);
router.put(
  "/credit/loans/:id",
  requirePermission("credit", "edit"),
  validateBody(updateLoanSchema),
  updateLoan,
);

// Co-op / Esusu
router.get("/coop/groups", requirePermission("coop", "view"), listCoopGroups);
router.post(
  "/coop/groups",
  requirePermission("coop", "create"),
  validateBody(createCoopGroupSchema),
  createCoopGroup,
);
router.put(
  "/coop/groups/:id",
  requirePermission("coop", "edit"),
  validateBody(updateCoopGroupSchema),
  updateCoopGroup,
);

// Risk
router.get("/risk", requirePermission("risk", "view"), getRiskData);
router.post(
  "/risk/flags",
  requirePermission("risk", "create"),
  validateBody(createRiskFlagSchema),
  createRiskFlag,
);
router.put(
  "/risk/flags/:id",
  requirePermission("risk", "edit"),
  validateBody(updateRiskFlagSchema),
  updateRiskFlag,
);

// Reports export
router.get("/reports/export", requirePermission("reports", "export"), exportReport);

export default router;