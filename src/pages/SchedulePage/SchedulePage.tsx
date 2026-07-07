import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, Cell, Placeholder, useMainButton } from '@/shared/ui';
import type { Lesson, Student } from '@/shared/api';
import { useLessons } from '@/features/lessons/queries';
import { useStudents } from '@/features/students/queries';
import { money } from '@/features/students/model';
import { startOfWeek, addDays, dateKey, fmtTime, fmtDayHeader, fmtWeekRange, groupByDay, lessonPath } from '@/features/lessons/model';
import styles from './SchedulePage.module.scss';

function LessonCell({ lesson, student, onClick }: { lesson: Lesson; student?: Student; onClick: () => void }) {
  const cancelled = lesson.status === 'Cancelled';
  const time = `${fmtTime(lesson.startUtc)}–${fmtTime(lesson.endUtc)}`;
  const subtitleParts = [time];
  if (lesson.topic) subtitleParts.push(lesson.topic);
  if (lesson.status === 'Completed') subtitleParts.push(m.status_completed());

  return (
    <Cell
      title={student?.name ?? m.value_none()}
      subtitle={subtitleParts.join(' · ')}
      subtitleMuted={cancelled}
      value={cancelled ? m.status_cancelled() : money(lesson.price)}
      valueColor={
        cancelled
          ? 'var(--ds-color-hint)'
          : lesson.isPaid
            ? 'var(--ds-color-success)'
            : undefined
      }
      dimmed={cancelled}
      chevron
      minHeight={56}
      onClick={onClick}
    />
  );
}

export function SchedulePage() {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  // Stable ISO bounds for the query key: [Mon 00:00, next Mon 00:00) local.
  const fromIso = useMemo(() => weekStart.toISOString(), [weekStart]);
  const toIso = useMemo(() => addDays(weekStart, 7).toISOString(), [weekStart]);

  const lessonsQuery = useLessons(fromIso, toIso);
  const { data: students } = useStudents();

  useMainButton({ text: m.schedule_add_lesson(), onClick: () => navigate('/lessons/new') });

  const studentById = new Map((students ?? []).map((s) => [s.id, s]));
  const byDay = groupByDay(lessonsQuery.data ?? []);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayKey = dateKey(new Date());
  const isEmptyWeek = lessonsQuery.data != null && lessonsQuery.data.length === 0;

  return (
    <div className={styles['schedule']}>
      <div className={styles['schedule__nav']}>
        <button
          type="button"
          className={styles['schedule__nav-arrow']}
          aria-label={m.week_prev()}
          onClick={() => setWeekStart(addDays(weekStart, -7))}
        >
          ‹
        </button>
        <button
          type="button"
          className={styles['schedule__nav-label']}
          title={m.week_today()}
          onClick={() => setWeekStart(startOfWeek(new Date()))}
        >
          {fmtWeekRange(weekStart)}
        </button>
        <button
          type="button"
          className={styles['schedule__nav-arrow']}
          aria-label={m.week_next()}
          onClick={() => setWeekStart(addDays(weekStart, 7))}
        >
          ›
        </button>
      </div>

      {lessonsQuery.isError ? (
        <div className={styles['schedule__status']}>{m.error_generic()}</div>
      ) : lessonsQuery.isPending ? (
        <div className={styles['schedule__status']}>{m.loading()}</div>
      ) : isEmptyWeek ? (
        <Placeholder glyph="🗓️" title={m.schedule_week_empty()} description={m.schedule_week_empty_desc()} />
      ) : (
        days.map((day) => {
          const lessons = byDay.get(dateKey(day));
          if (!lessons) return null;
          return (
            <Section
              key={dateKey(day)}
              header={dateKey(day) === todayKey ? `${fmtDayHeader(day)} · ${m.week_today()}` : fmtDayHeader(day)}
            >
              {lessons.map((lesson) => (
                <LessonCell
                  key={lesson.id ?? `${lesson.seriesId}:${lesson.occurrenceDate}`}
                  lesson={lesson}
                  student={studentById.get(lesson.studentId)}
                  onClick={() => navigate(lessonPath(lesson))}
                />
              ))}
            </Section>
          );
        })
      )}
    </div>
  );
}
