# Test AI Voice Transfer Endpoint

## Quick Test

Run this command to test if AI is working:

```bash
curl -X POST http://localhost:4000/api/ai/voice-transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "transcript": "Send five thousand naira to John Doe at Access Bank account number 1234567890"
  }'
```

## Expected Response (Success):

```json
{
  "transcript": "Send five thousand naira to John Doe at Access Bank account number 1234567890",
  "parsed": {
    "recipientName": "John Doe",
    "bankName": "Access Bank",
    "accountNumber": "1234567890",
    "amount": 5000,
    "narration": null,
    "languageDetected": "en",
    "confidence": 0.95
  },
  "meta": {
    "transcriptionProvider": "client-text"
  }
}
```

## Common Errors:

### 1. Invalid API Key
```json
{
  "error": {
    "message": "AI features are temporarily unavailable. The GEMINI_API_KEY environment variable is not configured..."
  }
}
```

**Fix:** Get valid API key from https://aistudio.google.com/app/apikey

### 2. API Request Failed (400/403)
```json
{
  "error": {
    "message": "AI service request failed (403): API key not valid..."
  }
}
```

**Fix:** Your GEMINI_API_KEY is invalid or expired. Get a new one.

### 3. Rate Limit
```json
{
  "error": {
    "message": "AI service request failed (429): Resource exhausted"
  }
}
```

**Fix:** You've hit Gemini API rate limits. Wait or upgrade your quota.

## Getting a Valid Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with something like `AIzaSy...`)
5. Add to `server/.env`:
   ```
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   ```
6. Restart server

## Your Current Key Format

Your key looks like: `AQ.Ab8RN6IMnLyEBdCzuLyhFu0m-3ShWsUmsg2idHjdGc5V8K4cwQ`

**This doesn't look like a standard Gemini API key.**

Valid Gemini keys usually look like: `AIzaSyC4XTz...` (39 characters)

Your key format looks more like an internal token or different service.

## Check Backend Logs

When you try voice transfer, check the terminal where your backend is running. You should see error details like:

```
Gemini API request failed (403): {
  "error": {
    "code": 403,
    "message": "API key not valid. Please pass a valid API key.",
    "status": "PERMISSION_DENIED"
  }
}
```

This will tell you the exact problem!
