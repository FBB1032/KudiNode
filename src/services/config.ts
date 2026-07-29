/**
 * Central configuration for the mobile app's API layer.
 *
 * Production backend: https://kudinode.onrender.com
 *
 * Override at dev time by setting EXPO_PUBLIC_API_URL in a local .env file:
 *   EXPO_PUBLIC_API_URL=http://192.168.x.x:4000
 */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://kudinode.onrender.com"
);

export const API_PREFIX = "/api";
