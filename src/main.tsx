import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import './app/styles/global.scss';
import { App } from './app/App';
import { init } from './init';

init({
  debug: import.meta.env.DEV,
}).then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
