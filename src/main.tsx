import './mockEnv';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import './app/styles/global.scss';
import { App } from './app/App';
import { init } from './init';
import { initLocale } from './shared/i18n';

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
