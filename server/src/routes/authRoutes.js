import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  signup,
  login,
  adminLogin,
  logout,
} from "../controllers/authController.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import {
  signupSchema,
  loginSchema,
  adminLoginSchema,
} from "../schemas/index.js";

const router = Router();

// Throttle auth endpoints to blunt credential-stuffing / brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many attempts. Try again later." } },
});

router.post("/signup", authLimiter, validateBody(signupSchema), signup);
router.post("/login", authLimiter, validateBody(loginSchema), login);
router.post(
  "/admin/login",
  authLimiter,
  validateBody(adminLoginSchema),
  adminLogin,
);
router.post("/logout", requireAuth, logout);

export default router;
