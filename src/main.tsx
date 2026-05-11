import { createRoot } from 'react-dom/client'
import './mockEnv.ts'
import { init } from './init.ts'
import { App } from './App.tsx'

init(import.meta.env.DEV).catch(console.error)

const root = createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(<App />)
