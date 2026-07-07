import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, Cell, Avatar, Badge, Placeholder } from '@/shared/ui';
import { useBackButton, haptic } from '@/shared/tg';
import { ApiError } from '@/shared/api';
import type { Lesson, LessonStatus } from '@/shared/api';
import { useStudents } from '@/features/students/queries';
import { money, formatDate } from '@/features/students/model';
import { useLesson, useLessons, useLessonSeries, useUpdateLesson, useCancelSeries } from '@/features/lessons/queries';
import type { LessonTarget } from '@/features/lessons/queries';
import { fmtTime, fmtDayHeader, weekdaysLabel, isSeriesCurrent } from '@/features/lessons/model';
import styles from './LessonDetailPage.module.scss';

const STATUS_BADGE: Record<LessonStatus, { mode: 'success' | 'muted'; label: () => string }> = {
  Scheduled: { mode: 'success', label: () => m.status_scheduled() },
  Completed: { mode: 'muted', label: () => m.status_completed() },
  Cancelled: { mode: 'muted', label: () => m.status_cancelled() },
};

/** Physical lesson — `/lessons/:id`. */
export function LessonDetailPage() {
  const { id } = useParams();
  const { data: lesson, isPending, error } = useLesson(id);
  return <LessonDetailView lesson={lesson} isPending={isPending} error={error} />;
}

/**
 * Series slot — `/lessons/occurrence/:seriesId/:date`. Virtual slots have no
 * id and no single-item endpoint, so the slot is picked out of its day range;
 * once a mutation materializes it, the same route keeps resolving to the
 * physical row (same seriesId + occurrenceDate).
 */
export function OccurrenceDetailPage() {
  const { seriesId, date } = useParams();
  const dayStart = new Date(`${date}T00:00`);
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);
  const { data, isPending, error } = useLessons(dayStart.toISOString(), dayEnd.toISOString());
  const lesson = data?.find((l) => l.seriesId === seriesId && l.occurrenceDate === date);
  return <LessonDetailView lesson={lesson} isPending={isPending} error={error} />;
}

function LessonDetailView({
  lesson,
  isPending,
  error,
}: {
  lesson: Lesson | undefined;
  isPending: boolean;
  error: unknown;
}) {
  const navigate = useNavigate();

  const { data: students } = useStudents();
  const { data: series } = useLessonSeries(lesson?.seriesId);
  const updateLesson = useUpdateLesson();
  const cancelSeries = useCancelSeries();

  useBackButton(() => navigate(-1));

  if (isPending) {
    return <div className={styles['lesson__status']}>{m.loading()}</div>;
  }

  if (!lesson) {
    return (
      <Placeholder
        glyph="🔍"
        title={
          error instanceof ApiError && error.isAuthExpired ? m.error_auth_expired() : m.lesson_not_found()
        }
      />
    );
  }

  const student = students?.find((s) => s.id === lesson.studentId);
  const badge = STATUS_BADGE[lesson.status];
  const cancelled = lesson.status === 'Cancelled';
  const mutating = updateLesson.isPending || cancelSeries.isPending;

  // Virtual slots are patched via their series occurrence — the backend
  // materializes the row on first mutation.
  const target: LessonTarget = lesson.id
    ? { lessonId: lesson.id }
    : { seriesId: lesson.seriesId!, occurrenceDate: lesson.occurrenceDate! };

  const patch = (body: Parameters<typeof updateLesson.mutate>[0]['body']) => {
    if (mutating) return;
    haptic('light');
    updateLesson.mutate({ target, body });
  };

  return (
    <div className={styles['lesson']}>
      <div className={styles['lesson__header']}>
        <div className={styles['lesson__time']}>
          {fmtTime(lesson.startUtc)}–{fmtTime(lesson.endUtc)}
        </div>
        <div className={styles['lesson__date']}>
          {fmtDayHeader(new Date(lesson.startUtc))} · {m.minutes({ count: lesson.durationMinutes })}
        </div>
        <Badge mode={badge.mode}>{badge.label()}</Badge>
      </div>

      {student && (
        <Section>
          <Cell
            leading={<Avatar name={student.name} size={42} />}
            title={student.name}
            subtitle={student.subject || undefined}
            chevron
            inset={70}
            minHeight={56}
            onClick={() => navigate(`/students/${student.id}`)}
          />
        </Section>
      )}

      <Section header={m.lesson_section()}>
        <Cell
          title={m.lesson_price()}
          value={money(lesson.price)}
          valueColor={lesson.isPaid ? 'var(--ds-color-success)' : undefined}
        />
        <Cell
          title={m.lesson_paid()}
          value={lesson.isPaid ? `${m.paid_yes()} ✓` : m.paid_no()}
          valueColor={lesson.isPaid ? 'var(--ds-color-success)' : 'var(--ds-color-hint)'}
          onClick={cancelled ? undefined : () => patch({ isPaid: !lesson.isPaid })}
        />
        {lesson.topic && <Cell title={m.lesson_topic()} value={lesson.topic} />}
        {lesson.description && <Cell title={m.lesson_description()} value={lesson.description} />}
      </Section>

      {series && (
        <Section header={m.lesson_series_section()} footer={m.lesson_series_footer()}>
          {series.title && <Cell title={m.lesson_series_title()} value={series.title} />}
          <Cell
            title={m.lesson_series_schedule()}
            value={`${weekdaysLabel(series.weekdays)} · ${series.startTimeLocal.slice(0, 5)}`}
            chevron
            onClick={() => navigate(`/lessons/series/${series.id}/edit`)}
          />
          <Cell
            title={m.lesson_series_until()}
            value={series.endDate ? formatDate(series.endDate) : m.lesson_series_open_ended()}
          />
          {isSeriesCurrent(series) && (
            <Cell
              title={<span className={styles['lesson__danger']}>{m.lesson_series_cancel()}</span>}
              onClick={() => {
                if (mutating) return;
                haptic('medium');
                cancelSeries.mutate(series.id);
              }}
            />
          )}
        </Section>
      )}

      {lesson.status === 'Scheduled' && (
        <Section>
          <Cell
            title={<span className={styles['lesson__accent']}>{m.lesson_mark_completed()}</span>}
            onClick={() => patch({ status: 'Completed' })}
          />
          <Cell
            title={<span className={styles['lesson__danger']}>{m.lesson_cancel()}</span>}
            onClick={() => patch({ status: 'Cancelled' })}
          />
        </Section>
      )}

      {(updateLesson.isError || cancelSeries.isError) && (
        <div className={styles['lesson__error']}>{m.form_error_save()}</div>
      )}
    </div>
  );
}
