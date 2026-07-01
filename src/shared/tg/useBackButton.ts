import { useEffect, useRef } from 'react';
import { backButton } from '@tma.js/sdk-react';

/**
 * Shows Telegram's native BackButton while the screen is mounted and routes taps
 * to `onClick`. No-ops outside Telegram.
 */
export function useBackButton(onClick: () => void) {
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  useEffect(() => {
    if (!backButton.mount.isAvailable()) return;
    try {
      if (!backButton.isMounted()) backButton.mount();
    } catch {
      return;
    }

    const off = backButton.onClick(() => onClickRef.current());
    try {
      backButton.show();
    } catch {
      /* not available */
    }

    return () => {
      off?.();
      try {
        backButton.hide();
      } catch {
        /* not available */
      }
    };
  }, []);
}
