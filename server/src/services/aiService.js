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
    model: env.groqModel || "llama-3.3-70b-versatile",
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
    "You are an AI receipt scanner for Nigerian small merchants and market traders.",
    "You read receipt images of ALL TYPES including:",
    "  • Printed POS / supermarket receipts",
    "  • HANDWRITTEN paper receipts (exercise book paper, plain paper, tissue, card slips)",
    "  • Scribbled notes and tallys on any paper surface",
    "  • Customer invoices, waybills, 'received by' slips",
    "  • Mixed printed + handwritten receipts (very common in Nigeria)",
    "Handwriting is usually in Biro / ballpoint pen. Can be cursive, all caps, or shorthand. Expect spelling variations and shortened words.",
    "Currency is always Nigerian Naira (NGN). Expect: N, ₦, #, NGN, 'naira' written by hand, or no symbol but context implies Naira.",
    "Return strict JSON only — no prose, no markdown, no apology messages when data is partial.",
  ].join("\n");

  const prompt = [
    "Analyze this receipt image with SPECIAL ATTENTION to HANDWRITING. This could be a printed, handwritten, or mixed receipt. Read every single word, number, and symbol you can.",
    "",
    "HANDWRITING GUIDELINES (very important for Nigerian market receipts):",
    "1. Read carefully — ink can be smudged, paper creased, lighting uneven, handwriting cursive or rushed.",
    "2. Naira might be written as: N 5000, #2500, ₦1,500, '=N= 800', just '500' with context of price, or '2k' meaning 2000.",
    "3. Item names often use shorthand: 'Rice' could be Rc, 'Tomatoe' Tmt, 'Beans' Bns, 'Garri' Gr, 'Palm oil' PO, 'Semovita' Smvt.",
    "4. A typical handwritten line format in Nigeria is:  Item Name   Qty   UnitPrice   Amount — or just Amount per item.",
    "5. Some handwritten receipts write: Name of buyer at top, then items, then 'Total: .....' at the bottom underlined twice.",
    "6. Handwritten dates: 12/7/2026 or 12-07-26 or '12th July 2026'.",
    "7. If a word is ambiguous but looks like a common item name, include it and lower confidence slightly.",
    "8. If you can partially read a line, include what you CAN read with nulls for unknowns — do not skip the entire line.",
    "",
    "Return strict JSON with this exact structure:",
    "{",
    '  "merchantName": string | null (store / seller name if found; very often handwritten at top as "From: X" or business name),',
    '  "customerName": string | null (buyer / customer name if written at top),',
    '  "date": string | null (ISO date format YYYY-MM-DD if found, else null),',
    '  "currency": "NGN",',
    '  "isHandwritten": boolean (true if mostly/partially handwritten, false if fully printed POS),',
    '  "items": [',
    "    {",
    '      "name": string (product / item name — transcribe exactly as written, do not over-correct),',
    '      "quantity": number | null (defaults to 1 if you know a single item was sold but count is not shown),',
    '      "unitPrice": number | null (price per single unit in NGN),',
    '      "lineTotal": number | null (quantity × unitPrice, or the line/item amount written on the receipt)' ,
    "    }",
    "  ],",
    '  "subtotal": number | null (sum before VAT/discount/shipping),',
    '  "tax": number | null (VAT or any tax amount, null if not shown — most handwritten receipts omit tax),',
    '  "total": number | null (grand / final amount paid — often at bottom underlined or preceded by "Total", "T:", "Amount =N=" ),',
    '  "confidence": number (between 0 and 1 — lower for difficult-to-read handwriting, higher for clear printed POS)',
    "}",
    "",
    "CRITICAL RULES:",
    "A. Populate items array with EVERY line entry you can possibly read, even partial. Empty items array is ONLY allowed if there is genuinely zero item data on the image.",
    "B. Set isHandwritten = true if ANY part of receipt is handwritten (not 100% printed).",
    "C. Null is strictly used for UNKNOWN / unreadable values — never 0 for missing numbers.",
    "D. When handwritten line only says 'Rice: 5000' with no qty — name='Rice', unitPrice=5000, quantity=1, lineTotal=5000.",
    "E. Nigerian formatting: commas as thousands separators (₦12,500) — ignore them, return plain numbers.",
  ].join("\n");

  const parsed = await callGeminiJson({
    prompt,
    systemPrompt,
    inlineParts: [
      {
        inline_data: {
          mime_type: mime,
          data: imageFile.buffer.toString("base64"),
        },
      },
    ],
  });

  const normalizedItems = Array.isArray(parsed?.items)
    ? parsed.items.map((item) => ({
        name: String(item?.name || "").trim() || "Unknown item",
        quantity: asNumberOrNull(item?.quantity),
        unitPrice: asNumberOrNull(item?.unitPrice),
        lineTotal: asNumberOrNull(item?.lineTotal),
      }))
    : [];

  const isHandwritten = Boolean(parsed?.isHandwritten);

  return {
    parsed: {
      merchantName: parsed?.merchantName || null,
      customerName: parsed?.customerName || null,
      date: parsed?.date || null,
      currency: "NGN",
      isHandwritten,
      items: normalizedItems,
      subtotal: asNumberOrNull(parsed?.subtotal),
      tax: asNumberOrNull(parsed?.tax),
      total: asNumberOrNull(parsed?.total),
      confidence: asNumberOrNull(parsed?.confidence) ?? (isHandwritten ? 0.7 : 0.85),
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
