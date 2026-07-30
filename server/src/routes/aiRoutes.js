import { Router } from "express";
import multer from "multer";
import {
  parseVoiceTransferIntent,
  extractReceiptItems,
  parseVoiceSalesLogIntent,
  chatWithKudiBot,
} from "../controllers/aiController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

const memoryStorage = multer.memoryStorage();

const audioUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase();
    const name = (file.originalname || "").toLowerCase();

    if (
      mime.startsWith("audio/") ||
      mime === "application/octet-stream" ||
      mime === "binary/octet-stream" ||
      name.endsWith(".m4a") ||
      name.endsWith(".mp4") ||
      name.endsWith(".wav") ||
      name.endsWith(".mp3") ||
      name.endsWith(".3gp") ||
      name.endsWith(".aac") ||
      name.endsWith(".webm")
    ) {
      return cb(null, true);
    }

    cb(new Error("Only audio formats (m4a, wav, mp3, webm, aac) are allowed"));
  },
});

const imageUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase();
    if (mime.startsWith("image/") || mime === "application/octet-stream") {
      return cb(null, true);
    }
    cb(new Error("Only JPEG, PNG, and WEBP receipt images are allowed"));
  },
});

router.use(optionalAuth);

router.post(
  "/voice-transfer",
  audioUpload.single("audio"),
  parseVoiceTransferIntent,
);
router.post(
  "/receipt-extract",
  imageUpload.single("image"),
  extractReceiptItems,
);
router.post(
  "/voice-sales-log",
  audioUpload.single("audio"),
  parseVoiceSalesLogIntent,
);

router.post("/chat", chatWithKudiBot);

export default router;
