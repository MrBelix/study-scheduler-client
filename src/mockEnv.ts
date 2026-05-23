import { emitEvent, isTMA, mockTelegramEnv } from '@tma.js/sdk-react';

// Only compiled into the dev bundle — tree-shaken in production.
if (import.meta.env.DEV) {
  if (!await isTMA('complete')) {
    const themeParams = {
      bg_color: '#ffffff',
      secondary_bg_color: '#efeff4',
      text_color: '#000000',
      hint_color: '#8e8e93',
      link_color: '#2678b6',
      button_color: '#2678b6',
      button_text_color: '#ffffff',
      destructive_text_color: '#ff3b30',
    } as const;
    const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

    mockTelegramEnv({
      onEvent(e) {
        if (e.name === 'web_app_request_theme') {
          return emitEvent('theme_changed', { theme_params: themeParams });
        }
        if (e.name === 'web_app_request_viewport') {
          return emitEvent('viewport_changed', {
            height: window.innerHeight,
            width: window.innerWidth,
            is_expanded: true,
            is_state_stable: true,
          });
        }
        if (e.name === 'web_app_request_content_safe_area') {
          return emitEvent('content_safe_area_changed', noInsets);
        }
        if (e.name === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', noInsets);
        }
      },
      launchParams: new URLSearchParams([
        ['tgWebAppThemeParams', JSON.stringify(themeParams)],
        ['tgWebAppData', new URLSearchParams([
          ['auth_date', (new Date().getTime() / 1000 | 0).toString()],
          ['hash', 'mock-hash'],
          ['signature', 'mock-signature'],
          ['user', JSON.stringify({ id: 1, first_name: 'Олена', last_name: 'Коваленко' })],
        ]).toString()],
        ['tgWebAppVersion', '8.4'],
        ['tgWebAppPlatform', 'tdesktop'],
      ]),
    });
  }
}
