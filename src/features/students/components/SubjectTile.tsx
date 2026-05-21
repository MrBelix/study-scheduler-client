// 40×40 rounded tile with a subject's initial letter and a tonal M3
// container background (used in the Detail and Create pages).
import { Box } from '@mui/material'
import { md3Light } from '../../../shared/ui'

export type SubjectTint = 'primary' | 'tertiary' | 'neutral'

const tonalBg: Record<SubjectTint, string> = {
  primary:  md3Light.primaryContainer,
  tertiary: md3Light.tertiaryContainer,
  neutral:  md3Light.surfaceContainerHigh,
}
const tonalFg: Record<SubjectTint, string> = {
  primary:  md3Light.onPrimaryContainer,
  tertiary: md3Light.onTertiaryContainer,
  neutral:  md3Light.onSurfaceVariant,
}

export const SubjectTile = ({ letter, tint }: { letter: string; tint: SubjectTint }) => (
  <Box sx={{
    width: 40, height: 40, borderRadius: '12px',
    background: tonalBg[tint], color: tonalFg[tint],
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 500, fontSize: 16,
  }}>
    {letter}
  </Box>
)
