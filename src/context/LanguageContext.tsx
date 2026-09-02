import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { EN } from './i18n/en';
import { Pidgin } from './i18n/pidgin';
import { Hausa } from './i18n/hausa';
import { Yoruba } from './i18n/yoruba';
import { Igbo } from './i18n/igbo';

export type Language = 'EN' | 'Pidgin' | 'Hausa' | 'Yoruba' | 'Igbo';
export type VoiceLanguage = 'en' | 'ha' | 'yo' | 'ig' | 'pid';

export const LANGUAGE_TO_VOICE: Record<Language, VoiceLanguage> = {
  EN: 'en',
  Pidgin: 'pid',
  Hausa: 'ha',
  Yoruba: 'yo',
  Igbo: 'ig',
};

const STORAGE_KEY = 'kn_app_language';

const isWeb = Platform.OS === 'web';
const memory: Record<string, string | null> = {};

async function setItem(key: string, value: string | null) {
  if (isWeb) { memory[key] = value; return; }
  if (value == null) await SecureStore.deleteItemAsync(key);
  else await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return memory[key] ?? null;
  return SecureStore.getItemAsync(key);
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN,
  Pidgin,
  Hausa,
  Yoruba,
  Igbo,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function interpolate(text: string, params?: Record<string, string>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('EN');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getItem(STORAGE_KEY);
      if (saved === 'EN' || saved === 'Pidgin' || saved === 'Hausa' || saved === 'Yoruba' || saved === 'Igbo') {
        setLanguageState(saved);
      }
      setReady(true);
    })();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const dict = translations[language];
      const fallback = translations.EN[key];
      const resolved = dict[key] ?? fallback ?? key;
      return interpolate(resolved, params);
    },
    [language],
  );

  if (!ready) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}