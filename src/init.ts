import {
  isBackButtonSupported,
  mountBackButton,
  isMiniAppSupported,
  mountMiniAppSync,
  bindMiniAppCssVars,
  mountThemeParamsSync,
  bindThemeParamsCssVars,
  restoreInitData,
  mountViewport,
  bindViewportCssVars,
  setDebug,
  init as initSDK,
} from '@telegram-apps/sdk-react'

export async function init(debug: boolean): Promise<void> {
  setDebug(debug)

  try {
    initSDK()
  } catch (e) {
    if (!debug) throw e
    console.warn('[Dev] SDK не зміг визначити середовище, продовжуємо з мок-оточенням:', e)
    return
  }

  if (isBackButtonSupported()) mountBackButton()
  if (isMiniAppSupported()) mountMiniAppSync()
  mountThemeParamsSync()
  restoreInitData()

  await mountViewport().catch((e) => {
    console.error('Не вдалося змонтувати viewport', e)
  })

  bindViewportCssVars()
  if (isMiniAppSupported()) bindMiniAppCssVars()
  bindThemeParamsCssVars()
}
