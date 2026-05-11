import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Mock-середовище Telegram має імпортуватись ПЕРЕД будь-яким SDK API.
import './mockEnv.ts'

import App from './App.tsx'
import { init } from './init.ts'

import '@telegram-apps/telegram-ui/dist/styles.css'
import './index.css'

// Ініціалізуємо Telegram SDK перед рендером.
init(import.meta.env.DEV).catch((e) => {
  console.error('Не вдалося ініціалізувати Telegram SDK:', e)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
