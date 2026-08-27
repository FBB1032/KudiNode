# Replace Gemini Receipt Scanning with OpenRouter (free vision)

## Goal

Remove the Gemini dependency from **receipt scanning only** and use a free
OpenRouter vision model instead. The `AQ.`-prefixed Gemini key is invalid for
the REST API (root cause of "Scan Failed"), and the user does not want to use
Gemini again for scans.

- Scope: **receipt scanning only** (`extractReceipt`). Gemini remains a
  last-resort fallback for chat/audio (those already prefer Groq), which is out
  of scope.
- No client API contract change: `extractReceiptFromImage` already posts the
  image and the `parsed` shape is provider-agnostic.

## Provider choice

**OpenRouter** free vision model (user-selected):
- Base URL: `https://openrouter.ai/api/v1` (OpenAI-compatible `/chat/completions`)
- Model (configurable via env): `qwen/qwen-2.5-vl-7b-instruct:free`
  (fallback candidates if it is removed/paid at implementation time:
  `google/gemma-3-27b-it:free`, `meta-llama/llama-3.2-11b-vision-instruct:free`)
- Free tier: ~50 req/day — fine for dev/light use; note as a limitation.
- Key from https://openrouter.ai/keys (free). Free models require enabling
  "free models" in the OpenRouter console.

## Backend changes (`server/`)

### 1. `src/config/env.js`
Add (keep existing Gemini config for chat/audio fallbacks):
```js
openrouterApiKey: process.env.OPENROUTER_API_KEY || "",
openrouterVisionModel:
  process.env.OPENROUTER_VISION_MODEL || "qwen/qwen-2.5-vl-7b-instruct:free",
```

### 2. `src/services/aiService.js`
- Add `const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";`
- Add a new `callVisionJson({ prompt, systemPrompt, image })` that:
  - throws `badRequest("Missing OPENROUTER_API_KEY ...")` if `!env.openrouterApiKey`;
  - `POST ${OPENROUTER_API_BASE}/chat/completions` with
    `Authorization: Bearer ${env.openrouterApiKey}`,
    `Content-Type: application/json`,
    `HTTP-Referer: https://kudinode.onrender.com`,
    `X-Title: KudiNode`;
  - body:
    ```json
    {
      "model": env.openrouterVisionModel,
      "messages": [
        { "role": "system", "content": systemPrompt },
        { "role": "user", "content": [
          { "type": "text", "text": prompt },
          { "type": "image_url", "image_url": {
              "url": "data:<mime>;base64,<base64>"
          } }
        ] }
      ],
      "temperature": 0.1
    }
    ```
  - **Do NOT send `response_format`** — some free vision models reject it; the
    existing `tryParseJson` already strips fences/braces reliably.
  - on non-OK: `throw badRequest("OpenRouter API request failed (status): body.slice(0,300)")`;
  - parse `data.choices[0].message.content` via `tryParseJson`, else
    `throw badRequest("OpenRouter output was not valid JSON")`.
- In `extractReceipt` (currently line 637): replace the `callGeminiJson` call
  with `callVisionJson({ prompt, systemPrompt, image: { mimeType: mime, base64: imageFile.buffer.toString("base64") } })`.
  Remove the now-unused `inlineParts`. Everything after the call (normalization +
  returned `parsed`) stays identical.

### 3. Env files
- `server/.env`: add
  ```
  OPENROUTER_API_KEY=
  OPENROUTER_VISION_MODEL=qwen/qwen-2.5-vl-7b-instruct:free
  ```
- `server/.env.example`: add the same two lines; update the Gemini comment so it
  no longer claims receipt scanning requires Gemini.

### 4. Docs
- `server/GROQ_SETUP.md`: update the "Receipt Scanning" rows/notes to say
  OpenRouter free vision is now used instead of Gemini.

## Client change (`src/`)

### 5. `src/screens/SalesIntakeScreen.tsx` (lines 165-166)
The unavailable-branch currently matches `"GEMINI_API_KEY"`. Update it to
`"OPENROUTER_API_KEY"` (keeps the "AI Service Unavailable" alert for the
missing-key case). No API call changes needed — `src/services/aiApi.ts` is
already correct.

## Deployment (manual, user)

### 6. Render dashboard
- https://dashboard.render.com → KudiNode backend → Environment → add
  `OPENROUTER_API_KEY` (and optionally `OPENROUTER_VISION_MODEL`). Save → auto-redeploy.
- Get the key at https://openrouter.ai/keys (enable free models).

## Validation

1. **Runtime model check** (read-only, browser or curl): `GET https://openrouter.ai/api/v1/models` with the key → confirm the chosen `:free` vision model is listed. If it was removed/paid, swap `OPENROUTER_VISION_MODEL` to a listed free vision model.
2. **Local test**: set `OPENROUTER_API_KEY` in `server/.env`, `npm run dev`, then
   `POST /api/ai/receipt-extract` (multipart `image`) with a sample receipt →
   expect `{ parsed: { items, total, ... } }`, status 200.
3. **In app**: Home → Record Sale → Scan Receipt → photo → expect navigation to
   the Verification screen with parsed items.

## Risks / notes

- OpenRouter free-tier rate limit (~50 req/day) and free model roster change
  over time; the model is env-configurable to recover quickly.
- Free 7B vision models have lower handwriting accuracy than Gemini 2.0 Flash.
  The verbose handwriting prompt stays unchanged to mitigate this.
- The stale `GEMINI_API_KEY` stays in `server/.env` (needed for chat/audio
  fallbacks); it is no longer used by the receipt path.

## Out of scope

- Removing Gemini from chat/audio paths (they already prefer Groq/fast-whisper).
- Changing the prompt, JSON schema, or client request contract.
- Committing `.env` (git-ignored).
