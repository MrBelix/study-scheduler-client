import { createContext, useContext, useEffect, useRef } from 'react';
import type { IconName } from '../Icon/icons';

export interface MainButtonConfig {
  text: string;
  onClick: () => void;
  enabled: boolean;
  /** Shows a spinner in place of the label while a mutation is in flight. */
  loading: boolean;
  icon?: IconName;
  /** Visual weight — `tinted` for a secondary action alongside a more important flow. @default 'primary' */
  variant: 'primary' | 'tinted';
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
  icon?: IconName;
  /** Hides the bar entirely — for screens whose empty state carries its own action button. */
  hidden?: boolean;
  /** @default 'primary' */
  variant?: 'primary' | 'tinted';
}

/**
 * Registers the primary action for the current screen. Rendered as an in-DOM
 * button above the tab bar (not Telegram's native MainButton, which sits below
 * the tab bar). Clears when the screen unmounts.
 */
export function useMainButton({
  text,
  onClick,
  enabled = true,
  loading = false,
  icon,
  hidden = false,
  variant = 'primary',
}: UseMainButtonParams) {
  const { setConfig } = useMainButtonContext();
  const onClickRef = useRef(onClick);

  useEffect(() => {
    onClickRef.current = onClick;
  });

  useEffect(() => {
    setConfig(hidden ? null : { text, enabled, loading, icon, variant, onClick: () => onClickRef.current() });
    return () => setConfig(null);
  }, [text, enabled, loading, icon, hidden, variant, setConfig]);
}
