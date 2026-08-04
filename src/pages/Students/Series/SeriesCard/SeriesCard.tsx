import { useNavigate } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Icon, Tile } from '@/shared/ui';
import type { LessonSeries } from '@/shared/api';
import { routes } from '@/shared/routing';
import { getAppLocale } from '@/shared/i18n';
import { weekdaysLabel } from '@/features/lessons/model';
import { money, formatDayMonth, cx, pluralUk } from '@/shared/lib';
import styles from './SeriesCard.module.scss';

/** Whole weeks between today and a series' end date, floored at 1. */
function weeksRemaining(endDate: string): number {
  const end = new Date(`${endDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
  return Math.max(1, Math.round(days / 7));
}

function weeksLeftLabel(weeks: number): string {
  if (getAppLocale() === 'uk') {
    return pluralUk(weeks, {
      one: m.series_weeks_left_one({ weeks }),
      few: m.series_weeks_left_few({ weeks }),
      many: m.series_weeks_left_many({ weeks }),
    });
  }
  return weeks === 1 ? m.series_weeks_left_one({ weeks }) : m.series_weeks_left_many({ weeks });
}

interface SeriesCardProps {
  series: LessonSeries;
  /** Student's default rate — price fallback when the series has no override. */
  rate: number;
}

/** One recurring-series card — slot/price summary and status chip, navigates to its own F6b page. */
export function SeriesCard({ series, rate }: SeriesCardProps) {
  const navigate = useNavigate();
  const slot = m.series_slot({ days: weekdaysLabel(series.weekdays), time: series.startTimeLocal.slice(0, 5) });
  const title = series.title ?? slot;
  const subtitle = `${slot} · ${m.minutes({ count: series.durationMinutes })} · ${money(series.price ?? rate)}`;

  return (
    <button type="button" className={styles['card']} onClick={() => navigate(routes.lessons.seriesView(series.id))}>
      <div className={styles['cardTop']}>
        <Tile tone="accent-soft" icon="event_repeat" />
        <div className={styles['cardText']}>
          <span className={styles['cardTitle']}>{title}</span>
          <span className={styles['cardSubtitle']}>{subtitle}</span>
        </div>
        <Icon name="chevron_right" size={20} className={styles['cardChevron']} />
      </div>
      <div className={styles['cardStatus']}>
        {series.endDate ? (
          <>
            <span className={cx(styles['chip'], styles['chip--warn'])}>
              <span className={styles['dot']} />
              {m.series_status_until({ date: formatDayMonth(series.endDate) })}
            </span>
            <span className={styles['caption']}>{weeksLeftLabel(weeksRemaining(series.endDate))}</span>
          </>
        ) : (
          <>
            <span className={cx(styles['chip'], styles['chip--ok'])}>
              <span className={styles['dot']} />
              {m.series_status_active()}
            </span>
            <span className={styles['caption']}>{m.series_caption_open_ended()}</span>
          </>
        )}
      </div>
    </button>
  );
}
