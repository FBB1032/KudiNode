import { env } from "../config/env.js";
import { badRequest } from "../utils/AppError.js";

const GROQ_API_BASE = "https://api.groq.com/openai/v1";

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

/**
 * Call Groq API for JSON responses using chat completions
 */
async function callGroqJson({ prompt, systemPrompt = "You are a helpful AI assistant that returns valid JSON." }) {
  if (!env.groqApiKey) {
    throw badRequest(
      "AI features are temporarily unavailable. The GROQ_API_KEY environment variable is not configured on the backend server. Please get an API key from https://console.groq.com/keys",
    );
  }

  const url = `${GROQ_API_BASE}/chat/completions`;
  
  const body = {
    model: env.groqModel || "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.groqApiKey}`
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
    throw badRequest("Groq API returned invalid response format");
  }

  const outputText = data?.choices?.[0]?.message?.content || "";

  const parsed = tryParseJson(outputText);
  if (!parsed) {
    throw badRequest("Groq AI output could not be parsed as JSON");
  }

  return parsed;
}

/**
 * Transcribe audio using Groq's Whisper implementation
 */
async function transcribeWithGroqAudio(audioFile) {
  if (!env.groqApiKey) {
    throw badRequest("Audio transcription unavailable - GROQ_API_KEY not configured");
  }

  const url = `${GROQ_API_BASE}/audio/transcriptions`;
  
  const form = new FormData();
  form.append(
    "file",
    new Blob([audioFile.buffer], { type: audioFile.mimetype || "audio/webm" }),
    audioFile.originalname || "voice.webm",
  );
  form.append("model", "whisper-large-v3-turbo"); // Groq's fastest Whisper model
  form.append("response_format", "verbose_json");
  form.append("language", "en"); // Can detect multiple languages but defaults to English

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.groqApiKey}`
    },
    body: form,
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw badRequest(
      `Groq Whisper transcription failed (${response.status}): ${rawText.slice(0, 300)}`,
    );
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw badRequest("Groq Whisper returned non-JSON output");
  }

  const transcript = data?.text?.trim();
  if (!transcript) {
    throw badRequest("Groq Whisper did not return transcript text");
  }

  return {
    transcript,
    languageDetected: data?.language || null,
    provider: "groq-whisper",
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

  return transcribeWithGroqAudio(audioFile);
}

export async function parseVoiceTransfer({ transcript, audioFile }) {
  const transcriptResult = await getTranscript({ transcript, audioFile });

  const systemPrompt = "You are a Nigerian bank transfer command parser. Extract transfer details from natural speech and return valid JSON only.";
  
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

  const parsed = await callGroqJson({ prompt, systemPrompt });

  return {
    transcript: transcriptResult.transcript,
    parsed: {
      recipientName: parsed?.recipientName || null,
      bankName: parsed?.bankName || null,
      accountNumber: normalizeAccountNumber(parsed?.accountNumber),
      amount: asNumberOrNull(parsed?.amount),
      narration: parsed?.narration || null,
      languageDetected:
        parsed?.languageDetected || transcriptResult.languageDetected || null,
      confidence: asNumberOrNull(parsed?.confidence) ?? 0,
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

  // Note: Groq doesn't support vision models yet, so we'll use a text-based approach
  // For now, return a helpful error. You can integrate with another vision API like OpenAI GPT-4 Vision
  throw badRequest(
    "Receipt scanning with images requires a vision AI model. Groq currently only supports text and audio. " +
    "Please use Gemini API (GEMINI_API_KEY) for receipt scanning, or integrate OpenAI GPT-4 Vision."
  );
  
  // Alternative: If you want to keep receipt scanning, you need to either:
  // 1. Keep Gemini for vision tasks
  // 2. Use OpenAI GPT-4 Vision
  // 3. Use a separate OCR service + Groq for parsing
}

