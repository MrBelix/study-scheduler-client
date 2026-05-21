// MUI theme that carries the MD3 design tokens from StudyScheduler's
// Material 3 prototype (md3.css). Indigo seed, Roboto Flex, M3 surface
// tonal stack, pill-shaped buttons.
import { createTheme } from '@mui/material/styles'

// MD3 color tokens — light scheme, ported 1:1 from the design's md3.css.
export const md3Light = {
  primary: '#4F46BB',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E1DFFF',
  onPrimaryContainer: '#110066',

  secondary: '#5D5C72',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E3DFF9',
  onSecondaryContainer: '#1A1A2C',

  tertiary: '#2F7D32',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#B6F0B6',
  onTertiaryContainer: '#002106',

  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',

  warning: '#B45309',
  warningContainer: '#FFE0B2',

  background: '#FBF8FF',
  onBackground: '#1B1B21',
  surface: '#FBF8FF',
  onSurface: '#1B1B21',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F5F2FA',
  surfaceContainer: '#EFEDF4',
  surfaceContainerHigh: '#E9E7EF',
  surfaceContainerHighest: '#E4E1E9',

  onSurfaceVariant: '#46464F',
  outline: '#777680',
  outlineVariant: '#C7C5D0',
} as const

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary:   { main: md3Light.primary,   contrastText: md3Light.onPrimary },
    secondary: { main: md3Light.secondary, contrastText: md3Light.onSecondary },
    success:   { main: md3Light.tertiary,  contrastText: md3Light.onTertiary },
    error:     { main: md3Light.error,     contrastText: md3Light.onError },
    warning:   { main: md3Light.warning,   contrastText: '#FFFFFF' },
    background: { default: md3Light.background, paper: md3Light.surface },
    text: { primary: md3Light.onSurface, secondary: md3Light.onSurfaceVariant },
    divider: md3Light.outlineVariant,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Roboto Flex", "Roboto", "Helvetica", "Arial", sans-serif',
    // M3 type scale
    h1: { fontSize: 57, lineHeight: '64px', fontWeight: 400, letterSpacing: '-0.25px' }, // display-large
    h2: { fontSize: 45, lineHeight: '52px', fontWeight: 400 },                            // display-medium
    h3: { fontSize: 36, lineHeight: '44px', fontWeight: 400 },                            // display-small
    h4: { fontSize: 32, lineHeight: '40px', fontWeight: 400 },                            // headline-large
    h5: { fontSize: 28, lineHeight: '36px', fontWeight: 400 },                            // headline-medium
    h6: { fontSize: 24, lineHeight: '32px', fontWeight: 400 },                            // headline-small
    subtitle1: { fontSize: 22, lineHeight: '28px', fontWeight: 400 },                     // title-large
    subtitle2: { fontSize: 16, lineHeight: '24px', fontWeight: 500, letterSpacing: '0.15px' }, // title-medium
    body1: { fontSize: 16, lineHeight: '24px', fontWeight: 400, letterSpacing: '0.5px' }, // body-large
    body2: { fontSize: 14, lineHeight: '20px', fontWeight: 400, letterSpacing: '0.25px' },// body-medium
    caption: { fontSize: 12, lineHeight: '16px', fontWeight: 400, letterSpacing: '0.4px' },// body-small
    button: { fontSize: 14, lineHeight: '20px', fontWeight: 500, letterSpacing: '0.1px', textTransform: 'none' }, // label-large
    overline: { fontSize: 11, lineHeight: '16px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }, // label-small
  },
  components: {
    // M3 pill buttons
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 9999, height: 40, paddingInline: 24, textTransform: 'none' },
        sizeLarge: { height: 56, fontSize: 16, paddingInline: 24 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { width: 40, height: 40, borderRadius: 9999 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 32,
          borderRadius: 8,
          border: `1px solid ${md3Light.outline}`,
          backgroundColor: 'transparent',
          color: md3Light.onSurfaceVariant,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: md3Light.secondaryContainer,
          color: md3Light.onSecondaryContainer,
          border: '1px solid transparent',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 4 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: md3Light.surfaceContainerLow,
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16 },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 500, letterSpacing: '0.1px' },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: { height: 80, backgroundColor: md3Light.surfaceContainer, paddingBlock: 12 },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: md3Light.onSurfaceVariant,
          paddingTop: 0,
          gap: 4,
          minWidth: 0,
          '&.Mui-selected': { color: md3Light.onSurface, paddingTop: 0 },
          '& .MuiBottomNavigationAction-label': {
            fontSize: 12,
            lineHeight: '16px',
            fontWeight: 500,
            letterSpacing: '0.5px',
            marginTop: 4,
            '&.Mui-selected': { fontSize: 12 },
          },
        },
      },
    },
  },
})
