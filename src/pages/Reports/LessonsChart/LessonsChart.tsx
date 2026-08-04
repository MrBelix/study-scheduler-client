import { m } from '@/paraglide/messages';
import { Section } from '@/shared/ui';
import type { DashboardBucket, DashboardPeriodKind } from '@/shared/api';
import { cx, fmt } from '@/shared/lib';
import { buildBucketBars, lessonsHeaderLabel } from '@/features/reports/model';
import styles from './LessonsChart.module.scss';

interface LessonsChartProps {
  period: DashboardPeriodKind;
  completed: number;
  scheduled: number;
  cancelled: number;
  buckets: DashboardBucket[];
  todayKey: string;
}

/** "УРОКИ ЗА ..." — completed/scheduled/cancelled counters plus a per-bucket bar chart. */
export function LessonsChart({ period, completed, scheduled, cancelled, buckets, todayKey }: LessonsChartProps) {
  const bars = buildBucketBars(period, buckets, todayKey);

  return (
    <Section header={lessonsHeaderLabel(period)}>
      <div className={styles['card']}>
        <div className={styles['counts']}>
          <div className={styles['count']}>
            <span className={cx(styles['count__value'], styles['count__value--ok'])}>{fmt(completed)}</span>
            <span className={styles['count__label']}>{m.status_completed()}</span>
          </div>
          <div className={styles['count']}>
            <span className={styles['count__value']}>{fmt(scheduled)}</span>
            <span className={styles['count__label']}>{m.status_scheduled()}</span>
          </div>
          <div className={styles['count']}>
            <span className={cx(styles['count__value'], styles['count__value--soft'])}>{fmt(cancelled)}</span>
            <span className={styles['count__label']}>{m.status_cancelled()}</span>
          </div>
        </div>

        <div className={styles['chart']}>
          {bars.map((bar) => (
            <div key={bar.key} className={styles['bar-col']}>
              <div
                className={styles['bar']}
                style={{
                  height: bar.heightPx,
                  background: `color-mix(in srgb, var(--ds-color-${bar.tone}) ${Math.round(bar.opacity * 100)}%, transparent)`,
                }}
              />
              <span className={cx(styles['bar-label'], bar.emphasize && styles['bar-label--emphasis'])}>
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
