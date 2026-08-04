import { Icon } from '@/shared/ui';
import type { UnpaidLesson } from '@/shared/api';
import { cx, fmtTime, money } from '@/shared/lib';
import { weekdayShortLabel } from '@/features/lessons/model';
import styles from './DebtRow.module.scss';

interface DebtRowProps {
  lesson: UnpaidLesson;
  selected: boolean;
  onToggle: () => void;
}

/**
 * One unpaid-lesson row on the bulk-settle page. Date/time/price geometry
 * mirrors `HistoryRow`; the leading circle toggles selection (accent
 * checkmark), the same visual language as the profile sheet's `✓` picks.
 */
export function DebtRow({ lesson, selected, onToggle }: DebtRowProps) {
  const start = new Date(lesson.startUtc);
  const end = new Date(start.getTime() + lesson.durationMinutes * 60_000);

  return (
    <button type="button" className={styles.row} onClick={onToggle}>
      <span className={cx(styles.check, selected && styles['check--checked'])}>
        {selected && <Icon name="check" size={14} />}
      </span>
      <div className={styles.dateCol}>
        <span className={styles.day}>{start.getDate()}</span>
        <span className={styles.weekday}>{weekdayShortLabel((start.getDay() + 6) % 7)}</span>
      </div>
      <div className={styles.content}>
        <span className={styles.time}>
          {fmtTime(lesson.startUtc)} – {fmtTime(end.toISOString())}
        </span>
        {lesson.subject && <span className={styles.sub}>{lesson.subject}</span>}
      </div>
      <span className={styles.price}>{money(lesson.price)}</span>
    </button>
  );
}
