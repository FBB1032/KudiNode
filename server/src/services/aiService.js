import { env } from "../config/env.js";
import { badRequest } from "../utils/AppError.js";

const GROQ_API_BASE = "https://api.groq.com/openai/v1";
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

/**
 * Call Groq API for JSON responses using chat completions
 */
async function callGroqJson({ prompt, systemPrompt = "You are a helpful AI assistant that returns strict JSON." }) {
  if (!env.groqApiKey) {
    throw badRequest(
      "Missing GROQ_API_KEY on backend server. Add GROQ_API_KEY to server/.env first.",
    );
  }

  const url = `${GROQ_API_BASE}/chat/completions`;
  const body = {
    model: env.groqModel || "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.groqApiKey}`,
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw badRequest(
      `Groq API request failed (${response.status}): ${rawText.slice(0, 300)}`,
    );
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw badRequest("Groq API returned non-JSON output");
  }

  const outputText = data?.choices?.[0]?.message?.content || "";
  const parsed = tryParseJson(outputText);
  if (!parsed) {
    throw badRequest("Groq API output was not valid JSON");
  }

  return parsed;
}

/**
 * Call Gemini API for multimodal image & audio vision queries
 */
async function callGeminiJson({ prompt, inlineParts = [] }) {
  if (!env.geminiApiKey) {
    throw badRequest(
      "Missing GEMINI_API_KEY on backend server. Add GEMINI_API_KEY to server/.env first.",
    );
  }

  const url = `${GEMINI_API_BASE}/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }, ...inlineParts] }],
    generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw badRequest(`Gemini API request failed (${response.status}): ${rawText.slice(0, 300)}`);
  }

  const data = JSON.parse(rawText);
  const outputText =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text)
      .filter(Boolean)
      .join("\n") || "";

  const parsed = tryParseJson(outputText);
  if (!parsed) {
    throw badRequest("Gemini output was not valid JSON");
  }

  return parsed;
}

/**
 * Transcribe audio using Groq's whisper-large-v3-turbo endpoint
 */
async function transcribeWithGroqAudio(audioFile) {
  if (!env.groqApiKey) {
    throw badRequest(
      "Missing GROQ_API_KEY on backend server. Add GROQ_API_KEY to server/.env first.",
    );
  }

  const url = `${GROQ_API_BASE}/audio/transcriptions`;
  const form = new FormData();

  const fileBlob = new Blob([audioFile.buffer], {
    type: audioFile.mimetype || "audio/m4a",
  });

  form.append("file", fileBlob, audioFile.originalname || "voice.m4a");
  form.append("model", "whisper-large-v3-turbo");
  form.append("response_format", "json");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
    },
    body: form,
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw badRequest(
      `Groq Audio API request failed (${response.status}): ${rawText.slice(0, 300)}`,
    );
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw badRequest("Groq Audio API returned invalid JSON response");
  }

  const transcript = data?.text?.trim();
  if (!transcript) {
    throw badRequest("Groq could not transcribe the voice recording clearly");
  }

  return {
    transcript,
    languageDetected: "en",
    provider: "groq-whisper-v3",
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

  // Transcribe audio with Groq Whisper
  return transcribeWithGroqAudio(audioFile);
}

export async function parseVoiceTransfer({ transcript, audioFile }) {
  const transcriptResult = await getTranscript({ transcript, audioFile });

  const prompt = [
    "Input can be English, Pidgin, Hausa, Yoruba, Igbo, or mixed speech.",
    "Extract transfer details and return strict JSON only.",
    "Do not invent values. Use null when unknown.",
    "Return this exact structure:",
    "{",
    '  "recipientName": string | null,',
    '  "bankName": string | null,',
    '  "accountNumber": string | null,',
    '  "amount": number | null,',
    '  "narration": string | null,',
    '  "languageDetected": string | null,',
    '  "confidence": number (between 0 and 1)',
    "}",
    "",
    "Transcript:",
    transcriptResult.transcript,
  ].join("\n");

  const parsed = await callGroqJson({
    prompt,
    systemPrompt: "You are a Nigerian bank transfer command parser. Return strict JSON only.",
  });

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

  throw badRequest(
    "Receipt scanning with images requires a vision AI model. Groq currently only supports text and audio. " +
    "Please use Gemini API (GEMINI_API_KEY) for receipt scanning, or integrate OpenAI GPT-4 Vision."
  );
}

export async function getAiAdvisorAdvice({ prompt, language = "English" }) {
  const systemPrompt = [
    "You are KudiBot, an AI financial advisor for Nigerian informal-sector merchants.",
    "Give concise, practical financial advice tailored to Nigerian business owners.",
    "Mention credit score tips, Esusu cooperative savings, stock reinvestment, and Wema Bank settlement details.",
    `Respond in ${language}. Use clear, encouraging advice.`,
  ].join("\n");

  const groqResult = await callGroqJson({ prompt, systemPrompt });
  return (
    groqResult?.advice ||
    groqResult?.answer ||
    groqResult?.response ||
    "Based on your 91 Trust Score and sales volume, keeping your Wema settlement account active guarantees automatic credit upgrades."
  );
}
