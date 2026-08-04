import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, EmptyState, Placeholder, useMainButton, showToast } from '@/shared/ui';
import { useBackButton, haptic } from '@/shared/tg';
import { ApiError } from '@/shared/api';
import type { StudentDetails, UnpaidLesson } from '@/shared/api';
import { routes } from '@/shared/routing';
import { useStudentDetails, useStudentDebts } from '@/features/students/queries';
import { useSettleLessons } from '@/features/lessons/queries';
import { lessonsCountLabel } from '@/features/reports/model';
import { money, apiFormErrors } from '@/shared/lib';
import { DebtRow } from './DebtRow/DebtRow';
import { DebtsSkeleton } from './DebtsSkeleton/DebtsSkeleton';
import styles from './StudentDebtsPage.module.scss';

/**
 * `/students/:id/debts` — the bulk-settle page reached by tapping the student
 * detail page's debt banner. Lists unpaid Completed lessons (newest first,
 * per `GET /students/{id}/debts`), all selected by default; the app
 * `MainButton` confirms `POST /lessons/settle` for whatever's still checked.
 */
export function StudentDebtsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isPending, error, refetch } = useStudentDetails(id);
  // 404 = the student is genuinely gone; anything else is a transient failure.
  const notFound = error instanceof ApiError && error.status === 404;
  const isError = Boolean(error) && !notFound;

  useBackButton(() => navigate(routes.students.details(id!)));

  if (isPending) return <DebtsSkeleton />;

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

  return <StudentDebtsView student={student} />;
}

function StudentDebtsView({ student }: { student: StudentDetails }) {
  const debtsQuery = useStudentDebts(student.id);

  if (debtsQuery.isPending) return <DebtsSkeleton />;

  if (debtsQuery.isError) {
    return (
      <EmptyState
        variant="secondary"
        icon="cloud_off"
        tone="warn"
        title={m.error_generic()}
        action={{ label: m.retry(), onClick: () => debtsQuery.refetch() }}
      />
    );
  }

  const { lessons } = debtsQuery.data;

  return (
    <div className={styles.debts}>
      <div className={styles.header}>
        <span className={styles.title}>{m.student_debts_title({ name: student.name })}</span>
      </div>

      {lessons.length === 0 ? (
        <EmptyState variant="secondary" icon="check_circle" title={m.student_debts_empty()} />
      ) : (
        // Keyed on the fetch timestamp so a fresh dataset (initial load, or the post-400 refetch
        // below) remounts this with a fresh "all selected" default instead of syncing state via an
        // effect — see `DebtsSettleList`'s lazy `useState` initializer.
        <DebtsSettleList
          key={debtsQuery.dataUpdatedAt}
          studentId={student.id}
          lessons={lessons}
          onRefetch={() => debtsQuery.refetch()}
        />
      )}
    </div>
  );
}

interface DebtsSettleListProps {
  studentId: string;
  /** Guaranteed non-empty by the caller. */
  lessons: UnpaidLesson[];
  onRefetch: () => void;
}

/** The selectable row list + confirm action — split out so its "all selected" default can be a plain lazy `useState` initializer keyed on a fresh fetch, not a `useEffect` synchronizing state off query data. */
function DebtsSettleList({ studentId, lessons, onRefetch }: DebtsSettleListProps) {
  const navigate = useNavigate();
  const settleLessons = useSettleLessons();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(lessons.map((l) => l.id)));

  useEffect(() => {
    if (!settleLessons.error) return;
    const { fieldError, genericError } = apiFormErrors(settleLessons.error);
    showToast(fieldError('LessonIds') ?? genericError ?? m.form_error_save());
    // Some of the selected ids may be stale (already settled/gone elsewhere) — refetch to drop them.
    onRefetch();
  }, [settleLessons.error, onRefetch]);

  const toggle = (lessonId: string) => {
    haptic('light');
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const selectedTotal = lessons.filter((l) => selected.has(l.id)).reduce((sum, l) => sum + l.price, 0);

  useMainButton({
    text: m.student_debts_settle_action({ amount: money(selectedTotal) }),
    icon: 'check',
    enabled: selected.size > 0,
    loading: settleLessons.isPending,
    onClick: () => {
      if (selected.size === 0 || settleLessons.isPending) return;
      haptic('medium');
      settleLessons.mutate(
        { lessonIds: [...selected] },
        {
          onSuccess: () => {
            showToast(m.student_debts_settled_toast());
            navigate(routes.students.details(studentId));
          },
        },
      );
    },
  });

  return (
    <>
      <div className={styles.summary}>
        {m.student_debts_summary({ count: lessonsCountLabel(selected.size), amount: money(selectedTotal) })}
      </div>
      <Section>
        {lessons.map((l) => (
          <DebtRow key={l.id} lesson={l} selected={selected.has(l.id)} onToggle={() => toggle(l.id)} />
        ))}
      </Section>
    </>
  );
}
