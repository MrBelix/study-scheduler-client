import { retrieveRawInitData, initData as initDataSdk } from '@tma.js/sdk-react';

export {
  useSignal,
  useLaunchParams,
  useRawInitData,
} from '@tma.js/sdk-react';

export {
  backButton,
  hapticFeedback,
  initData,
  miniApp,
  themeParams,
  viewport,
} from '@tma.js/sdk-react';

export { useBackButton } from './useBackButton';
export { haptic } from './haptics';

/**
 * Raw init data string for the `Authorization: tma <…>` header.
 * Returns undefined outside a Mini App context instead of throwing.
 */
export function getRawInitData(): string | undefined {
  try {
    return retrieveRawInitData();
  } catch {
    return undefined;
  }
}

/** Telegram user from init data — undefined outside a Mini App context. */
export function getTelegramUser() {
  try {
    return initDataSdk.user();
  } catch {
    return undefined;
  }
}
