import '@telegram-apps/telegram-ui/dist/styles.css'
import './app.css'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { AppRoot } from '@telegram-apps/telegram-ui';
import { routes } from "./routes";

const Router = () => useRoutes(routes);

export const App = () => (
<AppRoot>
  <BrowserRouter>
    <Router />
  </BrowserRouter>
</AppRoot>)
