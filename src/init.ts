import {
  setDebug,
  themeParams,
  initData,
  viewport,
  init as initSDK,
  mockTelegramEnv,
  retrieveLaunchParams,
  emitEvent,
  miniApp,
  backButton,
} from '@tma.js/sdk-react';

const MOCK_THEME = {
  bg_color: '#ffffff',
  secondary_bg_color: '#efeff4',
  text_color: '#000000',
  hint_color: '#8e8e93',
  link_color: '#2678b6',
  button_color: '#2678b6',
  button_text_color: '#ffffff',
  destructive_text_color: '#ff3b30',
} as const;

function setupBrowserMock(): void {
  mockTelegramEnv({
    // launchParams stores to localStorage so initSDK() can find them.
    // tgWebAppData must be absent — empty string fails the initData schema.
    launchParams: new URLSearchParams({
      tgWebAppVersion: '7.7',
      tgWebAppPlatform: 'tdesktop',
      tgWebAppThemeParams: JSON.stringify(MOCK_THEME),
    }),
    onEvent(event, next) {
      if (event.name === 'web_app_request_theme') {
        return emitEvent('theme_changed', { theme_params: MOCK_THEME });
      }
      if (event.name === 'web_app_request_viewport') {
        return emitEvent('viewport_changed', {
          height: window.innerHeight,
          width: window.innerWidth,
          is_expanded: true,
          is_state_stable: true,
        });
      }
      if (event.name === 'web_app_request_safe_area') {
        return emitEvent('safe_area_changed', { left: 0, top: 0, right: 0, bottom: 0 });
      }
      if (event.name === 'web_app_request_content_safe_area') {
        return emitEvent('content_safe_area_changed', { left: 0, top: 0, right: 0, bottom: 0 });
      }
      next();
    },
  });
}

export async function init(options: { debug: boolean }): Promise<void> {
  setDebug(options.debug);

  // Clear stale mock from previous dev session. In real Telegram params come
  // from the URL hash (higher priority), so removing localStorage is safe.
  localStorage.removeItem('launchParams');

  try {
    retrieveLaunchParams();
  } catch {
    setupBrowserMock();
  }

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
}
