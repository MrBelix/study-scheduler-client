import { popup } from '@tma.js/sdk-react';

/** Show a Telegram popup with a single message if supported; otherwise no-op. */
export function notify(message: string) {
  try {
    if (popup.isSupported()) popup.show({ message });
  } catch {
    /* not available (outside a Mini App, or a popup is already open) */
  }
}
