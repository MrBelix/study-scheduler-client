import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { haptic } from '@/shared/tg';
import styles from './MainButton.module.scss';

interface MainButtonConfig {
  text: string;
  onClick: () => void;
  enabled: boolean;
}

interface MainButtonContextValue {
  config: MainButtonConfig | null;
  setConfig: (config: MainButtonConfig | null) => void;
}

const MainButtonContext = createContext<MainButtonContextValue | null>(null);

/** Holds the current screen's primary-action config, rendered by MainButtonBar. */
export function MainButtonProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<MainButtonConfig | null>(null);
  return (
    <MainButtonContext.Provider value={{ config, setConfig }}>{children}</MainButtonContext.Provider>
  );
}

function useMainButtonContext(): MainButtonContextValue {
  const ctx = useContext(MainButtonContext);
  if (!ctx) throw new Error('useMainButton must be used within a MainButtonProvider');
  return ctx;
}

interface UseMainButtonParams {
  text: string;
  onClick: () => void;
  enabled?: boolean;
}

/**
 * Registers the primary action for the current screen. Rendered as an in-DOM
 * button above the tab bar (not Telegram's native MainButton, which sits below
 * the tab bar). Clears when the screen unmounts.
 */
export function useMainButton({ text, onClick, enabled = true }: UseMainButtonParams) {
  const { setConfig } = useMainButtonContext();
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  useEffect(() => {
    setConfig({ text, enabled, onClick: () => onClickRef.current() });
    return () => setConfig(null);
  }, [text, enabled, setConfig]);
}

/** The action bar itself — sits above the tab bar; renders nothing when idle. */
export function MainButtonBar() {
  const { config } = useMainButtonContext();
  if (!config) return null;

  const handleClick = () => {
    haptic('light');
    config.onClick();
  };

  return (
    <div className={styles['main-button-bar']}>
      <button
        type="button"
        className={styles['main-button']}
        disabled={!config.enabled}
        onClick={handleClick}
      >
        {config.text}
      </button>
    </div>
  );
}
