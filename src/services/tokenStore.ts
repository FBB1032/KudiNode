/**
 * Secure token storage. Uses expo-secure-store on native (Keychain/Keystore)
 * and falls back to in-memory storage on web (where SecureStore is unavailable).
 */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS = "kn_access_token";
const REFRESH = "kn_refresh_token";

const memory: Record<string, string | null> = {};

const isWeb = Platform.OS === "web";

async function setItem(key: string, value: string | null) {
  if (isWeb) {
    memory[key] = value;
    return;
  }
  if (value == null) await SecureStore.deleteItemAsync(key);
  else await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return memory[key] ?? null;
  return SecureStore.getItemAsync(key);
}

export const tokenStore = {
  async save(accessToken: string, refreshToken?: string) {
    await setItem(ACCESS, accessToken);
    if (refreshToken) await setItem(REFRESH, refreshToken);
  },
  getAccessToken: () => getItem(ACCESS),
  getRefreshToken: () => getItem(REFRESH),
  async clear() {
    await setItem(ACCESS, null);
    await setItem(REFRESH, null);
  },
};
