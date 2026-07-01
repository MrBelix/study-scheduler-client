import { useRouteError } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { ApiError } from '@/shared/api';
import styles from './ErrorScreen.module.scss';

/** Root router fallback — catches render-time crashes so the app never white-screens. */
export function ErrorScreen() {
  const error = useRouteError();
  const authExpired = error instanceof ApiError && error.isAuthExpired;

  const title = authExpired ? m.error_screen_title_auth() : m.error_screen_title_generic();
  const hint = authExpired ? m.error_screen_hint_auth() : m.error_screen_hint_generic();

  return (
    <div className={styles['error-screen']}>
      <h1 className={styles['error-screen__title']}>{title}</h1>
      <p className={styles['error-screen__hint']}>{hint}</p>
    </div>
  );
}
