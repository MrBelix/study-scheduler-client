import { createContext, useContext, useEffect, useRef } from 'react';

export interface MainButtonConfig {
  text: string;
  onClick: () => void;
  enabled: boolean;
  /** Shows a spinner in place of the label while a mutation is in flight. */
  loading: boolean;
}

export interface MainButtonContextValue {
  config: MainButtonConfig | null;
  setConfig: (config: MainButtonConfig | null) => void;
}

export const MainButtonContext = createContext<MainButtonContextValue | null>(null);

export function useMainButtonContext(): MainButtonContextValue {
  const ctx = useContext(MainButtonContext);
  if (!ctx) throw new Error('useMainButton must be used within a MainButtonProvider');
  return ctx;
}

interface UseMainButtonParams {
  text: string;
  onClick: () => void;
  enabled?: boolean;
  /** Shows a spinner in place of the label — wire in a mutation's `isPending`. */
  loading?: boolean;
}

/**
 * Registers the primary action for the current screen. Rendered as an in-DOM
 * button above the tab bar (not Telegram's native MainButton, which sits below
 * the tab bar). Clears when the screen unmounts.
 */
export function useMainButton({ text, onClick, enabled = true, loading = false }: UseMainButtonParams) {
  const { setConfig } = useMainButtonContext();
  const onClickRef = useRef(onClick);

  useEffect(() => {
    onClickRef.current = onClick;
  });

  useEffect(() => {
    setConfig({ text, enabled, loading, onClick: () => onClickRef.current() });
    return () => setConfig(null);
  }, [text, enabled, loading, setConfig]);
}
