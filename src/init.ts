import {
  setDebug,
  themeParams,
  initData,
  viewport,
  init as initSDK,
  miniApp,
  backButton,
  postEvent,
} from '@tma.js/sdk-react';

export async function init(options: { debug: boolean }): Promise<void> {
  setDebug(options.debug);
  initSDK();

  backButton.mount.ifAvailable();
  initData.restore();

  if (miniApp.mount.isAvailable()) {
    themeParams.mount();
    miniApp.mount();
    themeParams.bindCssVars();

    // Blend the native Telegram header/chrome with the app: bind them to the
    // same theme params the UI kit uses, so the native bar and our NavHeader
    // read as one continuous header (and stay theme-aware automatically).
    // Wrapped: a client that doesn't supply a given theme param throws
    // UnknownThemeParamsKeyError — that must not break boot.
    try {
      if (miniApp.setHeaderColor.isAvailable()) {
        miniApp.setHeaderColor('header_bg_color');
      }
      if (miniApp.setBottomBarColor.isAvailable()) {
        miniApp.setBottomBarColor('header_bg_color');
      }
      if (miniApp.setBgColor.isAvailable()) {
        miniApp.setBgColor('secondary_bg_color');
      }
    } catch {
      /* theme param not provided by this client — leave native chrome as-is */
    }
  }

  if (viewport.mount.isAvailable()) {
    viewport.mount().then(() => {
      viewport.bindCssVars();
    });
  }

  // On iOS, locking and unlocking the phone clears Telegram-injected CSS vars.
  // Re-request theme on visibility restore so TMA.js re-applies them.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      postEvent('web_app_request_theme');
      postEvent('web_app_request_viewport');
    }
  });
}
