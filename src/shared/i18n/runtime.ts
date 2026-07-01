import { baseLocale, isLocale, overwriteGetLocale, overwriteSetLocale } from '@/paraglide/runtime';
import { initData } from '@tma.js/sdk-react';

/** Locales the app ships (mirror of project.inlang `locales`). */
export type AppLocale = 'uk' | 'en';

/** Endonyms for the language picker (not translated — shown in their own language). */
export const LOCALE_NAMES: Record<AppLocale, string> = {
  uk: 'Українська',
  en: 'English',
};

const STORAGE_KEY = 'app-locale';

// Single source of truth for the active locale. Paraglide message functions
// read it via the overwritten getLocale below.
let current: AppLocale = baseLocale as AppLocale;

function fromStorage(): AppLocale | undefined {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && isLocale(v) ? (v as AppLocale) : undefined;
  } catch {
    return undefined;
  }
}

function fromTelegram(): AppLocale | undefined {
  try {
    const code = initData.user()?.language_code?.slice(0, 2);
    return code && isLocale(code) ? (code as AppLocale) : undefined;
  } catch {
    return undefined;
  }
}

function applyDocumentLang() {
  try {
    document.documentElement.lang = current;
  } catch {
    /* no document */
  }
}

/**
 * Resolve and apply the initial locale. Call once, after the SDK is initialised
 * and before the first React render. Priority: saved override → Telegram
 * `language_code` → base locale.
 */
export function initLocale(): AppLocale {
  overwriteGetLocale(() => current);
  overwriteSetLocale((l) => {
    current = l as AppLocale;
  });
  current = fromStorage() ?? fromTelegram() ?? (baseLocale as AppLocale);
  applyDocumentLang();
  return current;
}

export function getAppLocale(): AppLocale {
  return current;
}

/** Persist + apply a new locale. Re-rendering is driven by LocaleProvider. */
export function persistLocale(locale: AppLocale): void {
  current = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* storage unavailable */
  }
  applyDocumentLang();
}
