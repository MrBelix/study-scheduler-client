import { useState, type ReactNode } from 'react';
import { haptic } from '@/shared/tg';
import { MainButtonContext, useMainButtonContext, type MainButtonConfig } from './useMainButton';
import styles from './MainButton.module.scss';

/** Holds the current screen's primary-action config, rendered by MainButtonBar. */
export function MainButtonProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<MainButtonConfig | null>(null);
  return (
    <MainButtonContext.Provider value={{ config, setConfig }}>{children}</MainButtonContext.Provider>
  );
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
