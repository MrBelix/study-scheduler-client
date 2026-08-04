import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Placeholder, EmptyState } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { ApiError } from '@/shared/api';
import type { LessonSeries } from '@/shared/api';
import { routes } from '@/shared/routing';
import { addDays } from '@/shared/lib';
import { useStudentDetails } from '@/features/students/queries';
import { useLessonSeries, useLessons } from '@/features/lessons/queries';
import { weekdaysLabel, isSeriesCancellable, isSeriesCurrent } from '@/features/lessons/model';
import { Hero } from './Hero/Hero';
import { UpcomingSection } from './UpcomingSection/UpcomingSection';
import { ActionsSection } from './ActionsSection/ActionsSection';
import { EndDateSheet } from './EndDateSheet/EndDateSheet';
import { CancelSeriesSheet } from './CancelSeriesSheet/CancelSeriesSheet';
import { SeriesViewSkeleton } from './SeriesViewSkeleton/SeriesViewSkeleton';
import styles from './SeriesViewPage.module.scss';

// How far ahead "НАЙБЛИЖЧІ УРОКИ" looks — the rows only exist to this horizon
// (a presentation window, not a data limit: every lesson through the 4-month
// planning horizon is already a physical row).
const UPCOMING_WEEKS = 5;
const UPCOMING_ROWS = 3;

/**
 * F6b — one recurring set's own page: `/lessons/series/:id`. Reached from
 * `StudentSeriesPage`'s `SeriesCard`; "Змінити" routes on to the full-edit
 * form (`SeriesEditPage`), "Закінчити датою"/"Скасувати" open their own sheets
 * right here.
 */
export function SeriesViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: series, isPending, error, refetch } = useLessonSeries(id);
  // 404 = the series is genuinely gone; anything else is a transient failure.
  const notFound = error instanceof ApiError && error.status === 404;
  const isError = Boolean(error) && !notFound;

  // Back goes to the student's own series list once we know which student
  // this series belongs to; before that (still loading, or it never
  // resolves) there's nothing to derive it from, so fall back to the schedule.
  useBackButton(() => navigate(series ? routes.students.series(series.studentId) : routes.schedule()));

  if (isPending) return <SeriesViewSkeleton />;

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

  if (!series) {
    return <Placeholder glyph="🔍" title={m.series_not_found()} />;
  }

  return <SeriesView series={series} />;
}

function SeriesView({ series }: { series: LessonSeries }) {
  const navigate = useNavigate();
  const { data: student, isPending: studentPending } = useStudentDetails(series.studentId);
  const [sheet, setSheet] = useState<'end' | 'cancel' | null>(null);

  const now = useMemo(() => new Date(), []);
  const nowIso = useMemo(() => now.toISOString(), [now]);
  const fromIso = nowIso;
  const toIso = useMemo(() => addDays(now, UPCOMING_WEEKS * 7).toISOString(), [now]);
  const { data: lessons } = useLessons(fromIso, toIso, series.studentId);

  const upcoming = (lessons ?? [])
    .filter((l) => l.seriesId === series.id && l.status === 'Scheduled' && l.startUtc >= nowIso)
    .sort((a, b) => a.startUtc.localeCompare(b.startUtc))
    .slice(0, UPCOMING_ROWS);

  const cancellable = isSeriesCancellable(series);
  const seriesLabel =
    series.title ?? m.series_slot({ days: weekdaysLabel(series.weekdays), time: series.startTimeLocal.slice(0, 5) });

  return (
    <div className={styles.page}>
      <Hero series={series} studentName={student?.name} rate={student?.rate} rateLoading={studentPending} />

      <UpcomingSection
        lessons={upcoming}
        nextWeeklyDays={isSeriesCurrent(series) ? weekdaysLabel(series.weekdays) : undefined}
      />

      <ActionsSection
        seriesLabel={seriesLabel}
        cancellable={cancellable}
        onEdit={() => navigate(routes.lessons.seriesEdit(series.id))}
        onEnd={() => setSheet('end')}
        onCancel={() => setSheet('cancel')}
      />

      {sheet === 'end' && <EndDateSheet series={series} onClose={() => setSheet(null)} />}
      {sheet === 'cancel' && (
        <CancelSeriesSheet
          seriesId={series.id}
          seriesLabel={seriesLabel}
          onClose={() => setSheet(null)}
          onCancelled={() => navigate(routes.students.series(series.studentId))}
        />
      )}
    </div>
  );
}
