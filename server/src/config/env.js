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

  kycBucket: process.env.KYC_BUCKET || "kyc-documents",
  ledgerBucket: process.env.LEDGER_BUCKET || "ledger-images",

  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",

  openrouterApiKey: process.env.OPENROUTER_API_KEY || "",
  openrouterVisionModel:
    process.env.OPENROUTER_VISION_MODEL || "qwen/qwen-2.5-vl-7b-instruct:free",

  fastWhisperUrl: process.env.FAST_WHISPER_URL || "",
  fastWhisperApiKey: process.env.FAST_WHISPER_API_KEY || "",
  fastWhisperLanguageHint: process.env.FAST_WHISPER_LANGUAGE_HINT || "",
};
