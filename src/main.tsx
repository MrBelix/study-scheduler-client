import './mockEnv';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import './app/styles/global.scss';
import { App } from './app/App';
import { init } from './init';
import { initLocale } from './shared/i18n';

// In-memory API for developing without the backend (see .env.development).
// The condition is statically false in production, so the module is tree-shaken.
if (import.meta.env.DEV && import.meta.env.VITE_API_MOCK) {
  const { installMockApi } = await import('./mockApi');
  installMockApi();
}

init({
  debug: import.meta.env.DEV,
}).then(() => {
  initLocale();
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
