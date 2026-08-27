# Fix Receipt Scanner — invalid Gemini API key

## Root cause

The deployed backend at `kudinode.onrender.com` has a `GEMINI_API_KEY` with the
`AQ.` prefix (`AQ.Ab8RN6...`), which is the **Android SDK / Google AI Edge**
key format — not valid for the Gemini **REST** API (standard REST keys start
with `AIza`). Each receipt scan:

1. `POST /api/ai/receipt-extract` → multer (15 MB limit) → `extractReceipt`
2. `callGeminiJson` → `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AQ...`
3. Gemini responds **400** (`API_KEY_INVALID` or "API key not valid")
4. Backend wraps it as `400` → app shows generic "Scan Failed"

**Evidence from Render logs:**
`POST /api/ai/receipt-extract 400 798.376 ms - 360`
- 798 ms → real Gemini round trip (not sub-10ms validation/multer error)
- 360-byte body → wrapped Gemini error (plain validation errors are ~50-60 bytes)
- The error handler (`errorHandler.js:22`) only logs 500s, so the Gemini body is
  not visible in logs — only in the HTTP response.

## Scope

- **Only** the `GEMINI_API_KEY` env var in production (Render) and local
  (`server/.env`) needs to change.
- No code changes needed — the model, prompt, JSON mode, and image handling are
  correct.
- The Groq model migration (`openai/gpt-oss-120b`) is a separate concern and
  still valid.

## Tasks

### 1. Generate a new Gemini API key

1. Go to https://aistudio.google.com/apikey
2. Sign in with the same Google account
3. Click **Create API Key** → choose a project or create one
4. Copy the new key (starts with `AIza...`)

### 2. Update production (Render) env var

1. Go to https://dashboard.render.com → your KudiNode backend service
2. **Environment** → **Secret Files** → edit `GEMINI_API_KEY`
3. Replace the `AQ.`-prefixed value with the new `AIza...` key
4. **Save changes** → Render will automatically redeploy

### 3. Update local dev env var

1. Edit `server/.env` line 24:
   ```
   GEMINI_API_KEY=AIza...   # new key from step 1
   ```
2. (`.env` is git-ignored, so no commit risk)

### 4. Restart local backend

```bash
cd server
npm run dev
```

(or restart the existing `bgp_04519e17f001N0VSIHyNbT5LZE` process)

## Validation

1. **In the app:** Go to Home → Record Sale → Scan Receipt → take a photo
   - Expected: parses successfully, navigates to Verification screen
   - If still failing, check the exact error in the app's alert or the backend
     log (localhost) / Render logs

2. **Optional direct check (read-only):** Visit in a browser (substitute the new
   key):
   ```
   https://generativelanguage.googleapis.com/v1beta/models?key=AIza...
   ```
   Should return a JSON list of models, not a 400 error.

## Out of scope

- No code structure changes, no prompt changes, no model changes.
- The `AQ.`-prefixed key is not deleted — only replaced. The old key can be
   revoked from Google AI Studio if desired.