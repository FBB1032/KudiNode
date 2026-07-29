import { Router } from "express";
import multer from "multer";
import {
  parseVoiceTransferIntent,
  extractReceiptItems,
} from "../controllers/aiController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const memoryStorage = multer.memoryStorage();

const audioUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "audio/webm",
      "audio/wav",
      "audio/x-wav",
      "audio/mpeg",
      "audio/mp3",
      "audio/mp4",
      "audio/x-m4a",
      "audio/aac",
      "audio/ogg",
    ];

    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only common audio formats are allowed"));
  },
});

const imageUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only JPEG, PNG, and WEBP receipt images are allowed"));
  },
});

router.use(requireAuth);

router.post("/voice-transfer", audioUpload.single("audio"), parseVoiceTransferIntent);
router.post("/receipt-extract", imageUpload.single("image"), extractReceiptItems);

export default router;
