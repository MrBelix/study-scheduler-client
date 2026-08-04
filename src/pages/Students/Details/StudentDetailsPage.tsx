import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Cell, Placeholder, EmptyState, Tile, useMainButton, showToast } from '@/shared/ui';
import { useBackButton, haptic } from '@/shared/tg';
import { ApiError } from '@/shared/api';
import type { LessonSeries } from '@/shared/api';
import { routes } from '@/shared/routing';
import { useStudentDetails, useUpdateStudent } from '@/features/students/queries';
import { weekdaysLabel } from '@/features/lessons/model';
import { money, formatDayMonth } from '@/shared/lib';
import { StudentHeader } from './StudentHeader/StudentHeader';
import { NextLessonHero } from './NextLessonHero/NextLessonHero';
import { DebtBanner } from './DebtBanner/DebtBanner';
import { StudentActionsCard } from './StudentActionsCard';
import { ArchiveConfirmSheet } from './ArchiveConfirmSheet/ArchiveConfirmSheet';
import { DetailsSkeleton } from './DetailsSkeleton/DetailsSkeleton';
import styles from './StudentDetailsPage.module.scss';

export function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isPending, error, refetch } = useStudentDetails(id);
  // 404 = the student is genuinely gone; anything else is a transient failure.
  const notFound = error instanceof ApiError && error.status === 404;
  const isError = Boolean(error) && !notFound;
  const updateStudent = useUpdateStudent();
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);

  useBackButton(() => navigate(routes.students.list()));

  useEffect(() => {
    if (updateStudent.isError) showToast(m.form_error_save());
  }, [updateStudent.isError]);

  useMainButton({
    text: m.student_add_lesson(),
    icon: 'add',
    variant: 'tinted',
    onClick: () => navigate(routes.lessons.new({ studentId: id })),
    hidden: isPending || isError || notFound || !student,
  });

  if (isPending) return <DetailsSkeleton />;

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

  const archived = student.status === 'Archived';
  const { nextLesson } = student;

  // A student's subjects are their current series ("Математика" пн/чт +
  // "Фізика" ср) — title falls back to the schedule's own slot text.
  const seriesLabel = (s: LessonSeries) =>
    s.title ?? m.series_slot({ days: weekdaysLabel(s.weekdays), time: s.startTimeLocal.slice(0, 5) });
  const seriesSummary = student.series.length > 0 ? student.series.map(seriesLabel).join(', ') : m.student_series_none();

  const sinceDate = student.firstLessonAtUtc ?? student.createdAtUtc;
  const statsParts: string[] = [];
  if (student.lessonsCompleted > 0 || student.moneyReceived > 0) {
    statsParts.push(m.detail_stats_completed({ count: student.lessonsCompleted }));
    statsParts.push(m.detail_stats_received({ money: money(student.moneyReceived) }));
  }
  statsParts.push(m.detail_stats_since({ date: formatDayMonth(sinceDate) }));

  const toggleArchive = () => {
    if (updateStudent.isPending) return;
    if (!archived) {
      // Archiving cascades (stops series, drops future lessons) — confirm honestly before doing it.
      setConfirmArchiveOpen(true);
      return;
    }
    haptic('medium');
    updateStudent.mutate({ id: student.id, body: { status: 'Active' } });
  };

  const confirmArchive = () => {
    haptic('medium');
    updateStudent.mutate(
      { id: student.id, body: { status: 'Archived' } },
      { onSuccess: () => setConfirmArchiveOpen(false) },
    );
  };

  return (
    <div className={styles['detail']}>
      <StudentHeader name={student.name} rate={student.rate} />

      {nextLesson && <NextLessonHero nextLesson={nextLesson} />}

      {student.debt && (
        <DebtBanner
          debt={student.debt}
          onClick={() => {
            haptic('light');
            navigate(routes.students.debts(student.id));
          }}
        />
      )}

      <div className={styles['detail__scheduleCard']}>
        <Cell
          leading={<Tile tone="muted" icon="event_repeat" />}
          stacked
          title={m.student_series_label()}
          subtitle={seriesSummary}
          chevron
          onClick={() => navigate(routes.students.series(student.id))}
        />
        <Cell
          leading={<Tile tone="muted" icon="history" />}
          stacked
          title={m.student_history_label()}
          subtitle={m.student_history_completed_value({ count: student.lessonsCompleted })}
          chevron
          onClick={() => navigate(routes.students.history(student.id))}
        />
      </div>

      <div className={styles['detail__stats']}>{statsParts.join(' · ')}</div>

      <StudentActionsCard
        archived={archived}
        onEdit={() => navigate(routes.students.edit(student.id))}
        onToggleArchive={toggleArchive}
      />

      {confirmArchiveOpen && (
        <ArchiveConfirmSheet
          pending={updateStudent.isPending}
          onConfirm={confirmArchive}
          onClose={() => setConfirmArchiveOpen(false)}
        />
      )}
    </div>
  );
}
