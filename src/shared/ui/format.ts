// UI-side formatters for money/balance. Kept in shared/ui because
// balanceColor reaches into the M3 token palette.
import { md3Light } from './theme'

export const formatHryvnia = (n: number) =>
  Math.abs(n).toLocaleString('uk-UA').replace(/,/g, ' ')

export const balanceColor = (bal: number) =>
  bal < 0 ? md3Light.error : bal > 0 ? md3Light.tertiary : md3Light.onSurfaceVariant

export const balanceLabel = (bal: number) =>
  `${bal < 0 ? '−' : bal > 0 ? '+' : ''}₴${formatHryvnia(bal)}`
