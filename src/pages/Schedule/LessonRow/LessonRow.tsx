import { m } from '@/paraglide/messages';
import { Avatar, Icon } from '@/shared/ui';
import type { Lesson, LessonSeries, Student } from '@/shared/api';
import { cx, fmtTime, money } from '@/shared/lib';
import { weekdaysLabel } from '@/features/lessons/model';
import styles from './LessonRow.module.scss';

interface LessonRowProps {
  lesson: Lesson;
  student: Student | undefined;
  series: LessonSeries | undefined;
  onClick: () => void;
}

/** One schedule-day row — see design-system.html "LessonRow" (F1 lines 399-431). */
export function LessonRow({ lesson, student, series, onClick }: LessonRowProps) {
  const cancelled = lesson.status === 'Cancelled';
  const completed = lesson.status === 'Completed';
  const past = new Date(lesson.startUtc).getTime() < new Date().getTime();
  const muted = cancelled || completed || past;
  const studentName = student?.name ?? m.value_none();

  // A series without its own title falls back to its weekday/time slot —
  // same convention as StudentDetailsPage's series summary.
  const seriesTitle = series
    ? (series.title ?? m.series_slot({ days: weekdaysLabel(series.weekdays), time: series.startTimeLocal.slice(0, 5) }))
    : null;

  return (
    <button type="button" className={styles['row']} onClick={onClick}>
      <div className={styles['timeCol']}>
        <span className={cx(styles['time'], muted && styles['time--muted'], cancelled && styles['time--strike'])}>
          {fmtTime(lesson.startUtc)}
        </span>
        <span className={styles['duration']}>{m.minutes({ count: lesson.durationMinutes })}</span>
      </div>
      <div className={styles['sep']} />
      <div className={styles['content']}>
        <div className={styles['who']}>
          <Avatar name={studentName} size={24} />
          <span className={styles['name']}>{studentName}</span>
        </div>
        {cancelled ? (
          <span className={styles['status']}>{m.status_cancelled()}</span>
        ) : completed ? (
          <span className={cx(styles['status'], styles['status--ok'])}>
            <Icon name="check_circle" size={14} filled />
            {lesson.isPaid ? m.schedule_row_completed_paid() : m.status_completed()}
          </span>
        ) : seriesTitle ? (
          <span className={styles['status']}>
            <Icon name="event_repeat" size={14} />
            {m.schedule_row_recurring({ title: seriesTitle })}
          </span>
        ) : lesson.topic ? (
          <span className={styles['status']}>{lesson.topic}</span>
        ) : null}
      </div>
      <span className={cx(styles['price'], muted && styles['price--muted'])}>{money(lesson.price)}</span>
    </button>
  );
}
