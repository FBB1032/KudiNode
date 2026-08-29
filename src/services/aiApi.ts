import { api } from "./apiClient";

export interface ParsedVoiceTransfer {
  recipientName: string | null;
  bankName: string | null;
  accountNumber: string | null;
  amount: number | null;
  narration: string | null;
  languageDetected: string | null;
  confidence: number;
}

export interface VoiceTransferResponse {
  transcript: string;
  parsed: ParsedVoiceTransfer;
  meta: {
    transcriptionProvider: string;
  };
}

export interface ReceiptLineItem {
  name: string;
  itemCode: string | null;
  quantity: number | null;
  unitPrice: number | null;
  lineTotal: number | null;
}

export interface ReceiptExtractionResponse {
  parsed: {
    merchantName: string | null;
    merchantAddress: string | null;
    customerName: string | null;
    receiptNumber: string | null;
    date: string | null;
    currency: "NGN";
    isHandwritten: boolean;
    paymentMethod: string | null;
    items: ReceiptLineItem[];
    subtotal: number | null;
    tax: number | null;
    vatRate: number | null;
    discount: number | null;
    serviceCharge: number | null;
    total: number | null;
    confidence: number;
    warning: string | null;
  };
}

export interface SalesLogItem {
  name: string;
  quantity: number | null;
  unitPrice: number | null;
  lineTotal: number | null;
}

export interface VoiceSalesLogResponse {
  transcript: string;
  parsed: {
    items: SalesLogItem[];
    totalAmount: number | null;
    languageDetected: string | null;
    confidence: number;
  };
  meta: {
    transcriptionProvider: string;
  };
}

export interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  content: string;
  provider: "groq" | "gemini";
}

export async function parseVoiceTransferFromText(transcript: string) {
  return api.post<VoiceTransferResponse>("/ai/voice-transfer", { transcript });
}

export async function parseVoiceTransferFromAudio(audioUri: string) {
  const form = new FormData();
  form.append("audio", {
    uri: audioUri,
    name: `voice-${Date.now()}.m4a`,
    type: "audio/x-m4a",
  } as any);

  return api.postForm<VoiceTransferResponse>("/ai/voice-transfer", form);
}

export async function extractReceiptFromImage(imageUri: string) {
  const form = new FormData();
  form.append("image", {
    uri: imageUri,
    name: `receipt-${Date.now()}.jpg`,
    type: "image/jpeg",
  } as any);

  return api.postForm<ReceiptExtractionResponse>("/ai/receipt-extract", form);
}

export async function parseVoiceSalesLog(audioUri: string) {
  const form = new FormData();
  form.append("audio", {
    uri: audioUri,
    name: `sales-log-${Date.now()}.m4a`,
    type: "audio/x-m4a",
  } as any);

  return api.postForm<VoiceSalesLogResponse>("/ai/voice-sales-log", form);
}

export async function sendAiChatMessage(
  messages: ChatMessageInput[],
  userName?: string,
) {
  return api.post<ChatResponse>("/ai/chat", { messages, userName });
}
