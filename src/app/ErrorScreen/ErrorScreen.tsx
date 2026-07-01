import { useRouteError } from 'react-router-dom';
import { ApiError } from '@/shared/api';
import styles from './ErrorScreen.module.scss';

/** Root router fallback — catches render-time crashes so the app never white-screens. */
export function ErrorScreen() {
  const error = useRouteError();

  const title = error instanceof ApiError && error.isAuthExpired
    ? 'Сесія застаріла'
    : 'Щось пішло не так';

  const hint = error instanceof ApiError && error.isAuthExpired
    ? 'Відкрийте застосунок у Telegram знову.'
    : 'Спробуйте перезапустити застосунок.';

  return (
    <div className={styles['error-screen']}>
      <h1 className={styles['error-screen__title']}>{title}</h1>
      <p className={styles['error-screen__hint']}>{hint}</p>
    </div>
  );
}
