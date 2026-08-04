import { m } from '@/paraglide/messages';
import { SectionLabel, FieldError } from '@/shared/ui';
import { cx } from '@/shared/lib';
import { WEEKDAY_FLAGS, weekdayShortLabel } from '@/features/lessons/model';
import styles from './WeekdaysRow.module.scss';

interface WeekdaysRowProps {
  weekdays: Set<string>;
  onToggle: (flag: string) => void;
  error?: string;
}

/** Weekday squares — same shape as F8's `RepeatSection`, reused here for the pivot edit. */
export function WeekdaysRow({ weekdays, onToggle, error }: WeekdaysRowProps) {
  return (
    <div className={styles.section}>
      <SectionLabel>{m.lesson_form_weekdays()}</SectionLabel>
      <div className={styles.weekdays}>
        {WEEKDAY_FLAGS.map((flag, i) => (
          <button
            key={flag}
            type="button"
            className={cx(styles.weekday, weekdays.has(flag) && styles['weekday--active'])}
            onClick={() => onToggle(flag)}
          >
            {weekdayShortLabel(i)}
          </button>
        ))}
      </div>
      {error && <FieldError message={error} />}
    </div>
  );
}
