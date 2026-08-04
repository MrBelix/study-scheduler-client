import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, EmptyState, Placeholder, SegmentedControl } from '@/shared/ui';
import type { SegmentItem } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { ApiError } from '@/shared/api';
import type { StudentDetails, Lesson } from '@/shared/api';
import { routes } from '@/shared/routing';
import { getAppLocale } from '@/shared/i18n';
import { useStudentDetails } from '@/features/students/queries';
import { useLessons, useSeriesList } from '@/features/lessons/queries';
import { monthLabel, lessonPath } from '@/features/lessons/model';
import { money, pluralUk, addDays, addMonths } from '@/shared/lib';
import { HistoryRow } from './HistoryRow/HistoryRow';
import { HistorySkeleton } from './HistorySkeleton/HistorySkeleton';
import styles from './StudentHistoryPage.module.scss';

// Mirrors LessonFormPage's client-side mirror of the backend's PlanningHorizon.
const PLANNING_HORIZON_MONTHS = 4;
// Mirrors the backend's GET /lessons range cap (Features/Lessons/Endpoints.cs MaxRangeDays).
const HISTORY_CAP_DAYS = 366;

type Tab = 'upcoming' | 'past';

interface MonthGroup {
  key: string;
  label: string;
  lessons: Lesson[];
}

/**
 * Groups an already-sorted lesson list by calendar month, preserving that order between groups.
 * The label carries the year when the window spans into a non-current year, or when the same
 * calendar month recurs across different years (up to 366 days can cover 13 distinct months) —
 * the smallest disambiguation, e.g. "Серпень 2025" vs. bare "Серпень".
 */
function groupByMonth(lessons: Lesson[]): MonthGroup[] {
  const groups = new Map<string, { date: Date; lessons: Lesson[] }>();
  for (const lesson of lessons) {
    const d = new Date(lesson.startUtc);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    let group = groups.get(key);
    if (!group) {
      group = { date: d, lessons: [] };
      groups.set(key, group);
    }
    group.lessons.push(lesson);
  }

  const currentYear = new Date().getFullYear();
  const monthCounts = new Map<number, number>();
  for (const { date } of groups.values()) {
    monthCounts.set(date.getMonth(), (monthCounts.get(date.getMonth()) ?? 0) + 1);
  }

  return [...groups.entries()].map(([key, { date, lessons }]) => {
    const needsYear = date.getFullYear() !== currentYear || (monthCounts.get(date.getMonth()) ?? 0) > 1;
    const label = needsYear ? `${monthLabel(date)} ${date.getFullYear()}` : monthLabel(date);
    return { key, label, lessons };
  });
}

/** "2 уроки" — total lesson count, locale-aware (uk has 3 plural forms, en just 2). */
function lessonsCountLabel(count: number): string {
  if (getAppLocale() === 'uk') {
    return pluralUk(count, {
      one: m.schedule_lessons_count_one({ count }),
      few: m.schedule_lessons_count_few({ count }),
      many: m.schedule_lessons_count_many({ count }),
    });
  }
  return count === 1 ? m.schedule_lessons_count_one({ count }) : m.schedule_lessons_count_many({ count });
}

/**
 * F7 — `/students/:id/lessons`, a student's own lesson list: upcoming ahead of the planning
 * horizon, history back to their first lesson (capped at the API's own 366-day range limit).
 * Reached from `StudentDetailsPage`'s schedule card.
 */
export function StudentHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isPending, error, refetch } = useStudentDetails(id);
  // 404 = the student is genuinely gone; anything else is a transient failure.
  const notFound = error instanceof ApiError && error.status === 404;
  const isError = Boolean(error) && !notFound;

  useBackButton(() => navigate(routes.students.details(id!)));

  if (isPending) return <HistorySkeleton />;

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

  return <StudentHistoryView student={student} />;
}

function StudentHistoryView({ student }: { student: StudentDetails }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('upcoming');

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Future window: [today, today + horizon] — "today" belongs here, not to history, so the two
  // windows never double-count a lesson that happens today.
  const futureToExclusive = addDays(addMonths(todayMidnight, PLANNING_HORIZON_MONTHS), 1);
  const futureFromIso = todayMidnight.toISOString();
  const futureToIso = futureToExclusive.toISOString();

  // History window: [max(firstLessonAtUtc, cap), today) — strictly before today, and never further
  // back than the API's own 366-day range limit; `truncated` says whether that cap actually bit.
  // `firstLessonAtUtc` is only usable as a floor when it's actually in the past: a brand-new
  // student's sole lesson is often a future-dated one (created but not yet happened), and it being
  // simultaneously "earliest" and "only" would otherwise push the window's start past its own end.
  const cappedFloor = addDays(todayMidnight, -(HISTORY_CAP_DAYS - 1));
  const rawFirstLessonAt = student.firstLessonAtUtc ? new Date(student.firstLessonAtUtc) : null;
  const firstPastLessonAt = rawFirstLessonAt && rawFirstLessonAt.getTime() < todayMidnight.getTime() ? rawFirstLessonAt : null;
  const pastFrom = firstPastLessonAt && firstPastLessonAt.getTime() > cappedFloor.getTime() ? firstPastLessonAt : cappedFloor;
  const pastFromMidnight = new Date(pastFrom.getFullYear(), pastFrom.getMonth(), pastFrom.getDate());
  const pastFromIso = pastFromMidnight.toISOString();
  const pastToIso = todayMidnight.toISOString();
  const truncated = firstPastLessonAt != null && firstPastLessonAt.getTime() < cappedFloor.getTime();

  const futureQuery = useLessons(futureFromIso, futureToIso, student.id);
  const pastQuery = useLessons(pastFromIso, pastToIso, student.id);
  // Every series of the tutor (inactive included) — a history row can point at a series that has
  // since ended, which `student.series` (current-only) wouldn't carry.
  const { data: seriesList } = useSeriesList();

  if (futureQuery.isPending || pastQuery.isPending) return <HistorySkeleton />;

  if (futureQuery.isError || pastQuery.isError) {
    return (
      <EmptyState
        variant="secondary"
        icon="cloud_off"
        tone="warn"
        title={m.error_generic()}
        action={{
          label: m.retry(),
          onClick: () => {
            futureQuery.refetch();
            pastQuery.refetch();
          },
        }}
      />
    );
  }

  const seriesById = new Map((seriesList ?? []).map((s) => [s.id, s]));
  const futureSorted = [...futureQuery.data].sort((a, b) => a.startUtc.localeCompare(b.startUtc));
  const pastSorted = [...pastQuery.data].sort((a, b) => b.startUtc.localeCompare(a.startUtc));
  const totalCount = futureSorted.length + pastSorted.length;

  const segItems: SegmentItem<Tab>[] = [
    { label: m.student_history_tab_upcoming({ count: futureSorted.length }), value: 'upcoming' },
    { label: m.student_history_tab_past({ count: pastSorted.length }), value: 'past' },
  ];
  const groups = groupByMonth(tab === 'upcoming' ? futureSorted : pastSorted);
  const headerHint = `${lessonsCountLabel(totalCount)} · ${m.detail_stats_completed({ count: student.lessonsCompleted })} · ${money(student.moneyReceived)}`;

  return (
    <div className={styles.history}>
      <div className={styles['history__header']}>
        <span className={styles['history__title']}>{m.student_history_title({ name: student.name })}</span>
        <span className={styles['history__hint']}>{headerHint}</span>
      </div>

      {totalCount === 0 ? (
        <EmptyState variant="secondary" icon="history_toggle_off" title={m.student_history_empty()} />
      ) : (
        <>
          <div className={styles['history__segment']}>
            <SegmentedControl items={segItems} value={tab} onChange={setTab} />
          </div>

          {groups.length === 0 ? (
            <div className={styles.tabHint}>{m.student_history_tab_empty()}</div>
          ) : (
            groups.map((g) => (
              <Section key={g.key} header={g.label}>
                {g.lessons.map((l) => (
                  <HistoryRow
                    key={l.id}
                    lesson={l}
                    series={l.seriesId ? seriesById.get(l.seriesId) : undefined}
                    onClick={() => navigate(lessonPath(l))}
                  />
                ))}
              </Section>
            ))
          )}

          {tab === 'past' && truncated && <p className={styles.cappedNote}>{m.student_history_capped_note()}</p>}
        </>
      )}
    </div>
  );
}
