import { m } from '@/paraglide/messages';
import type { LessonConflict } from '@/shared/api';
import { formatDate, fmtTime } from '@/shared/lib';
import styles from './ConflictList.module.scss';

/** The 409 payload rendered for the user: when exactly the time is taken. */
export function ConflictList({ conflicts }: { conflicts: LessonConflict[] }) {
  return (
    <div className={styles['conflicts']}>
      <div className={styles['conflicts__title']}>{m.lesson_form_conflicts_title()}</div>
      {conflicts.map((c, i) => (
        <div key={i} className={styles['conflicts__item']}>
          {formatDate(c.startUtc)} · {fmtTime(c.startUtc)}–{fmtTime(c.endUtc)}
          {c.seriesTitle ? ` · ${c.seriesTitle}` : ''}
        </div>
      ))}
    </div>
  );
}
