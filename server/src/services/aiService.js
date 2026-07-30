import { env } from "../config/env.js";
import { badRequest } from "../utils/AppError.js";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function asNumberOrNull(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const cleaned = String(value).replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeAccountNumber(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, "");
  return digits || null;
}

function tryParseJson(text) {
  if (!text) return null;
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // Fall through.
  }

  const fenced =
    trimmed.match(/```json\s*([\s\S]*?)```/i) ||
    trimmed.match(/```\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // Fall through.
    }
  }

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    const candidate = trimmed.slice(first, last + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  return null;
}

function normalizeAudioMimeType(mimetype, filename) {
  const mime = (mimetype || "").toLowerCase();
  const name = (filename || "").toLowerCase();

  if (name.endsWith(".m4a") || mime.includes("m4a") || mime.includes("mp4")) return "audio/mp4";
  if (name.endsWith(".wav") || mime.includes("wav")) return "audio/wav";
  if (name.endsWith(".mp3") || mime.includes("mpeg") || mime.includes("mp3")) return "audio/mp3";
  if (name.endsWith(".aac") || mime.includes("aac")) return "audio/aac";
  if (name.endsWith(".3gp") || mime.includes("3gpp")) return "audio/3gpp";
  if (name.endsWith(".webm") || mime.includes("webm")) return "audio/webm";
  if (mime.startsWith("audio/")) return mime;
  return "audio/mp4";
}

function normalizeImageMimeType(mimetype, filename) {
  const mime = (mimetype || "").toLowerCase();
  const name = (filename || "").toLowerCase();

  if (name.endsWith(".png") || mime.includes("png")) return "image/png";
  if (name.endsWith(".webp") || mime.includes("webp")) return "image/webp";
  if (mime.startsWith("image/")) return mime;
  return "image/jpeg";
}

async function callGeminiJson({ prompt, inlineParts = [] }) {
  if (!env.geminiApiKey) {
    throw badRequest(
      "AI features are temporarily unavailable. The GEMINI_API_KEY environment variable is not configured on the backend server.",
    );
  }

  const candidateModels = Array.from(
    new Set([
      env.geminiModel,
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-pro",
    ]),
  ).filter(Boolean);

  let lastError = null;

  for (const modelName of candidateModels) {
    const url = `${GEMINI_API_BASE}/models/${modelName}:generateContent?key=${env.geminiApiKey}`;

    // Try first with responseMimeType, then without if Gemini rejects it
    const configVariations = [
      { temperature: 0.1, responseMimeType: "application/json" },
      { temperature: 0.1 },
    ];

    for (const genConfig of configVariations) {
      const body = {
        contents: [
          {
            parts: [{ text: prompt }, ...inlineParts],
          },
        ],
        generationConfig: genConfig,
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const rawText = await response.text();
        if (!response.ok) {
          if (
            response.status === 404 &&
            candidateModels.indexOf(modelName) < candidateModels.length - 1
          ) {
            break; // Try next model
          }
          throw new Error(
            `Gemini API (${modelName}) HTTP ${response.status}: ${rawText.slice(0, 200)}`,
          );
        }

        let data;
        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error("Gemini API returned non-JSON HTTP response");
        }

        const outputText =
          data?.candidates?.[0]?.content?.parts
            ?.map((p) => p?.text)
            .filter(Boolean)
            .join("\n") || "";

        const parsed = tryParseJson(outputText);
        if (parsed) {
          return parsed;
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  throw badRequest(
    lastError
      ? lastError.message
      : "Gemini API request failed across all candidate models",
  );
}

async function transcribeWithGeminiAudio(audioFile) {
  const mimeType = normalizeAudioMimeType(
    audioFile.mimetype,
    audioFile.originalname,
  );

  const prompt = [
    "Transcribe this audio from Nigerian speech into plain text.",
    "The speaker may use English, Pidgin, Hausa, Yoruba, Igbo, or mixed code-switching.",
    "Return strict JSON only:",
    "{",
    '  "transcript": string,',
    '  "languageDetected": string | null',
    "}",
  ].join("\n");

  const data = await callGeminiJson({
    prompt,
    inlineParts: [
      {
        inline_data: {
          mime_type: mimeType,
          data: audioFile.buffer.toString("base64"),
        },
      },
    ],
  });

  const transcript = data?.transcript?.trim?.();
  if (!transcript) {
    throw badRequest("Gemini could not transcribe the audio clearly");
  }

  return {
    transcript,
    languageDetected: data?.languageDetected || null,
    provider: "gemini-audio",
  };
}

async function getTranscript({ transcript, audioFile }) {
  if (transcript?.trim()) {
    return {
      transcript: transcript.trim(),
      languageDetected: null,
      provider: "client-text",
    };
  }

  if (!audioFile) {
    throw badRequest("Provide either transcript text or an audio file");
  }

  // Audio is transcribed directly with Gemini AI
  return transcribeWithGeminiAudio(audioFile);
}

export async function parseVoiceTransfer({ transcript, audioFile }) {
  let transcriptResult = {
    transcript: "",
    languageDetected: "en",
    provider: "fallback",
  };

  try {
    transcriptResult = await getTranscript({ transcript, audioFile });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[aiService] Audio transcription error:", err?.message || err);
    transcriptResult = {
      transcript: transcript || "Voice input received",
      languageDetected: "en",
      provider: "fallback",
    };
  }

  const prompt = [
    "You are a Nigerian bank transfer command parser.",
    "Input can be English, Pidgin, Hausa, Yoruba, Igbo, or mixed speech.",
    "Extract transfer details and return strict JSON only.",
    "Do not invent values. Use null when unknown.",
    "Return:",
    "{",
    '  "recipientName": string | null,',
    '  "bankName": string | null,',
    '  "accountNumber": string | null,',
    '  "amount": number | null,',
    '  "narration": string | null,',
    '  "languageDetected": string | null,',
    '  "confidence": number',
    "}",
    "",
    "Transcript:",
    transcriptResult.transcript,
  ].join("\n");

  let parsed = null;
  try {
    parsed = await callGeminiJson({ prompt });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[aiService] Gemini JSON parse error:", err?.message || err);
  }

  return {
    transcript: transcriptResult.transcript,
    parsed: {
      recipientName: parsed?.recipientName || null,
      bankName: parsed?.bankName || null,
      accountNumber: normalizeAccountNumber(parsed?.accountNumber),
      amount: asNumberOrNull(parsed?.amount),
      narration: parsed?.narration || null,
      languageDetected:
        parsed?.languageDetected || transcriptResult.languageDetected || "en",
      confidence: asNumberOrNull(parsed?.confidence) ?? 0.8,
    },
    meta: {
      transcriptionProvider: transcriptResult.provider,
    },
  };
}

export async function extractReceipt({ imageFile }) {
  if (!imageFile) {
    throw badRequest("No receipt image provided");
  }

  const mimeType = normalizeImageMimeType(
    imageFile.mimetype,
    imageFile.originalname,
  );

  const prompt = [
    "You are a receipt extraction engine for Nigerian merchant ledgers.",
    "Read the image and return strict JSON only.",
    "Do not invent unreadable values. Use null when uncertain.",
    "Return:",
    "{",
    '  "merchantName": string | null,',
    '  "date": string | null,',
    '  "currency": "NGN",',
    '  "items": [',
    "    {",
    '      "name": string,',
    '      "quantity": number | null,',
    '      "unitPrice": number | null,',
    '      "lineTotal": number | null',
    "    }",
    "  ],",
    '  "subtotal": number | null,',
    '  "tax": number | null,',
    '  "total": number | null,',
    '  "confidence": number',
    "}",
  ].join("\n");

  let parsed = null;
  try {
    parsed = await callGeminiJson({
      prompt,
      inlineParts: [
        {
          inline_data: {
            mime_type: mimeType,
            data: imageFile.buffer.toString("base64"),
          },
        },
      ],
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[aiService] Gemini Receipt scan error:", err?.message || err);
  }

  const items = Array.isArray(parsed?.items) ? parsed.items : [];

  return {
    parsed: {
      merchantName: parsed?.merchantName || null,
      date: parsed?.date || null,
      currency: "NGN",
      items: items
        .map((it) => ({
          name: String(it?.name || "").trim(),
          quantity: asNumberOrNull(it?.quantity),
          unitPrice: asNumberOrNull(it?.unitPrice),
          lineTotal: asNumberOrNull(it?.lineTotal),
        }))
        .filter((it) => it.name.length > 0),
      subtotal: asNumberOrNull(parsed?.subtotal),
      tax: asNumberOrNull(parsed?.tax),
      total: asNumberOrNull(parsed?.total),
      confidence: asNumberOrNull(parsed?.confidence) ?? 0,
    },
  };
}
