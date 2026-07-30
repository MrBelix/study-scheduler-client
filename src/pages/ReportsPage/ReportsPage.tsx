import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, Cell, Placeholder, Skeleton, SegmentedControl, StatCard } from '@/shared/ui';
import type { SegmentItem } from '@/shared/ui';
import { useReportSummary } from '@/features/reports/queries';
import { periodStart, periodEnd, shiftPeriod, fmtPeriodLabel, type Period } from '@/features/reports/model';
import { money, fmt, dateKey } from '@/shared/lib';
import styles from './ReportsPage.module.scss';

function isPeriod(value: string | null): value is Period {
  return value === 'week' || value === 'month' || value === 'quarter';
}

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Period + start live in the URL so returning to this page (or reloading)
  // restores the same view instead of snapping back to today — same pattern
  // as SchedulePage's `week` param.
  const periodParam = searchParams.get('period');
  const period: Period = isPeriod(periodParam) ? periodParam : 'week';
  const startParam = searchParams.get('start');
  const start = startParam
    ? periodStart(period, new Date(`${startParam}T00:00`))
    : periodStart(period, new Date());

  const goTo = (newPeriod: Period, newStart: Date) =>
    setSearchParams({ period: newPeriod, start: dateKey(newStart) }, { replace: true });

  // Stable ISO bounds for the query key: [start, exclusive end) local.
  const fromIso = useMemo(() => start.toISOString(), [start]);
  const toIso = useMemo(() => periodEnd(period, start).toISOString(), [period, start]);

  const { data, isPending, isError } = useReportSummary(fromIso, toIso);

  const segItems: SegmentItem<Period>[] = [
    { label: m.reports_period_week(), value: 'week' },
    { label: m.reports_period_month(), value: 'month' },
    { label: m.reports_period_quarter(), value: 'quarter' },
  ];

  const isEmptyPeriod = data != null && data.totalCount === 0;

  return (
    <div className={styles['reports']}>
      <div className={styles['reports__nav']}>
        <button
          type="button"
          className={styles['reports__nav-arrow']}
          aria-label={m.reports_prev()}
          onClick={() => goTo(period, shiftPeriod(period, start, -1))}
        >
          ‹
        </button>
        <button
          type="button"
          className={styles['reports__nav-label']}
          title={m.week_today()}
          onClick={() => goTo(period, periodStart(period, new Date()))}
        >
          {fmtPeriodLabel(period, start)}
        </button>
        <button
          type="button"
          className={styles['reports__nav-arrow']}
          aria-label={m.reports_next()}
          onClick={() => goTo(period, shiftPeriod(period, start, 1))}
        >
          ›
        </button>
      </div>

      <div className={styles['reports__segment']}>
        <SegmentedControl items={segItems} value={period} onChange={(p) => goTo(p, periodStart(p, start))} />
      </div>

      {isError ? (
        <div className={styles['reports__status']}>{m.error_generic()}</div>
      ) : isPending ? (
        <>
          <div className={styles['reports__grid']}>
            {Array.from({ length: 4 }, (_, i) => (
              <StatCard key={i} label={<Skeleton width="50%" height={10} />} value={<Skeleton width="70%" />} />
            ))}
          </div>
          <Section>
            {Array.from({ length: 3 }, (_, i) => (
              <Cell key={i} title={<Skeleton width="40%" />} value={<Skeleton width={64} />} />
            ))}
          </Section>
        </>
      ) : isEmptyPeriod ? (
        <Placeholder glyph="📊" title={m.reports_empty()} description={m.reports_empty_desc()} />
      ) : data ? (
        <>
          <div className={styles['reports__grid']}>
            <StatCard
              label={m.reports_stat_received()}
              value={money(data.actualIncome)}
              valueColor="var(--ds-color-success)"
            />
            <StatCard
              label={m.reports_stat_outstanding()}
              value={money(data.outstandingIncome)}
              valueColor={data.outstandingIncome > 0 ? 'var(--ds-color-warning)' : undefined}
            />
            <StatCard label={m.status_completed()} value={fmt(data.completedCount)} />
            <StatCard label={m.status_cancelled()} value={fmt(data.cancelledCount)} />
          </div>

          <Section header={m.reports_section_income()}>
            <Cell title={m.reports_income_planned()} value={money(data.plannedIncome)} />
            <Cell
              title={m.reports_income_actual()}
              value={money(data.actualIncome)}
              valueColor="var(--ds-color-success)"
            />
            <Cell
              title={m.reports_income_outstanding()}
              value={money(data.outstandingIncome)}
              valueColor={data.outstandingIncome > 0 ? 'var(--ds-color-warning)' : undefined}
            />
          </Section>

          <Section header={m.reports_section_lessons()}>
            <Cell title={m.reports_total()} value={fmt(data.totalCount)} />
            <Cell title={m.status_completed()} value={fmt(data.completedCount)} />
            <Cell title={m.status_scheduled()} value={fmt(data.upcomingCount)} />
            <Cell
              title={m.reports_unclosed()}
              value={fmt(data.unclosedCount)}
              valueColor={data.unclosedCount > 0 ? 'var(--ds-color-warning)' : undefined}
            />
            <Cell title={m.status_cancelled()} value={fmt(data.cancelledCount)} />
            <Cell title={m.reports_paid()} value={fmt(data.paidCount)} />
          </Section>
        </>
      ) : null}
    </div>
  );
}
