import { mockTelegramEnv, retrieveLaunchParams } from '@telegram-apps/sdk-react'

// Імітуємо середовище Telegram у режимі розробки.
// Це дозволяє запускати застосунок поза Telegram-клієнтом.
if (import.meta.env.DEV) {
  try {
    retrieveLaunchParams()
  } catch {
    // tgWebAppData — в форматі URLSearchParams (raw init data).
    const tgWebAppData = new URLSearchParams([
      [
        'user',
        JSON.stringify({
          id: 99281932,
          first_name: 'Andrew',
          last_name: 'Rogue',
          username: 'rogue',
          language_code: 'uk',
          is_premium: true,
          allows_write_to_pm: true,
        }),
      ],
      ['hash', '89d6079ad6762351f38c6dbbc41bb53048264e5fdaf83a9ad8ad29f54fef0b32'],
      ['auth_date', '1716922846'],
      ['start_param', 'debug'],
      ['chat_type', 'sender'],
      ['chat_instance', '8428209589180549439'],
    ])

    mockTelegramEnv({
      launchParams: {
        tgWebAppData,
        tgWebAppVersion: '8.0',
        tgWebAppPlatform: 'tdesktop',
        tgWebAppThemeParams: {
          accent_text_color: '#6ab2f2',
          bg_color: '#17212b',
          button_color: '#5288c1',
          button_text_color: '#ffffff',
          destructive_text_color: '#ec3942',
          header_bg_color: '#17212b',
          hint_color: '#708499',
          link_color: '#6ab3f3',
          secondary_bg_color: '#232e3c',
          section_bg_color: '#17212b',
          section_header_text_color: '#6ab3f3',
          subtitle_text_color: '#708499',
          text_color: '#f5f5f5',
        },
      },
    })

    // eslint-disable-next-line no-console
    console.info(
      '[Telegram Mock] Запущено dev mock — застосунок працює як у Telegram з тестовим користувачем.',
    )
  }
}
