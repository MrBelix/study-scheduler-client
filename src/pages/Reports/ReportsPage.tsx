import { useSearchParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { SegmentedControl, EmptyState, StatCard } from '@/shared/ui';
import type { SegmentItem } from '@/shared/ui';
import type { DashboardPeriodKind } from '@/shared/api';
import { useDashboard } from '@/features/reports/queries';
import {
  periodStart,
  shiftPeriod,
  fmtPeriodLabel,
  debtorsCountLabel,
  lessonsCountLabel,
  fmtHours,
} from '@/features/reports/model';
import { cx, dateKey, money } from '@/shared/lib';
import { PeriodNav } from './PeriodNav/PeriodNav';
import { IncomeHero } from './IncomeHero/IncomeHero';
import { DebtorsCard } from './DebtorsCard/DebtorsCard';
import { LessonsChart } from './LessonsChart/LessonsChart';
import { PerStudentCard } from './PerStudentCard/PerStudentCard';
import { MoneySkeleton } from './MoneySkeleton/MoneySkeleton';
import styles from './ReportsPage.module.scss';

function isPeriod(value: string | null): value is DashboardPeriodKind {
  return value === 'week' || value === 'month' || value === 'quarter';
}

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const periodParam = searchParams.get('period');
  const period: DashboardPeriodKind = isPeriod(periodParam) ? periodParam : 'month';
  const anchorParam = searchParams.get('anchor');
  const parsedAnchor = anchorParam ? new Date(`${anchorParam}T00:00`) : new Date();
  const anchorBase = Number.isNaN(parsedAnchor.getTime()) ? new Date() : parsedAnchor;
  // Canonicalized to the period's own start, so the URL and the "is this the
  // current period?" check below both compare on the same stable day key.
  const periodAnchor = periodStart(period, anchorBase);
  const anchorKey = dateKey(periodAnchor);

  const goTo = (newPeriod: DashboardPeriodKind, newAnchor: Date) =>
    setSearchParams({ period: newPeriod, anchor: dateKey(periodStart(newPeriod, newAnchor)) }, { replace: true });

  const { data, isPending, isError, refetch } = useDashboard(period, anchorKey);

  const isCurrentPeriod = dateKey(periodStart(period, new Date())) === anchorKey;

  const segItems: SegmentItem<DashboardPeriodKind>[] = [
    { label: m.reports_period_week(), value: 'week' },
    { label: m.reports_period_month(), value: 'month' },
    { label: m.reports_period_quarter(), value: 'quarter' },
  ];

  if (isPending) return <MoneySkeleton />;

  if (isError) {
    return (
      <EmptyState
        variant="secondary"
        icon="cloud_off"
        tone="warn"
        title={m.error_generic()}
        action={{ label: m.retry(), onClick: () => refetch() }}
      />
    );
  }

  const previousAnchor = shiftPeriod(period, periodAnchor, -1);
  const noLessons = data.lessons.completed + data.lessons.scheduled + data.lessons.cancelled === 0;
  const isEmpty = noLessons && data.debt.total === 0;
  const hasDebt = data.debt.total > 0;

  return (
    <div className={styles['money']}>
      <div className={styles['money__segment']}>
        {/* Switching tabs resets the anchor to today's period — arrows inside
            a period are the only way to move it away from "now". */}
        <SegmentedControl items={segItems} value={period} onChange={(p) => goTo(p, new Date())} />
      </div>

      <PeriodNav
        label={fmtPeriodLabel(period, periodAnchor)}
        onPrev={() => goTo(period, shiftPeriod(period, periodAnchor, -1))}
        onNext={() => goTo(period, shiftPeriod(period, periodAnchor, 1))}
        nextDisabled={isCurrentPeriod}
      />

      {isEmpty ? (
        <EmptyState
          variant="primary"
          icon="account_balance_wallet"
          tone="accent"
          title={m.reports_empty()}
          description={m.reports_empty_desc()}
        />
      ) : (
        <>
          <IncomeHero
            actual={data.income.actual}
            expected={data.income.expected}
            previous={data.income.previous}
            previousLabel={fmtPeriodLabel(period, previousAnchor)}
          />

          <div className={cx(styles['money__grid'], !hasDebt && styles['money__grid--single'])}>
            {hasDebt && (
              <StatCard
                tone="warn"
                label={m.reports_stat_outstanding()}
                value={money(data.debt.total)}
                valueColor="var(--ds-color-warn)"
                caption={debtorsCountLabel(data.debt.debtors.length)}
                captionColor="var(--ds-color-warn)"
              />
            )}
            <StatCard
              label={m.reports_load_label()}
              value={m.reports_hours({ hours: fmtHours(data.weeklyLoad.hours) })}
              caption={m.reports_load_caption({ lessons: lessonsCountLabel(data.weeklyLoad.lessonsInPeriod) })}
            />
          </div>

          {data.debt.debtors.length > 0 && <DebtorsCard debtors={data.debt.debtors} />}

          <LessonsChart
            period={period}
            completed={data.lessons.completed}
            scheduled={data.lessons.scheduled}
            cancelled={data.lessons.cancelled}
            buckets={data.buckets}
            todayKey={dateKey(new Date())}
          />

          {data.perStudent.length > 0 && <PerStudentCard perStudent={data.perStudent} />}
        </>
      )}
    </div>
  );
}
