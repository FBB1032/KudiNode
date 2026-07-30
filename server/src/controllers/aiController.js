import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest } from "../utils/AppError.js";
import {
  parseVoiceTransfer,
  extractReceipt,
  parseVoiceSalesLog,
  chatWithAssistant,
} from "../services/aiService.js";

export const parseVoiceTransferIntent = asyncHandler(async (req, res) => {
  const transcript = req.body?.transcript;
  const audioFile = req.file;

  if (!transcript && !audioFile) {
    throw badRequest(
      "Provide transcript text or an audio file in field 'audio'",
    );
  }

  const result = await parseVoiceTransfer({ transcript, audioFile });
  res.json(result);
});

export const extractReceiptItems = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw badRequest("Provide a receipt image in field 'image'");
  }

  const result = await extractReceipt({ imageFile: req.file });
  res.json(result);
});

export const parseVoiceSalesLogIntent = asyncHandler(async (req, res) => {
  const transcript = req.body?.transcript;
  const audioFile = req.file;

  if (!transcript && !audioFile) {
    throw badRequest(
      "Provide transcript text or an audio file in field 'audio'",
    );
  }

  const result = await parseVoiceSalesLog({ transcript, audioFile });
  res.json(result);
});

export const chatWithKudiBot = asyncHandler(async (req, res) => {
  const messages = req.body?.messages;
  const userName = req.body?.userName || req.user?.full_name || req.user?.name || null;

  if (!Array.isArray(messages)) {
    throw badRequest("Request body must include 'messages' array");
  }

  const result = await chatWithAssistant({ messages, userName });
  res.json(result);
});
