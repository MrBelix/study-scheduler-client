import { m } from '@/paraglide/messages';
import { StatusPill } from '@/shared/ui';
import { money } from '@/shared/lib';
import { incomeTrend } from '@/features/reports/model';
import styles from './IncomeHero.module.scss';

interface IncomeHeroProps {
  actual: number;
  expected: number;
  previous: number;
  /** Formatted label of the previous period, e.g. "Липень 2026". */
  previousLabel: string;
}

/** "ОТРИМАНО" hero card — received income, trend vs. the previous period, plan progress. */
export function IncomeHero({ actual, expected, previous, previousLabel }: IncomeHeroProps) {
  const trend = incomeTrend(actual, previous);
  const collectedPct = expected > 0 ? Math.round(Math.min(1, actual / expected) * 100) : 0;

  return (
    <div className={styles['hero']}>
      <div className={styles['hero__top']}>
        <div className={styles['hero__main']}>
          <span className={styles['hero__label']}>{m.reports_stat_received()}</span>
          <span className={styles['hero__value']}>{money(actual)}</span>
        </div>
        {trend && (
          <StatusPill tone={trend.tone}>{`${trend.percent > 0 ? '+' : ''}${trend.percent}%`}</StatusPill>
        )}
      </div>

      <div className={styles['hero__progress']}>
        <div className={styles['hero__bar']}>
          <div className={styles['hero__fill']} style={{ width: `${collectedPct}%` }} />
        </div>
        <div className={styles['hero__progress-row']}>
          <span className={styles['hero__plan']}>{m.reports_hero_plan({ amount: money(expected) })}</span>
          <span className={styles['hero__collected']}>{m.reports_hero_collected({ percent: collectedPct })}</span>
        </div>
      </div>

      <div className={styles['hero__sep']} />

      <div className={styles['hero__previous']}>
        <span className={styles['hero__previous-label']}>{previousLabel}</span>
        <span className={styles['hero__previous-value']}>{money(previous)}</span>
      </div>
    </div>
  );
}
