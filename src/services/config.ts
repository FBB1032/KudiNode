import { Platform } from "react-native";

/**
 * Central configuration for the mobile app's API layer.
 *
 * Priority order:
 * 1. Explicit hosted URL via `EXPO_PUBLIC_API_URL`.
 * 2. Device-specific local fallback for simulators/emulators.
 */
function getDefaultApiBaseUrl() {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }

  if (Platform.OS === "ios" || Platform.OS === "web") {
    return "http://localhost:4000";
  }

  return "http://localhost:4000";
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || getDefaultApiBaseUrl();

export const API_PREFIX = "/api";
