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
