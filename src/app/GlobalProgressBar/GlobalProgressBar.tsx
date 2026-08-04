import { useEffect, useState } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import styles from './GlobalProgressBar.module.scss';

const SHOW_DELAY_MS = 300;

/**
 * Thin bar fixed to the top of the viewport, visible while any query or
 * mutation is in flight. Shown only after a ~300ms delay (classic anti-flash)
 * so quick requests don't make it blink in/out; hidden immediately once work
 * finishes.
 */
export function GlobalProgressBar() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const active = isFetching > 0 || isMutating > 0;
  const [visible, setVisible] = useState(false);

  // Hide immediately once work finishes — adjusted during render (not inside
  // the effect below) since it's a plain derived reset, not a side effect.
  if (!active && visible) {
    setVisible(false);
  }

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [active]);

  if (!visible) return null;
  return <div className={styles['global-progress-bar']} />;
}
