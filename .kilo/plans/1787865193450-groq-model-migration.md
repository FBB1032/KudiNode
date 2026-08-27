# Fix Groq "Voice Parse Failed" — migrate off deprecated `llama-3.3-70b-versatile`

## Problem
Initializing a voice transfer fails with:
```
Groq API request failed (404): {"error":{"message":"The model llama-3.3-70b-versatile does not exist or you do not have access to it.","type":"invalid_request_error","code":"model_not_found"}}
```

## Root cause
`llama-3.3-70b-versatile` was **deprecated on Groq on 08/16/2026** for free and
developer-tier usage (Groq deprecation page: recommended replacement is
`openai/gpt-oss-120b` or `qwen/qwen3.6-27b`). It is now Enterprise-only, so a
free/developer-tier API key gets `404 model_not_found`.

The model is referenced in multiple places, and the user's `server/.env` pins
the dead model ID.

## Decision
Use **`openai/gpt-oss-120b`** as the new default.

- Confirmed available on Groq's **Free plan** (rate-limits page lists it under
  "Free Plan Limits": 30 RPM / 8K TPM / 200K TPD).
- It is the **most effective** free-plan text model (flagship, ~500 tps,
  131k context, 81.3% avg MMMLU multilingual — best fit for mixed
  English/Pidgin/Hausa/Yoruba/Igbo parsing).
- It supports **JSON Object Mode**, which `callGroqJson` relies on
  (`response_format: { type: "json_object" }`).
- It is Groq's official drop-in replacement for the deprecated model.
- `qwen/qwen3.6-27b` is a cheaper/27B alternative; not chosen because 120B is
  higher quality and both are free-plan.

## Files & exact edits (all replace `llama-3.3-70b-versatile` → `openai/gpt-oss-120b`)

1. `server/.env` line 29 — user's live config (the direct cause of the 404):
   `GROQ_MODEL=openai/gpt-oss-120b`
2. `server/src/config/env.js` line 32 — code default:
   `groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",`
3. `server/src/services/aiService.js` line 92 — `callGroqJson` fallback:
   `model: env.groqModel || "openai/gpt-oss-120b",`
4. `server/src/services/aiService.js` line 395 — `callGroqChat` fallback:
   `model: env.groqModel || "openai/gpt-oss-120b",`
5. `server/.env.example` line 30 — `GROQ_MODEL=openai/gpt-oss-120b`
6. `README.md` line 155 — `GROQ_MODEL=openai/gpt-oss-120b`
7. `server/GROQ_SETUP.md` lines 20 and 40 — `GROQ_MODEL=openai/gpt-oss-120b`

## Scope notes
- Only the model string changes; request shape, prompt, and JSON parsing stay
  the same. Voice transfer, voice sales log, and KudiBot chat all read
  `env.groqModel`, so a single value fixes all three.
- No code-structure refactor or schema changes required.
- Whisper transcription models are unaffected.

## Validation
1. Restart the backend (`cd server && npm run dev` or equivalent per repo).
2. Initialize a voice transfer in the app; confirm no 404 and a parsed result.
3. Optionally test voice sales log and KudiBot chat to confirm they resolve.
4. Confirm `server/.env` change is not committed to git if `.env` is
   git-ignored (it is the standard convention here).

## Out of scope
- Adding structured-outputs / JSON Schema mode.
- Adding model fallback/retry logic or health checks.
- Any other provider changes.
