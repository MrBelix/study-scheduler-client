import { useNavigate } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, Cell } from '@/shared/ui';
import type { Lesson } from '@/shared/api';
import { routes } from '@/shared/routing';
import { fmtDayHeader, fmtTime, money } from '@/shared/lib';
import styles from './UpcomingSection.module.scss';

interface UpcomingSectionProps {
  /** Already filtered to this series, sorted and capped — see `SeriesViewPage`. */
  lessons: Lesson[];
  /** "вт і пт" — weekday hint for the trailing "Далі — щотижня …" row; omitted hides that row. */
  nextWeeklyDays: string | undefined;
}

/**
 * "НАЙБІЛЬШІ УРОКИ" — see design-system.html F6b lines 894-914. Rows only
 * exist to the fetch horizon (`SeriesViewPage`'s [today, +5 weeks] window), so
 * the trailing rhythm row is a plain caption rather than another navigable row.
 */
export function UpcomingSection({ lessons, nextWeeklyDays }: UpcomingSectionProps) {
  const navigate = useNavigate();
  if (lessons.length === 0 && !nextWeeklyDays) return null;

  return (
    <Section header={m.series_view_upcoming_header()}>
      {lessons.map((l) => (
        <Cell
          key={l.id}
          title={<span className={styles.title}>{`${fmtDayHeader(new Date(l.startUtc))} · ${fmtTime(l.startUtc)}`}</span>}
          value={money(l.price)}
          chevron
          onClick={() => navigate(routes.lessons.details(l.id))}
        />
      ))}
      {nextWeeklyDays && <Cell title={<span className={styles.hint}>{m.series_view_next_weekly({ days: nextWeeklyDays })}</span>} />}
    </Section>
  );
}
