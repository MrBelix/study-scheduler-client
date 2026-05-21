// Small colored section label that separates lists on M3 screens.
import { Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { md3Light } from '../theme'

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
