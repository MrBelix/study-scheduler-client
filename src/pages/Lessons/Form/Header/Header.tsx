import { m } from '@/paraglide/messages';
import styles from './Header.module.scss';

/** F8 page title — see design-system.html "Створення уроку" lines 1088-1091. */
export function Header() {
  return (
    <div className={styles.header}>
      <span className={styles.title}>{m.lesson_new_title()}</span>
      <span className={styles.subtitle}>{m.lesson_new_subtitle()}</span>
    </div>
  );
}
