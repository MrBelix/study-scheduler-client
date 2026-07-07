import { useCallback, useState, type ReactNode } from 'react';
import { getAppLocale, persistLocale, type AppLocale } from './runtime';
import { LocaleContext } from './useLocale';

/**
 * Holds the active locale in React state so switching it re-renders the whole
 * tree — Paraglide message functions then re-evaluate in the new language
 * without a page reload.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(getAppLocale);

  const setLocale = useCallback((next: AppLocale) => {
    persistLocale(next);
    setLocaleState(next);
  }, []);

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}
