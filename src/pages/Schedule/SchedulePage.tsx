import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { EmptyState, Icon, useMainButton, showToast } from '@/shared/ui';
import { haptic } from '@/shared/tg';
import { routes } from '@/shared/routing';
import { getAppLocale } from '@/shared/i18n';
import { useLessons, useSeriesList, useUpdateLesson } from '@/features/lessons/queries';
import { useStudents } from '@/features/students/queries';
import { addDays, dateKey, fmtDayHeader, formatDayMonth, fmtTime, money, pluralUk, startOfWeek } from '@/shared/lib';
import {
  groupByDay,
  lessonPath,
  monthLabel,
  nextUpcomingLesson,
  selectHeroLesson,
  weekdayShortLabel,
} from '@/features/lessons/model';
import { DayStrip } from './DayStrip/DayStrip';
import { NextLessonCard } from './NextLessonCard/NextLessonCard';
import { LessonRow } from './LessonRow/LessonRow';
import { ScheduleSkeleton } from './ScheduleSkeleton/ScheduleSkeleton';
import styles from './SchedulePage.module.scss';

/** "3 уроки" — day-section header count, locale-aware (uk has 3 plural forms, en just 2). */
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

/** Strict `yyyy-MM-dd` shape check — precedes the `Date` parse below. */
const DAY_PARAM_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses a `?day=` param into a local-midnight `Date`; `null` if malformed or not a real calendar date. */
function parseDayParam(value: string | null): Date | null {
  if (!value || !DAY_PARAM_RE.test(value)) return null;
  const day = new Date(`${value}T00:00`);
  if (Number.isNaN(day.getTime()) || dateKey(day) !== value) return null;
  return day;
}

export function SchedulePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // The strip's bounds are anchored once per mount so they don't shift as the
  // session goes on — roughly a week back, ~8 weeks forward (amendment 1).
  // Anchored at local midnight (not the mount instant) so the derived query
  // range stays on stable day boundaries and TanStack's cache actually hits
  // across remounts within the same day.
  const [rangeAnchor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const rangeStart = startOfWeek(addDays(rangeAnchor, -7));
  const rangeEnd = addDays(rangeAnchor, 56);
  const fromIso = rangeStart.toISOString();
  const toIso = addDays(rangeEnd, 1).toISOString();
  const days: Date[] = [];
  for (let d = rangeStart; d <= rangeEnd; d = addDays(d, 1)) days.push(d);

  // Ticking clock (not a bare `new Date()` in render): the hero card's
  // relative time and ongoing/grace/upcoming state are time-derived, so
  // without a periodic re-render they'd freeze at mount time.
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const now = clock;
  const todayKey = dateKey(now);
  const todayMidnight = new Date(`${todayKey}T00:00`);
  const tomorrowKey = dateKey(addDays(todayMidnight, 1));

  const dayParam = searchParams.get('day');
  const parsedDay = parseDayParam(dayParam);
  const selectedDay = parsedDay ?? todayMidnight;
  const selectedKey = dateKey(selectedDay);
  const selectDay = (day: Date) => setSearchParams({ day: dateKey(day) }, { replace: true });

  // A malformed `day` param falls back to today for this render; normalize
  // the URL itself so a bad/bookmarked link doesn't linger.
  useEffect(() => {
    if (dayParam && !parsedDay) setSearchParams({ day: todayKey }, { replace: true });
  }, [dayParam, parsedDay, todayKey, setSearchParams]);

  const lessonsQuery = useLessons(fromIso, toIso);
  const { data: students } = useStudents();
  const { data: seriesList } = useSeriesList();
  const updateLesson = useUpdateLesson();

  useEffect(() => {
    if (updateLesson.isError) showToast(m.form_error_save());
  }, [updateLesson.isError]);

  useMainButton({
    text: m.schedule_add_lesson(),
    icon: 'add',
    onClick: () => navigate(routes.lessons.new({ date: selectedKey })),
    hidden: lessonsQuery.isPending || lessonsQuery.isError,
  });

  if (lessonsQuery.isPending) return <ScheduleSkeleton />;

  if (lessonsQuery.isError) {
    return (
      <EmptyState
        variant="secondary"
        icon="cloud_off"
        tone="warn"
        title={m.error_generic()}
        action={{ label: m.retry(), onClick: () => lessonsQuery.refetch() }}
      />
    );
  }

  const allLessons = lessonsQuery.data ?? [];
  const studentById = new Map((students ?? []).map((s) => [s.id, s]));
  const seriesById = new Map((seriesList ?? []).map((s) => [s.id, s]));
  const byDay = groupByDay(allLessons);
  const dayLessons = byDay.get(selectedKey) ?? [];
  const isToday = selectedKey === todayKey;
  const isTomorrow = selectedKey === tomorrowKey;

  const hero = isToday ? selectHeroLesson(dayLessons, now) : null;
  const rows = hero ? dayLessons.filter((l) => l.id !== hero.lesson.id) : dayLessons;
  const nonCancelled = dayLessons.filter((l) => l.status !== 'Cancelled');
  const nextFreeDayLesson = dayLessons.length === 0 ? nextUpcomingLesson(allLessons, addDays(selectedDay, 1).toISOString()) : null;

  const markHeroCompleted = () => {
    if (!hero || updateLesson.isPending) return;
    haptic('light');
    updateLesson.mutate({ id: hero.lesson.id, body: { status: 'Completed' } });
  };

  const dayTitle = isToday
    ? m.schedule_day_today({ date: formatDayMonth(selectedDay.toISOString()) })
    : isTomorrow
      ? m.schedule_day_tomorrow({ date: formatDayMonth(selectedDay.toISOString()) })
      : fmtDayHeader(selectedDay);

  return (
    <div className={styles['schedule']}>
      <div className={styles['header']}>
        <div className={styles['month']}>
          <span className={styles['monthLabel']}>{monthLabel(selectedDay)}</span>
        </div>
        {!isToday && (
          <button
            type="button"
            className={styles['todayChip']}
            aria-label={m.week_today()}
            onClick={() => selectDay(todayMidnight)}
          >
            <Icon name="today" size={18} />
          </button>
        )}
      </div>

      <DayStrip days={days} byDay={byDay} selectedKey={selectedKey} todayKey={todayKey} onSelect={selectDay} />

      <div className={styles['daySection']}>
        {dayLessons.length > 0 && (
          <div className={styles['dayHeader']}>
            <span className={styles['dayTitle']}>{dayTitle}</span>
            <span className={styles['dayStats']}>
              {lessonsCountLabel(nonCancelled.length)} · {money(nonCancelled.reduce((sum, l) => sum + l.price, 0))}
            </span>
          </div>
        )}

        {dayLessons.length === 0 ? (
          <EmptyState
            variant="primary"
            icon="event_busy"
            tone="accent"
            title={m.schedule_empty_title()}
            description={
              nextFreeDayLesson
                ? m.schedule_empty_next({
                    date: formatDayMonth(nextFreeDayLesson.startUtc),
                    time: fmtTime(nextFreeDayLesson.startUtc),
                  })
                : undefined
            }
            action={{
              label: m.schedule_empty_action({ day: weekdayShortLabel((selectedDay.getDay() + 6) % 7) }),
              icon: 'add',
              onClick: () => navigate(routes.lessons.new({ date: selectedKey })),
            }}
          />
        ) : (
          <>
            {hero && (
              <NextLessonCard
                hero={hero}
                now={now}
                student={studentById.get(hero.lesson.studentId)}
                series={hero.lesson.seriesId ? seriesById.get(hero.lesson.seriesId) : undefined}
                onComplete={markHeroCompleted}
                completing={updateLesson.isPending}
              />
            )}
            {rows.length > 0 && (
              <div className={styles['rows']}>
                {rows.map((lesson) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    student={studentById.get(lesson.studentId)}
                    series={lesson.seriesId ? seriesById.get(lesson.seriesId) : undefined}
                    onClick={() => navigate(lessonPath(lesson))}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
