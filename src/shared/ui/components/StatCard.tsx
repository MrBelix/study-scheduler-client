// M3 stat card — 16px rounded surface with an overline label, a large
// tabular number, and an optional sub-line. Three tonal variants for
// neutral / positive (tertiary) / negative (error) states.
import { Box, Typography, type SxProps } from '@mui/material'
import { md3Light } from '../theme'

export type StatCardVariant = 'default' | 'tertiary' | 'error'

const bg: Record<StatCardVariant, string> = {
  default:  md3Light.surfaceContainerLow,
  tertiary: md3Light.tertiaryContainer,
  error:    md3Light.errorContainer,
}
const fg: Record<StatCardVariant, string> = {
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
  <Box sx={{ borderRadius: '16px', padding: '16px', backgroundColor: bg[variant], color: fg[variant], ...sx }}>
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
