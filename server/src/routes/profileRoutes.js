import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
  submitForReview,
} from "../controllers/profileController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { profileSchema } from "../schemas/index.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMyProfile);
router.put("/", validateBody(profileSchema), updateMyProfile);
router.post("/submit", submitForReview);

export default router;
