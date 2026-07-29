import { Router } from "express";
import multer from "multer";
import {
  uploadDocument,
  getSignedUrl,
} from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Keep files in memory; we stream them straight to Supabase Storage.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB cap
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (ok.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only JPEG, PNG, WEBP or PDF files are allowed"));
  },
});

router.use(requireAuth);

router.post("/", upload.single("file"), uploadDocument);
router.get("/:id/url", getSignedUrl);

export default router;
