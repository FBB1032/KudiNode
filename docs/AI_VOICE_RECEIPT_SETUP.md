# KudiNode AI Setup (Voice Transfer + Receipt Extraction)

This guide gives you a full implementation path for:

1. Voice transfer parsing that understands Nigerian languages (Hausa, Yoruba, Igbo, Pidgin, English).
2. Receipt image extraction into structured ledger items.

It is aligned with the code already added in this repo:

- Backend AI routes: `server/src/routes/aiRoutes.js`
- Backend AI controller: `server/src/controllers/aiController.js`
- Backend AI service: `server/src/services/aiService.js`
- Mobile service wrappers: `src/services/aiApi.ts`

---

## 1) Accounts to create

### Required account

1. Create a Google account (if you do not have one).
2. Go to Google AI Studio: https://aistudio.google.com
3. Create API key.
4. Save this key as `GEMINI_API_KEY`.

### Optional account (only if you do not want local transcription)

Not required with this repo setup. By default, backend can fall back to Gemini audio transcription.

### Optional local service (recommended for best multilingual speech quality)

Run your own faster-whisper HTTP service and provide `FAST_WHISPER_URL`.
No external API key is required for this mode.

---

## 2) API keys and environment variables

In `server/.env`, add the AI values:

```env
# Required for extraction (voice intent + receipt)
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.0-flash

# Optional: faster-whisper HTTP service
FAST_WHISPER_URL=http://127.0.0.1:8000
FAST_WHISPER_API_KEY=
FAST_WHISPER_LANGUAGE_HINT=
```

Notes:

- If `FAST_WHISPER_URL` is set, backend uses it first for transcription.
- If `FAST_WHISPER_URL` is empty, backend transcribes with Gemini audio directly.

---

## 3) Endpoints added

### 3.1 Voice transfer parse

- Method: `POST`
- Path: `/api/ai/voice-transfer`
- Auth: Bearer token required
- Input:
  - Either JSON body with `transcript`
  - Or multipart file in `audio`

Response shape:

```json
{
  "transcript": "send 25000 to Musa for rice supply...",
  "parsed": {
    "recipientName": "Musa",
    "bankName": "Wema Bank",
    "accountNumber": "0123456789",
    "amount": 25000,
    "narration": "rice supply",
    "languageDetected": "hausa",
    "confidence": 0.92
  },
  "meta": {
    "transcriptionProvider": "fast-whisper"
  }
}
```

### 3.2 Receipt extraction

- Method: `POST`
- Path: `/api/ai/receipt-extract`
- Auth: Bearer token required
- Input: multipart file in `image`

Response shape:

```json
{
  "parsed": {
    "merchantName": "Amina Foods",
    "date": "2026-07-29",
    "currency": "NGN",
    "items": [
      {
        "name": "Rice 10kg",
        "quantity": 2,
        "unitPrice": 11500,
        "lineTotal": 23000
      }
    ],
    "subtotal": 23000,
    "tax": null,
    "total": 23000,
    "confidence": 0.9
  }
}
```

---

## 4) How this works process-by-process

## Process A: Voice transfer

1. Mobile records voice audio.
2. Mobile sends file to `POST /api/ai/voice-transfer` as field `audio`.
3. Backend transcribes:
   - fast-whisper if configured, else Gemini audio transcription.
4. Backend sends transcript to Gemini with strict JSON parser prompt.
5. Backend normalizes amount/account number.
6. Mobile receives parsed fields and pre-fills transfer form.
7. User confirms in manual transfer review before transfer PIN.

Mapping to screens/services:

- Voice entry screen: `src/screens/VoiceTransferScreen.tsx`
- Transfer review screen: `src/screens/ManualTransferScreen.tsx`
- Mobile API wrappers: `src/services/aiApi.ts`

## Process B: Receipt extraction

1. Mobile captures receipt photo.
2. Mobile sends file to `POST /api/ai/receipt-extract` as field `image`.
3. Backend sends image to Gemini with strict ledger JSON prompt.
4. Backend returns parsed line items.
5. Mobile stores rows in local state/db and displays in ledger screen.

Mapping to screens/services:

- Capture flow: `src/screens/SalesIntakeScreen.tsx`
- Ledger display: `src/screens/LedgerScreen.tsx`
- Mobile API wrappers: `src/services/aiApi.ts`

---

## 5) Prompts already encoded in backend

The server prompts are in `server/src/services/aiService.js` and include:

1. Multilingual transcription prompt for Nigerian speech.
2. Voice transfer extraction prompt returning strict fields.
3. Receipt OCR extraction prompt returning strict line-item JSON.

You can tune those prompts in one place without changing mobile code.

---

## 6) Step-by-step runbook

1. Ensure your existing backend env (Supabase keys) is already set.
2. Add AI env vars from section 2 to `server/.env`.
3. Start backend:

```bash
cd server
npm install
npm run dev
```

4. Authenticate from mobile so you have a bearer token.
5. Call AI endpoints from mobile using wrappers in `src/services/aiApi.ts`:
   - `parseVoiceTransferFromAudio(audioUri)`
   - `parseVoiceTransferFromText(transcript)`
   - `extractReceiptFromImage(imageUri)`

6. Use returned `parsed` object to prefill transfer fields or ledger entries.

---

## 7) Manual API tests (quick verification)

Replace `TOKEN` and file paths.

### Voice (text transcript)

```bash
curl -X POST http://localhost:4000/api/ai/voice-transfer \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"transcript\":\"a tura dubu ashirin da biyar zuwa musa wema bank asusun 0123456789\"}"
```

### Voice (audio)

```bash
curl -X POST http://localhost:4000/api/ai/voice-transfer \
  -H "Authorization: Bearer TOKEN" \
  -F "audio=@C:/path/to/voice.m4a"
```

### Receipt image

```bash
curl -X POST http://localhost:4000/api/ai/receipt-extract \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@C:/path/to/receipt.jpg"
```

---

## 8) Production checklist

1. Keep all AI keys on backend only.
2. Enforce transfer confirmation screen before PIN.
3. Set a confidence threshold (for example `< 0.75`) to force manual edit.
4. Log parse failures and user corrections for prompt improvement.
5. Add request limits on AI routes if needed.
6. Add audit log entry for every AI-assisted transfer suggestion.

---

## 9) What to do next in UI

Current mobile screens still use simulated flow in places. To fully switch to live AI:

1. Replace mock parsed result in `VoiceTransferScreen` with `parseVoiceTransferFromAudio(...)` response.
2. After receipt capture in `SalesIntakeScreen`, call `extractReceiptFromImage(...)`.
3. Save parsed items into your ledger persistence layer.

This keeps your UX as-is while replacing mock AI with real backend AI outputs.
