import type { Lesson, LessonSeries } from '@/shared/api';
import { getAppLocale } from '@/shared/i18n';
import { addDays, dateKey } from '@/shared/lib';

// All calendar math and formatting below is in the DEVICE time zone — for a
// tutor it matches the profile time zone in the normal case (onboarding offers
// exactly the detected one).

/** "3 – 9 серпня" — week navigation label (start and inclusive end of week). */
export function fmtWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const locale = getAppLocale();
  const sameMonth = weekStart.getMonth() === end.getMonth();
  const startFmt = new Intl.DateTimeFormat(locale, sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'short' });
  const endFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' });
  return `${startFmt.format(weekStart)} – ${endFmt.format(end)}`;
}

/** Lessons grouped by local calendar day and sorted by start time within each. */
export function groupByDay(lessons: Lesson[]): Map<string, Lesson[]> {
  const groups = new Map<string, Lesson[]>();
  for (const lesson of lessons) {
    const key = dateKey(new Date(lesson.startUtc));
    const list = groups.get(key);
    if (list) list.push(lesson);
    else groups.set(key, [lesson]);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.startUtc.localeCompare(b.startUtc));
  }
  return groups;
}

/** Backend Weekdays flag names, Monday-first to match the visible week. */
export const WEEKDAY_FLAGS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/** Locale short label for a weekday chip; `index` is Monday-first. */
export function weekdayShortLabel(index: number): string {
  // 2026-08-03 is a Monday — a fixed anchor keeps labels locale-driven.
  return new Intl.DateTimeFormat(getAppLocale(), { weekday: 'short' }).format(new Date(2026, 7, 3 + index));
}

/** Backend flags string → locale labels: "Monday, Thursday" → "пн, чт". */
export function weekdaysLabel(flags: string): string {
  const set = new Set(flags.split(',').map((s) => s.trim()));
  return WEEKDAY_FLAGS.map((flag, i) => (set.has(flag) ? weekdayShortLabel(i) : null))
    .filter(Boolean)
    .join(', ');
}

/**
 * Detail-page route for a schedule entry: physical lessons go by id, virtual
 * slots (no id) by their series occurrence.
 */
export function lessonPath(lesson: Lesson): string {
  return lesson.id ? `/lessons/${lesson.id}` : `/lessons/occurrence/${lesson.seriesId}/${lesson.occurrenceDate}`;
}

/**
 * Whether the series still produces occurrences today or later. Lifecycle is the
 * `endDate` alone: open-ended (null) is current; otherwise it must end today-or-later
 * AND not before it ever started (a series cancelled before its start day gets an
 * `endDate` below `startDate` and produces nothing).
 */
export function isSeriesCurrent(series: LessonSeries): boolean {
  const today = dateKey(new Date());
  return series.endDate == null || (series.endDate >= today && series.endDate >= series.startDate);
}

/**
 * Whether the series can still be cancelled: only while it stays open beyond
 * today. Once `endDate` is today-or-earlier there is nothing left to cancel
 * (cancelling sets `endDate` to today, so a cancelled series fails this).
 */
export function isSeriesCancellable(series: LessonSeries): boolean {
  return series.endDate == null || series.endDate > dateKey(new Date());
}

/**
 * A student's subjects, derived from their current series titles (a student
 * with several subjects simply has several series). Unique, in series order.
 */
export function studentSubjects(series: LessonSeries[], studentId: string): string[] {
  const titles = series
    .filter((s) => s.studentId === studentId && isSeriesCurrent(s) && s.title)
    .map((s) => s.title as string);
  return [...new Set(titles)];
}
