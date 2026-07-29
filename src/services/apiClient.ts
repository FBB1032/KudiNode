/**
 * Thin fetch wrapper around the KudiNode backend.
 * - Prefixes the base URL + /api
 * - Attaches the stored bearer token automatically
 * - Normalises error responses into thrown ApiError instances
 * - Supports multipart uploads
 */
import { API_BASE_URL, API_PREFIX } from "./config";
import { tokenStore } from "./tokenStore";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach bearer token (default true)
  isForm?: boolean; // body is FormData
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, isForm = false } = opts;

  const headers: Record<string, string> = {};
  if (!isForm && body !== undefined)
    headers["Content-Type"] = "application/json";

  if (auth) {
    const token = await tokenStore.getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    method,
    headers,
    body: isForm
      ? (body as FormData)
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: { message: text || `HTTP ${res.status}` } };
  }

  if (!res.ok) {
    const message =
      json?.error?.message || json?.message || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, json?.error?.details || json);
  }
  return json as T;
}

export const api = {
  get: <T>(path: string, auth = true) =>
    request<T>(path, { method: "GET", auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: "POST", body, auth }),
  put: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: "PUT", body, auth }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "POST", body: form, isForm: true, auth: true }),
};
