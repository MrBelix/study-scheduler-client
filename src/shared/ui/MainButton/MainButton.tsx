import { useState, type ReactNode } from 'react';
import { haptic } from '@/shared/tg';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
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
        className={cx(styles['main-button'], config.variant === 'tinted' && styles['main-button--tinted'])}
        disabled={!config.enabled || config.loading}
        onClick={handleClick}
      >
        {config.loading ? (
          <span className={styles['main-button__spinner']} aria-hidden="true" />
        ) : (
          config.icon && <Icon name={config.icon} size={22} />
        )}
        <span className={styles['main-button__label']}>{config.text}</span>
      </button>
    </div>
  );
}
