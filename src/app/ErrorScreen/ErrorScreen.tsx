import { m } from '@/paraglide/messages';
import styles from './ErrorScreen.module.scss';

/** Root router fallback — catches render-time crashes so the app never white-screens. */
export function ErrorScreen() {
  const title = m.error_screen_title_generic();
  const hint = m.error_screen_hint_generic();

  return (
    <div className={styles['error-screen']}>
      <h1 className={styles['error-screen__title']}>{title}</h1>
      <p className={styles['error-screen__hint']}>{hint}</p>
    </div>
  );
}
