import { BrowserRouter, useRoutes } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { routes } from './routes'
import { theme } from '../shared/ui'
import '../app.css'

const Router = () => useRoutes(routes)

export const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  </ThemeProvider>
)
