import { hapticFeedback } from '@tma.js/sdk-react';

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

/** Fire an impact haptic if the Telegram client supports it; otherwise no-op. */
export function haptic(style: ImpactStyle = 'light') {
  try {
    if (hapticFeedback.impactOccurred.isAvailable()) {
      hapticFeedback.impactOccurred(style);
    }
  } catch {
    /* not available */
  }
}
