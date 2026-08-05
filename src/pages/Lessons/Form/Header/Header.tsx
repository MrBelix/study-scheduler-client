import { m } from '@/paraglide/messages';
import styles from './Header.module.scss';

/**
 * F8 page title — see design-system.html "Створення уроку" lines 1088-1091.
 * `ready` mirrors the form's own submit-enabled check — the reassuring
 * "everything's filled in" subtitle only applies once that's actually true.
 */
export function Header({ ready }: { ready: boolean }) {
  return (
    <div className={styles.header}>
      <span className={styles.title}>{m.lesson_new_title()}</span>
      <span className={styles.subtitle}>{ready ? m.lesson_new_subtitle() : m.lesson_new_subtitle_incomplete()}</span>
    </div>
  );
}
