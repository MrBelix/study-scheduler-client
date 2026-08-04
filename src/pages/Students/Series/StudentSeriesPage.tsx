import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Placeholder, EmptyState } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { ApiError } from '@/shared/api';
import { routes } from '@/shared/routing';
import { getAppLocale } from '@/shared/i18n';
import { useStudentDetails } from '@/features/students/queries';
import { pluralUk } from '@/shared/lib';
import { SeriesCard } from './SeriesCard/SeriesCard';
import { AddSeriesRow } from './AddSeriesRow/AddSeriesRow';
import { SeriesSkeleton } from './SeriesSkeleton/SeriesSkeleton';
import styles from './StudentSeriesPage.module.scss';

/** "2 набори" — header subtitle count, locale-aware (uk has 3 plural forms, en just 2). */
function seriesCountLabel(count: number): string {
  if (getAppLocale() === 'uk') {
    return pluralUk(count, {
      one: m.student_series_count_one({ count }),
      few: m.student_series_count_few({ count }),
      many: m.student_series_count_many({ count }),
    });
  }
  return count === 1 ? m.student_series_count_one({ count }) : m.student_series_count_many({ count });
}

export function StudentSeriesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isPending, error, refetch } = useStudentDetails(id);
  // 404 = the student is genuinely gone; anything else is a transient failure.
  const notFound = error instanceof ApiError && error.status === 404;
  const isError = Boolean(error) && !notFound;

  useBackButton(() => navigate(routes.students.details(id!)));

  if (isPending) return <SeriesSkeleton />;

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

  if (!student) {
    return <Placeholder glyph="🔍" title={m.student_not_found()} />;
  }

  return (
    <div className={styles['series']}>
      <div className={styles['series__header']}>
        <span className={styles['series__title']}>{m.student_series_label()}</span>
        <span className={styles['series__hint']}>
          {student.name} · {seriesCountLabel(student.series.length)}
        </span>
      </div>

      {student.series.length === 0 && (
        <div className={styles['series__empty']}>
          <EmptyState variant="secondary" icon="event_repeat" title={m.series_empty_title()} />
        </div>
      )}

      <div className={styles['series__list']}>
        {student.series.map((s) => (
          <SeriesCard key={s.id} series={s} rate={student.rate} />
        ))}
        <AddSeriesRow studentId={student.id} />
      </div>
    </div>
  );
}
