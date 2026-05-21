// MD3-flavored bits that aren't shipped by MUI:
//   - NavBar with pill-shaped active indicator behind the icon
//   - Hero / StatCard (M3 primary-container & tertiary-container surfaces)
//   - StudentAvatar (colored circle with initials)
import { Avatar, Box, type SxProps, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { md3Light } from './theme'

// ────────────────────────────────────────────────────────────────────
// StudentAvatar — colored circle with student's initials
// ────────────────────────────────────────────────────────────────────
export const StudentAvatar = ({ name, color, size = 40 }: { name: string; color: string; size?: number }) => {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('')
  return (
    <Avatar sx={{ width: size, height: size, bgcolor: color, color: '#fff', fontSize: size * 0.36 }}>
      {initials}
    </Avatar>
  )
}

// ────────────────────────────────────────────────────────────────────
// NavBar — M3 navigation bar with pill indicator behind active icon
// Custom-built (instead of MUI BottomNavigation) so we match the M3
// active-state pill that the design specifies.
// ────────────────────────────────────────────────────────────────────
export interface NavItem {
  id: string
  label: string
  icon: ReactNode
  iconOutline: ReactNode
  onClick: () => void
}

export const MdNavBar = ({ items, activeId }: { items: NavItem[]; activeId: string }) => (
  <Box
    component="nav"
    sx={{
      display: 'flex',
      height: 80,
      paddingBlock: '12px 16px',
      backgroundColor: md3Light.surfaceContainer,
      flexShrink: 0,
    }}
  >
    {items.map(it => {
      const active = it.id === activeId
      return (
        <Box
          key={it.id}
          component="button"
          onClick={it.onClick}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            border: 0,
            background: 'transparent',
            color: active ? md3Light.onSurface : md3Light.onSurfaceVariant,
            cursor: 'pointer',
            padding: 0,
            font: 'inherit',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 32,
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background .2s',
              backgroundColor: active ? md3Light.secondaryContainer : 'transparent',
              color: active ? md3Light.onSecondaryContainer : 'inherit',
            }}
          >
            {active ? it.icon : it.iconOutline}
          </Box>
          <Typography component="span" sx={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, letterSpacing: '0.5px' }}>
            {it.label}
          </Typography>
        </Box>
      )
    })}
  </Box>
)

// ────────────────────────────────────────────────────────────────────
// StatCard — the rectangular M3 "stat" cards (default / tertiary /
// error tonal variants), used on dashboards & student detail.
// ────────────────────────────────────────────────────────────────────
export type StatCardVariant = 'default' | 'tertiary' | 'error'
const statBg: Record<StatCardVariant, string> = {
  default:  md3Light.surfaceContainerLow,
  tertiary: md3Light.tertiaryContainer,
  error:    md3Light.errorContainer,
}
const statFg: Record<StatCardVariant, string> = {
  default:  md3Light.onSurface,
  tertiary: md3Light.onTertiaryContainer,
  error:    md3Light.onErrorContainer,
}

export const StatCard = ({
  label,
  value,
  sub,
  variant = 'default',
  sx,
}: {
  label: string
  value: string
  sub?: string
  variant?: StatCardVariant
  sx?: SxProps
}) => (
  <Box sx={{ borderRadius: '16px', padding: '16px', backgroundColor: statBg[variant], color: statFg[variant], ...sx }}>
    <Typography sx={{ fontSize: 11, lineHeight: '16px', fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.7 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 32, lineHeight: '40px', fontWeight: 400, marginTop: '6px', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.25px' }}>
      {value}
    </Typography>
    {sub && (
      <Typography sx={{ fontSize: 12, lineHeight: '16px', fontWeight: 400, letterSpacing: '0.4px', marginTop: '4px', opacity: 0.7 }}>
        {sub}
      </Typography>
    )}
  </Box>
)

// ────────────────────────────────────────────────────────────────────
// SectionHeader — the colored section label between list groups.
// ────────────────────────────────────────────────────────────────────
export const SectionHeader = ({ children }: { children: ReactNode }) => (
  <Typography
    sx={{
      paddingInline: '16px',
      paddingTop: '16px',
      paddingBottom: '8px',
      fontSize: 14,
      lineHeight: '20px',
      fontWeight: 500,
      letterSpacing: '0.1px',
      color: md3Light.primary,
    }}
  >
    {children}
  </Typography>
)

// ────────────────────────────────────────────────────────────────────
// Balance helper — formats a signed currency amount with the M3
// tertiary (positive) / error (negative) / on-surface-variant (zero) colors.
// ────────────────────────────────────────────────────────────────────
export const formatHryvnia = (n: number) =>
  Math.abs(n).toLocaleString('uk-UA').replace(/,/g, ' ')

export const balanceColor = (bal: number) =>
  bal < 0 ? md3Light.error : bal > 0 ? md3Light.tertiary : md3Light.onSurfaceVariant

export const balanceLabel = (bal: number) =>
  `${bal < 0 ? '−' : bal > 0 ? '+' : ''}₴${formatHryvnia(bal)}`
