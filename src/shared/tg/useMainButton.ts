import { useEffect, useRef } from 'react';
import { mainButton } from '@tma.js/sdk-react';
import { haptic } from './haptics';

interface MainButtonParams {
  text: string;
  onClick: () => void;
  enabled?: boolean;
}

/**
 * Drives Telegram's native MainButton for the current screen. Shows it on mount,
 * hides on unmount, and fires a light haptic on tap. No-ops outside Telegram.
 */
export function useMainButton({ text, onClick, enabled = true }: MainButtonParams) {
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  useEffect(() => {
    if (!mainButton.mount.isAvailable()) return;
    try {
      if (!mainButton.isMounted()) mainButton.mount();
    } catch {
      return;
    }

    const handler = () => {
      haptic('light');
      onClickRef.current();
    };
    const off = mainButton.onClick(handler);

    return () => {
      off?.();
      try {
        mainButton.setParams({ isVisible: false });
      } catch {
        /* not mounted */
      }
    };
  }, []);

  useEffect(() => {
    try {
      if (!mainButton.isMounted()) return;
      mainButton.setParams({ text, isVisible: true, isEnabled: enabled });
    } catch {
      /* not available */
    }
  }, [text, enabled]);
}
