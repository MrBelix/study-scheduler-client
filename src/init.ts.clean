import {
  backButton,
  viewport,
  themeParams,
  miniApp,
  initData,
  setDebug,
  init as initSDK,
} from '@telegram-apps/sdk-react'

/**
 * Ініціалізує застосунок та налаштовує оточення.
 * @param debug включити режим дебагу.
 */
export async function init(debug: boolean): Promise<void> {
  // Встановлюємо debug-режим SDK.
  setDebug(debug)

  // Ініціалізуємо спеціальні компоненти для подальшої роботи.
  initSDK()

  // Перевіряємо, чи підтримуються необхідні компоненти.
  if (!backButton.isSupported() || !miniApp.isSupported()) {
    // eslint-disable-next-line no-console
    console.warn('Деякі компоненти Telegram Mini App не підтримуються у поточному оточенні.')
  }

  // Монтуємо всі необхідні компоненти (там, де є підтримка).
  if (backButton.isSupported()) backButton.mount()
  if (miniApp.isSupported()) miniApp.mount()
  themeParams.mount()
  initData.restore()

  await viewport
    .mount()
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error('Не вдалося змонтувати viewport', e)
    })

  // Прив'язуємо CSS-змінні теми та viewport до DOM.
  viewport.bindCssVars()
  if (miniApp.isSupported()) miniApp.bindCssVars()
  themeParams.bindCssVars()
}
