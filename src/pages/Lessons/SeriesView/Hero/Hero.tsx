import { m } from '@/paraglide/messages';
import { Icon, Skeleton } from '@/shared/ui';
import type { LessonSeries } from '@/shared/api';
import { cx, formatDayMonth, money } from '@/shared/lib';
import { weekdaysLabel } from '@/features/lessons/model';
import styles from './Hero.module.scss';

interface HeroProps {
  series: LessonSeries;
  studentName: string | undefined;
  /** Student's default rate — price fallback when the series has no override. */
  rate: number | undefined;
  /**
   * Whether the student query (source of `rate`) is still loading — while true, a series with no
   * price override shows a skeleton instead of a rate it doesn't have yet. Once the query settles
   * (success or error) this is false: on error `rate` stays `undefined`, which the render below
   * already treats as "omit the price segment" — no separate error flag needed.
   */
  rateLoading: boolean;
}

/**
 * Centered icon + title + rhythm line + status chip — see design-system.html
 * F6b lines 884-892. `title` falls back to the slot text ("вт, пт о 18:00")
 * when the series has none, same convention as `SeriesCard`.
 */
export function Hero({ series, studentName, rate, rateLoading }: HeroProps) {
  const slot = m.series_slot({ days: weekdaysLabel(series.weekdays), time: series.startTimeLocal.slice(0, 5) });
  const title = series.title ?? slot;
  const baseSubtitle = [studentName, slot, m.minutes({ count: series.durationMinutes })]
    .filter((part): part is string => Boolean(part))
    .join(' · ');

  // The series' own price override needs no query; otherwise it rides the student's rate — while
  // that's loading show a skeleton instead of flashing/permanently reading "0 ₴", and on a failed
  // student fetch (rate stays undefined once loading settles) omit the price segment entirely
  // rather than show a stale or wrong number.
  const price = series.price ?? rate;
  const priceLoading = series.price == null && rateLoading;

  return (
    <div className={styles.hero}>
      <span className={styles.icon}>
        <Icon name="event_repeat" size={26} />
      </span>
      <span className={styles.title}>{title}</span>
      <span className={styles.subtitle}>
        {baseSubtitle}
        {priceLoading && (
          <span className={styles.pricePlaceholder}>
            {' · '}
            <Skeleton width={40} height={12} />
          </span>
        )}
        {!priceLoading && price != null && ` · ${money(price)}`}
      </span>
      {series.endDate ? (
        <span className={cx(styles.chip, styles['chip--warn'])}>
          <span className={styles.dot} />
          {m.series_status_until({ date: formatDayMonth(series.endDate) })}
        </span>
      ) : (
        <span className={cx(styles.chip, styles['chip--ok'])}>
          <span className={styles.dot} />
          {m.series_view_status_active()}
        </span>
      )}
    </div>
  );
}
