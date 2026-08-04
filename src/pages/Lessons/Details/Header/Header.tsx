import { m } from '@/paraglide/messages';
import { StatusPill } from '@/shared/ui';
import type { Lesson, LessonSeries } from '@/shared/api';
import { fmtTime, fmtDayHeader } from '@/shared/lib';
import { lessonTimeChip } from '@/features/lessons/model';
import styles from './Header.module.scss';

interface HeaderProps {
  lesson: Lesson;
  series: LessonSeries | undefined;
  /** Ticking clock from the page — keeps the relative-time pill fresh. */
  now: Date;
}

/**
 * Centered status pill + time + date/series subtitle — see design-system.html
 * F2 lines 465-472. The pill mirrors the "StatusPill" etalon exactly:
 * ok+check_circle for Completed, plain neutral for Cancelled, accent+schedule
 * with a relative-time label otherwise.
 */
export function Header({ lesson, series, now }: HeaderProps) {
  const seriesSegment = series
    ? series.title
      ? m.lesson_header_recurring_titled({ title: series.title })
      : m.lesson_header_recurring_plain()
    : null;
  const subtitle = [fmtDayHeader(new Date(lesson.startUtc)), m.minutes({ count: lesson.durationMinutes }), seriesSegment]
    .filter((part): part is string => Boolean(part))
    .join(' · ');

  return (
    <div className={styles.header}>
      {lesson.status === 'Completed' ? (
        <StatusPill tone="ok" icon="check_circle" iconFilled>
          {m.status_completed()}
        </StatusPill>
      ) : lesson.status === 'Cancelled' ? (
        <StatusPill tone="neutral">{m.status_cancelled()}</StatusPill>
      ) : (
        <StatusPill tone="accent" icon="schedule">
          {lessonTimeChip(lesson, now)}
        </StatusPill>
      )}
      <span className={styles.time}>
        {fmtTime(lesson.startUtc)} – {fmtTime(lesson.endUtc)}
      </span>
      <span className={styles.subtitle}>{subtitle}</span>
    </div>
  );
}
