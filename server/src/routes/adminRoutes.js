import { Router } from "express";
import {
  listUsers,
  getUserDossier,
  approveUser,
  rejectUser,
  suspendUser,
  getStats,
} from "../controllers/adminController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { rejectSchema } from "../schemas/index.js";

const router = Router();

// Every admin route requires a valid session AND an admin role.
router.use(requireAuth, requireAdmin);

router.get("/stats", getStats);
router.get("/users", listUsers);
router.get("/users/:id", getUserDossier);
router.post("/users/:id/approve", approveUser);
router.post("/users/:id/reject", validateBody(rejectSchema), rejectUser);
router.post("/users/:id/suspend", suspendUser);

export default router;
