import { m } from '@/paraglide/messages';
import { Icon } from '@/shared/ui';
import type { Lesson, LessonSeries } from '@/shared/api';
import { cx, fmtTime, money } from '@/shared/lib';
import { weekdaysLabel, weekdayShortLabel } from '@/features/lessons/model';
import styles from './HistoryRow.module.scss';

interface HistoryRowProps {
  lesson: Lesson;
  /** Resolved from the tutor's full series list (`useSeriesList`) — a history row can reference an
   * already-ended series that `StudentDetails.series` (current-only) wouldn't carry. */
  series: LessonSeries | undefined;
  onClick: () => void;
}

/** One row of the F7 history/upcoming list — see design-system.html F7 lines 984-1023. */
export function HistoryRow({ lesson, series, onClick }: HistoryRowProps) {
  const cancelled = lesson.status === 'Cancelled';
  const completed = lesson.status === 'Completed';
  const past = new Date(lesson.startUtc).getTime() < new Date().getTime();
  const muted = cancelled || completed || past;
  // Completed+paid trades the price for the checkmark (etalon final.html 1030-1038) — the money is
  // settled, so the check icon alone says so; every other row (unpaid, planned, cancelled) keeps
  // showing the price.
  const paidAndCompleted = completed && lesson.isPaid;

  const start = new Date(lesson.startUtc);
  const seriesTitle = series
    ? (series.title ?? m.series_slot({ days: weekdaysLabel(series.weekdays), time: series.startTimeLocal.slice(0, 5) }))
    : null;

  const hasNote = Boolean(lesson.description);

  // What this occurrence was about, shared by the plain-scheduled and completed-paid cases alike —
  // the paid one still says what it was, the checkmark just also signals "settled". A note on the
  // lesson appends a hint so a past occurrence's note isn't invisible from the list (see etalon F7
  // line 1034, 'Системи рівнянь · є нотатка').
  const context = seriesTitle ? (
    <>
      <Icon name="event_repeat" size={14} />
      {m.schedule_row_recurring({ title: seriesTitle })}
      {hasNote && ` · ${m.student_history_row_note()}`}
    </>
  ) : lesson.topic ? (
    hasNote ? `${lesson.topic} · ${m.student_history_row_note()}` : lesson.topic
  ) : hasNote ? (
    m.student_history_row_note()
  ) : null;

  return (
    <button type="button" className={styles.row} onClick={onClick}>
      <div className={styles.dateCol}>
        <span className={cx(styles.day, muted && styles['day--muted'])}>{start.getDate()}</span>
        <span className={styles.weekday}>{weekdayShortLabel((start.getDay() + 6) % 7)}</span>
      </div>
      <div className={styles.content}>
        <span className={cx(styles.time, muted && styles['time--muted'], cancelled && styles['time--strike'])}>
          {fmtTime(lesson.startUtc)} – {fmtTime(lesson.endUtc)}
        </span>
        {cancelled ? (
          <span className={styles.sub}>{m.status_cancelled()}</span>
        ) : completed && !lesson.isPaid ? (
          <span className={cx(styles.sub, styles['sub--warn'])}>{m.status_unpaid()}</span>
        ) : context ? (
          <span className={styles.sub}>{context}</span>
        ) : null}
      </div>
      {paidAndCompleted ? (
        <Icon name="check_circle" size={19} filled className={styles.checkIcon} />
      ) : (
        <span className={cx(styles.price, muted && styles['price--muted'])}>{money(lesson.price)}</span>
      )}
      <Icon name="chevron_right" size={20} className={styles.chevron} />
    </button>
  );
}
