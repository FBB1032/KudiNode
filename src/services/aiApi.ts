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
  quantity: number | null;
  unitPrice: number | null;
  lineTotal: number | null;
}

export interface ReceiptExtractionResponse {
  parsed: {
    merchantName: string | null;
    date: string | null;
    currency: "NGN";
    items: ReceiptLineItem[];
    subtotal: number | null;
    tax: number | null;
    total: number | null;
    confidence: number;
  };
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
