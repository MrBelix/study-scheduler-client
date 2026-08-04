import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, Cell, Avatar, Placeholder, EmptyState, showToast } from '@/shared/ui';
import { useBackButton, haptic } from '@/shared/tg';
import { ApiError } from '@/shared/api';
import type { Lesson } from '@/shared/api';
import { routes } from '@/shared/routing';
import { useStudents } from '@/features/students/queries';
import { useLesson, useLessonSeries, useUpdateLesson } from '@/features/lessons/queries';
import { money } from '@/shared/lib';
import { Header } from './Header/Header';
import { ActionsGrid } from './ActionsGrid/ActionsGrid';
import { PaymentCard } from './PaymentCard/PaymentCard';
import { RescheduleSheet } from './RescheduleSheet/RescheduleSheet';
import { EditLessonSheet } from './EditLessonSheet/EditLessonSheet';
import { CancelSheet } from './CancelSheet/CancelSheet';
import { DetailSkeleton } from './DetailSkeleton/DetailSkeleton';
import styles from './LessonDetailPage.module.scss';

type SheetKind = 'reschedule' | 'edit' | 'cancel' | null;

/** Navigation state a caller can use to land here with one sheet already open (schedule's hero card "Перенести"). */
interface OpenSheetState {
  openSheet?: Exclude<SheetKind, null>;
}

/**
 * Lesson detail — `/lessons/:id`. One route for both a one-off lesson and a
 * series slot alike: the id resolves to the same shape either way, so no
 * branch here needs to know which.
 */
export function LessonDetailPage() {
  const { id } = useParams();
  const { data: lesson, isPending, error, refetch } = useLesson(id);
  // 404 = the lesson is genuinely gone — that's the "not found" placeholder,
  // not the transient-failure treatment.
  const notFound = error instanceof ApiError && error.status === 404;
  const isError = Boolean(error) && !notFound;
  return <LessonDetailView lesson={lesson} isPending={isPending} isError={isError} onRetry={refetch} />;
}

function LessonDetailView({
  lesson,
  isPending,
  isError,
  onRetry,
}: {
  lesson: Lesson | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [sheet, setSheet] = useState<SheetKind>(() => (state as OpenSheetState | null)?.openSheet ?? null);

  // Ticking clock (not a bare `new Date()` in render): the header's
  // relative-time pill is time-derived, so without a periodic re-render it
  // would freeze at mount time — same convention as the schedule page.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const { data: students } = useStudents();
  const { data: series } = useLessonSeries(lesson?.seriesId);
  // Two independent mutation instances so the "done" button's own spinner
  // doesn't also light up while the paid switch is saving (and vice versa).
  const completeLesson = useUpdateLesson();
  const paidLesson = useUpdateLesson();
  const mutating = completeLesson.isPending || paidLesson.isPending;

  useBackButton(() => {
    if (sheet) setSheet(null);
    else navigate(routes.schedule());
  });

  useEffect(() => {
    if (completeLesson.isError) showToast(m.form_error_save());
  }, [completeLesson.isError]);
  useEffect(() => {
    if (paidLesson.isError) showToast(m.form_error_save());
  }, [paidLesson.isError]);

  if (isPending) return <DetailSkeleton />;

  if (isError) {
    return (
      <EmptyState
        variant="secondary"
        icon="cloud_off"
        tone="warn"
        title={m.error_generic()}
        action={{ label: m.retry(), onClick: onRetry }}
      />
    );
  }

  if (!lesson) {
    return <Placeholder glyph="🔍" title={m.lesson_not_found()} />;
  }

  const student = students?.find((s) => s.id === lesson.studentId);

  const markCompleted = () => {
    if (mutating) return;
    haptic('light');
    completeLesson.mutate({ id: lesson.id, body: { status: 'Completed' } });
  };

  const togglePaid = (checked: boolean) => {
    if (mutating) return;
    haptic('light');
    paidLesson.mutate({ id: lesson.id, body: { isPaid: checked } });
  };

  // Etalon shows a debt line here — there's no debt API, so the student row's
  // subtitle falls back to what this lesson's actually about (series title +
  // topic, same join `NextLessonCard` uses) and, failing that, the student's rate.
  const subject = [series?.title, lesson.topic].filter((s): s is string => Boolean(s)).join(' · ') || null;
  const studentSub = subject ?? (student?.rate ? m.detail_header_rate({ money: money(student.rate) }) : m.value_none());

  return (
    <div className={styles.lesson}>
      <Header lesson={lesson} series={series} now={now} />

      {student && (
        <Section>
          <Cell
            leading={<Avatar name={student.name} size={36} />}
            title={student.name}
            subtitle={studentSub}
            chevron
            inset={64}
            minHeight={56}
            onClick={() => navigate(routes.students.details(student.id))}
          />
        </Section>
      )}

      <ActionsGrid
        status={lesson.status}
        completing={completeLesson.isPending}
        disabled={mutating}
        onComplete={markCompleted}
        onReschedule={() => setSheet('reschedule')}
        onCancel={() => setSheet('cancel')}
        onEdit={() => setSheet('edit')}
      />

      <PaymentCard
        price={lesson.price}
        paid={lesson.isPaid}
        disabled={lesson.status === 'Cancelled' || mutating}
        onTogglePaid={togglePaid}
      />

      {/* NotesCard (ТЕМА ТА НОТАТКИ) hidden 2026-08-04 per product — see NotesCard.tsx. */}

      {sheet === 'reschedule' && <RescheduleSheet lesson={lesson} onClose={() => setSheet(null)} />}
      {sheet === 'edit' && <EditLessonSheet lesson={lesson} onClose={() => setSheet(null)} />}
      {sheet === 'cancel' && (
        <CancelSheet
          lesson={lesson}
          series={series}
          onClose={() => setSheet(null)}
          onSeriesCancelled={() => navigate(routes.schedule())}
        />
      )}
    </div>
  );
}
