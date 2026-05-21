// M3 Navigation Bar with the pill-shaped active indicator behind the
// selected icon. Built by hand (rather than MUI's BottomNavigation)
// because the M3 active pill isn't shipped by MUI.
import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { md3Light } from '../theme'

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
          <Typography
            component="span"
            sx={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, letterSpacing: '0.5px' }}
          >
            {it.label}
          </Typography>
        </Box>
      )
    })}
  </Box>
)
