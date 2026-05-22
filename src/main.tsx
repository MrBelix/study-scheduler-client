import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { App } from './app/App';
import { init } from './init';

init({
  debug: import.meta.env.DEV,
  mockForMacOS: false,
}).then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
