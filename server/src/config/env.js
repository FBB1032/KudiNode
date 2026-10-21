import dotenv from "dotenv";

dotenv.config();

/**
 * Centralised, validated environment configuration.
 * Fails fast on boot if a required secret is missing.
 */
function required(name) {
  const value = process.env[name];
  if (!value) {
    // eslint-disable-next-line no-console
    console.error(`[config] Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  supabaseUrl: required("SUPABASE_URL"),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),

  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  groqWhisperModel: process.env.GROQ_WHISPER_MODEL || "whisper-large-v3-turbo",

  kycBucket: process.env.KYC_BUCKET || "kyc-documents",
  ledgerBucket: process.env.LEDGER_BUCKET || "ledger-images",

  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",

  openrouterApiKey: process.env.OPENROUTER_API_KEY || "",
  // OpenRouter retires free models (or moves them to paid) without notice,
  // which breaks receipt scanning. Keep a short list of known-good free vision
  // models so the scan path can fail over instead of dying on a stale slug.
  openrouterVisionModel:
    process.env.OPENROUTER_VISION_MODEL || "minimax/minimax-m3.1-flash:free",
  openrouterVisionFallbackModels: (
    process.env.OPENROUTER_VISION_FALLBACK_MODELS ||
    "nvidia/nemotron-3.5-super-vl:free,google/gemma-4-31b-it:free"
  )
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean),

  fastWhisperUrl: process.env.FAST_WHISPER_URL || "",
  fastWhisperApiKey: process.env.FAST_WHISPER_API_KEY || "",
  fastWhisperLanguageHint: process.env.FAST_WHISPER_LANGUAGE_HINT || "",
};
