import { env } from "../config/env.js";
import { badRequest } from "../utils/AppError.js";

const GROQ_API_BASE = "https://api.groq.com/openai/v1";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

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
  if (name.endsWith(".jpg") || name.endsWith(".jpeg") || mime.includes("jpeg")) return "image/jpeg";
  if (mime.startsWith("image/")) return mime;
  return "image/jpeg";
}

async function callGroqJson({ prompt, systemPrompt = "You are a helpful AI assistant that returns valid JSON." }) {
  if (!env.groqApiKey) {
    throw badRequest(
      "Missing GROQ_API_KEY on backend. Add it to server/.env first.",
    );
  }

  const url = `${GROQ_API_BASE}/chat/completions`;

  const body = {
    model: env.groqModel || "openai/gpt-oss-120b",
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

  const outputText = data?.choices?.[0]?.message?.content?.trim?.() || "";
  const parsed = tryParseJson(outputText);
  if (!parsed) {
    throw badRequest("Groq output was not valid JSON");
  }

  return parsed;
}

async function callGeminiJson({ prompt, systemPrompt = "You are a helpful AI assistant that returns valid JSON.", inlineParts = [] }) {
  if (!env.geminiApiKey) {
    throw badRequest(
      "Missing GEMINI_API_KEY on backend. Add it to server/.env first (required for receipt image scanning).",
    );
  }

  const model = env.geminiModel || "gemini-2.0-flash";
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${env.geminiApiKey}`;

  const systemInstructionParts = systemPrompt
    ? [{ text: systemPrompt }]
    : undefined;

  const body = {
    ...(systemInstructionParts && { systemInstruction: { parts: systemInstructionParts } }),
    contents: [
      {
        parts: [{ text: prompt }, ...inlineParts],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw badRequest(
      `Gemini API request failed (${response.status}): ${rawText.slice(0, 300)}`,
    );
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw badRequest("Gemini API returned non-JSON output");
  }

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

async function callVisionJson({ prompt, systemPrompt, image }) {
  if (!env.openrouterApiKey) {
    throw badRequest(
      "Missing OPENROUTER_API_KEY on backend. Add it to server/.env first.",
    );
  }

  if (!image?.base64) {
    throw badRequest("No image data provided for vision analysis");
  }

  const url = `${OPENROUTER_API_BASE}/chat/completions`;

  const body = {
    model: env.openrouterVisionModel,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${image.mimeType || "image/jpeg"};base64,${image.base64}`,
            },
          },
        ],
      },
    ],
    temperature: 0.1,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openrouterApiKey}`,
      "HTTP-Referer": "https://kudinode.onrender.com",
      "X-Title": "KudiNode",
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw badRequest(
      `OpenRouter API request failed (${response.status}): ${rawText.slice(0, 300)}`,
    );
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw badRequest("OpenRouter API returned non-JSON output");
  }

  const outputText = data?.choices?.[0]?.message?.content?.trim?.() || "";
  const parsed = tryParseJson(outputText);
  if (!parsed) {
    throw badRequest("OpenRouter output was not valid JSON");
  }

  return parsed;
}

async function transcribeWithGroqWhisper(audioFile) {
  if (!env.groqApiKey) return null;

  const url = `${GROQ_API_BASE}/audio/transcriptions`;
  const form = new FormData();

  const mime = normalizeAudioMimeType(audioFile.mimetype, audioFile.originalname);
  const fileName = audioFile.originalname || `audio.${mime.split("/")[1] || "webm"}`;

  form.append(
    "file",
    new Blob([audioFile.buffer], { type: mime }),
    fileName,
  );
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
    return null;
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    return null;
  }

  const transcript = data?.text?.trim();
  if (!transcript) return null;

  return {
    transcript,
    languageDetected: data?.language || null,
    provider: "groq-whisper",
  };
}

async function transcribeWithFastWhisper(audioFile) {
  if (!env.fastWhisperUrl) return null;

  const url = `${env.fastWhisperUrl.replace(/\/$/, "")}/transcribe`;
  const form = new FormData();
  form.append(
    "file",
    new Blob([audioFile.buffer], { type: audioFile.mimetype || "audio/webm" }),
    audioFile.originalname || "voice.webm",
  );

  if (env.fastWhisperLanguageHint) {
    form.append("language_hint", env.fastWhisperLanguageHint);
  }

  const headers = {};
  if (env.fastWhisperApiKey) {
    headers.Authorization = `Bearer ${env.fastWhisperApiKey}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: form,
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw badRequest(
      `Whisper endpoint failed (${response.status}): ${rawText.slice(0, 300)}`,
    );
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw badRequest("Whisper endpoint returned non-JSON output");
  }

  const transcript = data?.text?.trim();
  if (!transcript) {
    throw badRequest("Whisper endpoint did not return transcript text");
  }

  return {
    transcript,
    languageDetected: data?.language || null,
    provider: "fast-whisper",
  };
}

async function transcribeWithGeminiAudio(audioFile) {
  if (!env.geminiApiKey) return null;

  const prompt = [
    "Transcribe this audio from Nigerian speech into plain text.",
    "The speaker may use English, Pidgin, Hausa, Yoruba, Igbo, or mixed code-switching.",
    "Return strict JSON only:",
    "{",
    '  "transcript": string,',
    '  "languageDetected": string | null',
    "}",
  ].join("\n");

  try {
    const mime = normalizeAudioMimeType(audioFile.mimetype, audioFile.originalname);
    const data = await callGeminiJson({
      prompt,
      inlineParts: [
        {
          inline_data: {
            mime_type: mime,
            data: audioFile.buffer.toString("base64"),
          },
        },
      ],
    });

    const transcript = data?.transcript?.trim?.();
    if (!transcript) return null;

    return {
      transcript,
      languageDetected: data?.languageDetected || null,
      provider: "gemini-audio",
    };
  } catch {
    return null;
  }
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

  const fastWhisperResult = await transcribeWithFastWhisper(audioFile);
  if (fastWhisperResult) return fastWhisperResult;

  const groqWhisperResult = await transcribeWithGroqWhisper(audioFile);
  if (groqWhisperResult) return groqWhisperResult;

  const geminiResult = await transcribeWithGeminiAudio(audioFile);
  if (geminiResult) return geminiResult;

  throw badRequest(
    "All audio transcription providers failed. Please try again with a clearer recording or enter text manually.",
  );
}

function getAiJsonProvider() {
  if (env.groqApiKey) return "groq";
  if (env.geminiApiKey) return "gemini";
  return null;
}

async function callBestAiJson({ prompt, systemPrompt }) {
  const provider = getAiJsonProvider();
  if (!provider) {
    throw badRequest(
      "No AI API key configured. Add either GROQ_API_KEY or GEMINI_API_KEY to server/.env.",
    );
  }

  if (provider === "groq") {
    return callGroqJson({ prompt, systemPrompt });
  }
  return callGeminiJson({ prompt, systemPrompt });
}

async function callGroqChat({ messages, systemPrompt }) {
  if (!env.groqApiKey) return null;

  const url = `${GROQ_API_BASE}/chat/completions`;
  const finalMessages = [];

  if (systemPrompt) {
    finalMessages.push({ role: "system", content: systemPrompt });
  }

  for (const m of messages) {
    finalMessages.push({ role: m.role, content: m.content });
  }

  const body = {
    model: env.groqModel || "openai/gpt-oss-120b",
    messages: finalMessages,
    temperature: 0.6,
    max_tokens: 1024,
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
  if (!response.ok) return null;

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    return null;
  }

  const content = data?.choices?.[0]?.message?.content?.trim?.();
  if (!content) return null;

  return {
    content, provider: "groq" };
}

async function callGeminiChat({ messages, systemPrompt }) {
  if (!env.geminiApiKey) return null;

  const model = env.geminiModel || "gemini-2.0-flash";
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${env.geminiApiKey}`;

  const systemInstructionParts = systemPrompt
    ? [{ text: systemPrompt }]
    : undefined;

  const contents = [];
  for (const m of messages) {
    const role = m.role === "assistant" ? "model" : "user";
    contents.push({
      role,
      parts: [{ text: String(m.content || "") }],
    });
  }

  const body = {
    ...(systemInstructionParts && { systemInstruction: { parts: systemInstructionParts } }),
    contents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  if (!response.ok) return null;

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    return null;
  }

  const content =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text)
      .filter(Boolean)
      .join("\n")
      ?.trim?.();

  if (!content) return null;

  return {
    content, provider: "gemini" };
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

  const parsed = await callBestAiJson({
    prompt,
    systemPrompt: "You are a Nigerian fintech AI that parses voice transfer commands. You understand English, Pidgin, Hausa, Yoruba, and Igbo.",
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

const KUDIBOT_SYSTEM_PROMPT = [
  "You are KudiBot, the AI Financial Advisor for KudiNode — a Nigerian fintech for market traders, small business merchants, and Esusu/cooperative societies.",
  "You are warm, conversational, and familiar with Nigerian market context.",
  "You understand and can respond in: English, Nigerian Pidgin, Hausa, Yoruba, and Igbo (including code-switching). Respond in the same language the user wrote to you, or English if unclear.",
  "You advise on:",
  "  - Daily sales log, profit margins, and stock reinvestment",
  "  - Wema Bank credit line, micro-credit eligibility, and repayment strategy",
  "  - AI Trust Score improvements and KudiNode usage tips",
  "  - Esusu / Co-op cooperative contributions, rotation cycles, and payout planning",
  "  - Receipt scanning and voice commands ('Record rice sale' etc.)",
  "You can reference Naira amounts, Alaba / Oshodi / Kano markets context, and practical merchant habits.",
  "Keep answers concise, practical, and encouraging. Use bullet points when listing steps. Never invent exact sales or credit data you do not have — if the user asks about their specific numbers, acknowledge you're analyzing based on typical patterns, and recommend they check their dashboard.",
  "Use 💡, 📈, 💰, 👥, 🛒, 🗣️, 📄 emojis where appropriate to keep it friendly, but do not overdo it.",
].join("\n");

export async function chatWithAssistant({ messages, userName }) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw badRequest("Provide a non-empty conversation messages array");
  }

  const safeMessages = messages
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).trim(),
    }))
    .slice(-20);

  if (safeMessages.length === 0) {
    throw badRequest("Conversation contains no valid text messages");
  }

  const systemPrompt = userName
    ? `${KUDIBOT_SYSTEM_PROMPT}\n\nThe user you are speaking to is: ${userName}. Address them naturally when appropriate.`
    : KUDIBOT_SYSTEM_PROMPT;

  const groqResult = await callGroqChat({ messages: safeMessages, systemPrompt });
  if (groqResult) return groqResult;

  const geminiResult = await callGeminiChat({ messages: safeMessages, systemPrompt });
  if (geminiResult) return geminiResult;

  throw badRequest(
    "All AI chat providers failed. Ensure either GROQ_API_KEY or GEMINI_API_KEY is configured in server/.env.",
  );
}

export async function extractReceipt({ imageFile }) {
  if (!imageFile) {
    throw badRequest("No receipt image provided");
  }

  const mime = normalizeImageMimeType(imageFile.mimetype, imageFile.originalname);
  const systemPrompt = [
    "You are an elite AI receipt scanner for Nigerian small merchants, market traders, and POS terminals.",
    "You read receipt images of ALL TYPES including:",
    "  • Printed POS / supermarket / pharmacy receipts (Interswitch, Paystack, eTranzact, bank POS)",
    "  • HANDWRITTEN paper receipts (exercise book paper, plain paper, tissue, card slips)",
    "  • Scribbled notes and tallys on any paper surface",
    "  • Customer invoices, waybills, 'received by' slips, credit notes",
    "  • Mixed printed + handwritten receipts (very common in Nigeria)",
    "Handwriting is usually in Biro / ballpoint pen. Can be cursive, all caps, or shorthand. Expect spelling variations and shortened words.",
    "Currency is always Nigerian Naira (NGN). Expect: N, ₦, #, NGN, 'naira' written by hand, or no symbol but context implies Naira.",
    "Return strict JSON only — no prose, no markdown, no apology messages when data is partial.",
  ].join("\n");

  const prompt = [
    "Analyze this receipt image carefully. It may be printed, handwritten, or mixed. Read EVERY word, number, and symbol — including headers, footers, and fine print.",
    "",
    "LAYOUT & COLUMN READING:",
    "1. Printed POS receipts use columns (QTY | ITEM | PRICE | AMOUNT, or ITEM | PRICE | AMOUNT). Columns often don't line up visually — align by reading each row left-to-right using the printed labels.",
    "2. A typical item row: '2 x Rice 5000 10000' or 'Rice 2 5000 10000' or '2 @3500=7000'. Identify quantity (how many), unit price (price per ONE), and line total (the row's final amount).",
    "3. If a row shows only item + one number (e.g. 'Rice 5000'), treat the number as line total with quantity=1 and unitPrice=5000.",
    "4. If quantity and unitPrice are visible but lineTotal is missing, compute lineTotal = quantity × unitPrice.",
    "5. Handwritten receipts: 'Item | Qty | UnitPrice | Amount' or just 'Item: Amount'. Buyer name at top, then items, then 'Total:' underlined twice at bottom.",
    "",
    "HANDWRITING GUIDELINES:",
    "6. Ink can be smudged, paper creased, lighting uneven, handwriting cursive or rushed. Use context from the whole receipt.",
    "7. Naira may be: N 5000, #2500, ₦1,500, '=N= 800', '500' with context, or '2k' = 2000. Ignore commas and symbols (₦12,500 = 12500).",
    "8. Shortened items: 'Rice'→Rc, 'Tomatoe'→Tmt, 'Beans'→Bns, 'Garri'→Gr, 'Palm oil'→PO, 'Semovita'→Smvt, 'Indomie'→Ind, 'Peak milk'→Pk. Expand to the most likely full name.",
    "9. Handwritten dates: 12/7/2026, 12-07-26, '12th July 2026', '27/8/26'. Output ISO YYYY-MM-DD.",
    "10. If a word is ambiguous but looks like a common item, include it and lower confidence slightly.",
    "11. If you can partially read a line, include what you CAN read with nulls for unknowns — never skip the line.",
    "",
    "HEADER & FOOTER DETAILS:",
    "12. Extract merchant name (store/seller; often 'From: X' at top or printed banner).",
    "13. Extract merchant address / phone / city / RC number if printed anywhere.",
    "14. Extract receipt or invoice number (e.g. 'RCT-000123', 'INV 8901', 'Receipt No:', 'Serial:', bold serial near top/bottom).",
    "15. Detect payment method at bottom: CASH, CARD (POS), TRANSFER, MOBILE (QR/bank app), or 'Paid'. Output: cash, card, transfer, pos, mobile, or null.",
    "",
    "MONEY MATH (very important):",
    "16. VAT: Nigerian VAT is 7.5%. If the receipt shows 'VAT 7.5%', capture vatRate (7.5) and the VAT amount in 'tax' (NGN).",
    "17. Discounts: a 'Discount' line reduces the total — capture amount separately.",
    "18. Service charges / card fees: lines like 'Service Charge', 'Card Fee', 'Settlement' are ADDED fees — capture separately as serviceCharge.",
    "19. Subtotal = sum of item line totals BEFORE VAT/discount/service charge. Total = final amount paid (often 'Total', 'T:', 'Amount =N=', 'Pay:'). 'Change' or 'Balance' is NOT the total.",
    "20. Verify the math: subtotal + tax + serviceCharge - discount should equal total. If it doesn't, trust the printed 'total' line but note the discrepancy via lower confidence.",
    "",
    "Return strict JSON with this exact structure:",
    "{",
    '  "merchantName": string | null (store / seller name),',
    '  "merchantAddress": string | null (address, phone, city, or RC number if printed),',
    '  "customerName": string | null (buyer / customer name if written),',
    '  "receiptNumber": string | null (receipt / invoice / serial number),',
    '  "date": string | null (ISO YYYY-MM-DD if found, else null),',
    '  "currency": "NGN",',
    '  "isHandwritten": boolean (true if ANY part is handwritten),',
    '  "paymentMethod": "cash" | "card" | "transfer" | "pos" | "mobile" | null,',
    '  "items": [',
    "    {",
    '      "name": string (item name — expand shorthand, do not include barcodes),',
    '      "itemCode": string | null (SKU / PLU / barcode number if printed beside the item),',
    '      "quantity": number | null (defaults to 1 if you know a single item was sold but count is not shown),',
    '      "unitPrice": number | null (price per single unit in NGN),',
    '      "lineTotal": number | null (quantity × unitPrice, or the line/item amount written on the receipt)',
    "    }",
    "  ],",
    '  "subtotal": number | null (sum of item line totals before VAT/discount/service charge),',
    '  "tax": number | null (VAT amount in NGN, null if not shown),',
    '  "vatRate": number | null (e.g. 7.5 — only if the rate is shown or clearly implied),',
    '  "discount": number | null (total discount applied, null if none),',
    '  "serviceCharge": number | null (card/service fee, null if none),',
    '  "total": number | null (grand / final amount paid),',
    '  "confidence": number (between 0 and 1 — lower for difficult-to-read handwriting or when totals don\'t add up, higher for clear printed POS)',
    "}",
    "",
    "CRITICAL RULES:",
    "A. Populate items with EVERY line entry you can possibly read, even partial. Empty items is ONLY allowed if there is genuinely zero item data.",
    "B. Never turn header/footer noise (address, phone, barcode, RRR, THANK YOU) into items.",
    "C. Null is strictly for UNKNOWN / unreadable values — never 0 for missing numbers.",
    "D. Quantity defaults to 1 only when a single item was clearly sold.",
    "E. Compute lineTotal whenever you know quantity and unitPrice, and verify it matches the printed row amount.",
    "F. Ignore commas and currency symbols in numbers; return plain numbers (12500, not 12,500 or ₦12,500).",
    "G. If a receipt contains multiple unrelated receipts taped together, parse the primary one and set confidence low.",
  ].join("\n");

  const parsed = await callVisionJson({
    prompt,
    systemPrompt,
    image: {
      mimeType: mime,
      base64: imageFile.buffer.toString("base64"),
    },
  });

  const rawItems = Array.isArray(parsed?.items) ? parsed.items : [];
  const warnings = [];

  const normalizedItems = rawItems.map((item) => {
    const quantity = asNumberOrNull(item?.quantity);
    const unitPrice = asNumberOrNull(item?.unitPrice);
    let lineTotal = asNumberOrNull(item?.lineTotal);
    if (lineTotal == null && quantity != null && unitPrice != null) {
      lineTotal = Math.round(quantity * unitPrice);
    }
    return {
      name: String(item?.name || "").trim() || "Unknown item",
      itemCode: item?.itemCode ? String(item.itemCode).trim() || null : null,
      quantity,
      unitPrice,
      lineTotal,
    };
  });

  const isHandwritten = Boolean(parsed?.isHandwritten);

  const subtotal = asNumberOrNull(parsed?.subtotal);
  const tax = asNumberOrNull(parsed?.tax);
  const discount = asNumberOrNull(parsed?.discount);
  const serviceCharge = asNumberOrNull(parsed?.serviceCharge);
  let total = asNumberOrNull(parsed?.total);

  const sumLineTotals = normalizedItems.reduce(
    (s, it) => s + (it.lineTotal ?? 0),
    0,
  );

  let resolvedSubtotal = subtotal;
  if (resolvedSubtotal == null && sumLineTotals > 0) {
    resolvedSubtotal = Math.round(sumLineTotals);
  }

  let resolvedTotal = total;
  if (resolvedTotal == null && resolvedSubtotal != null) {
    const computed =
      resolvedSubtotal +
      (tax ?? 0) +
      (serviceCharge ?? 0) -
      (discount ?? 0);
    if (computed > 0) resolvedTotal = Math.round(computed);
  }

  if (
    resolvedSubtotal != null &&
    sumLineTotals > 0 &&
    Math.abs(resolvedSubtotal - sumLineTotals) > 1
  ) {
    warnings.push("Item totals don't match subtotal");
  }
  if (resolvedTotal != null && resolvedSubtotal != null) {
    const expected =
      resolvedSubtotal + (tax ?? 0) + (serviceCharge ?? 0) - (discount ?? 0);
    if (expected > 0 && Math.abs(expected - resolvedTotal) > 1) {
      warnings.push("Total doesn't match subtotal + tax/discount");
    }
  }

  let confidence =
    asNumberOrNull(parsed?.confidence) ?? (isHandwritten ? 0.7 : 0.85);
  if (warnings.length > 0) confidence = Math.max(0.3, confidence - 0.1);

  return {
    parsed: {
      merchantName: parsed?.merchantName || null,
      merchantAddress: parsed?.merchantAddress || null,
      customerName: parsed?.customerName || null,
      receiptNumber: parsed?.receiptNumber || null,
      date: parsed?.date || null,
      currency: "NGN",
      isHandwritten,
      paymentMethod: parsed?.paymentMethod || null,
      items: normalizedItems,
      subtotal: resolvedSubtotal,
      tax,
      vatRate: asNumberOrNull(parsed?.vatRate),
      discount,
      serviceCharge,
      total: resolvedTotal,
      confidence,
      warning: warnings.join(" · ") || null,
    },
  };
}

export async function parseVoiceSalesLog({ transcript, audioFile }) {
  const transcriptResult = await getTranscript({ transcript, audioFile });

  const systemPrompt = [
    "You are a Nigerian merchant AI that parses spoken sales logs.",
    "You understand English, Pidgin, Hausa, Yoruba, and Igbo, including mixed code-switching.",
    "You extract items, quantities, unit prices, and compute line totals.",
    "Currency is always Nigerian Naira (NGN).",
    "Return strict JSON only.",
  ].join("\n");

  const prompt = [
    "Input can be English, Pidgin, Hausa, Yoruba, Igbo, or mixed speech.",
    "The speaker is a Nigerian merchant listing today's sales.",
    "Examples of what you'll hear:",
    "  - 'Two bags of rice at 35 thousand each'",
    "  - 'Akara 500 naira, 10 wraps'",
    "  - 'I sold 3 crates of egg, 2800 per crate'",
    "",
    "Extract every sale and return strict JSON with this exact structure:",
    "{",
    '  "items": [',
    "    {",
    '      "name": string (product description, e.g. "Rice 50kg bag"),',
    '      "quantity": number | null (number sold — default 1 if ambiguous),',
    '      "unitPrice": number | null (price per single item in NGN),',
    '      "lineTotal": number | null (quantity x unitPrice)' ,
    "    }",
    "  ],",
    '  "totalAmount": number | null (sum of all line totals),',
    '  "languageDetected": string | null,',
    '  "confidence": number (between 0 and 1)',
    "}",
    "",
    "Rules:",
    "1. lineTotal should equal quantity x unitPrice whenever both are known.",
    "2. If only total price per line is mentioned, try to split it across quantity to estimate unitPrice.",
    "3. Use reasonable defaults (e.g. quantity=1) only if the speaker's intent is clear.",
    "4. Do not invent items. Only list sales explicitly mentioned.",
    "",
    "Transcript:",
    transcriptResult.transcript,
  ].join("\n");

  const parsed = await callBestAiJson({ prompt, systemPrompt });

  const normalizedItems = Array.isArray(parsed?.items)
    ? parsed.items.map((item) => {
        const qty = asNumberOrNull(item?.quantity) ?? 1;
        const unitPrice = asNumberOrNull(item?.unitPrice);
        const explicitLineTotal = asNumberOrNull(item?.lineTotal);
        const computedLineTotal =
          qty != null && unitPrice != null ? qty * unitPrice : null;
        return {
          name: String(item?.name || "").trim() || "Unknown item",
          quantity: qty,
          unitPrice,
          lineTotal: explicitLineTotal ?? computedLineTotal,
        };
      })
    : [];

  const explicitTotal = asNumberOrNull(parsed?.totalAmount);
  const computedTotal = normalizedItems.reduce(
    (s, it) => s + (it.lineTotal ?? 0),
    0,
  );

  return {
    transcript: transcriptResult.transcript,
    parsed: {
      items: normalizedItems,
      totalAmount:
        explicitTotal != null && explicitTotal > 0
          ? explicitTotal
          : computedTotal > 0
            ? computedTotal
            : null,
      languageDetected:
        parsed?.languageDetected || transcriptResult.languageDetected || "en",
      confidence: asNumberOrNull(parsed?.confidence) ?? 0.8,
    },
    meta: {
      transcriptionProvider: transcriptResult.provider,
    },
  };
}
