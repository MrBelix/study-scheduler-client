import { m } from '@/paraglide/messages';
import type { LessonSeries } from '@/shared/api';
import { weekdaysLabel } from '@/features/lessons/model';
import styles from './Header.module.scss';

interface HeaderProps {
  series: LessonSeries;
  studentName: string | undefined;
}

/** Page title — the series' own display name, student as context underneath. */
export function Header({ series, studentName }: HeaderProps) {
  const slot = m.series_slot({ days: weekdaysLabel(series.weekdays), time: series.startTimeLocal.slice(0, 5) });
  const title = series.title ?? slot;
  return (
    <div className={styles.header}>
      <span className={styles.title}>{title}</span>
      {studentName && <span className={styles.subtitle}>{studentName}</span>}
    </div>
  );
}
