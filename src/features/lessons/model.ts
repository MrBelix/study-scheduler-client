import type { Lesson, LessonSeries } from '@/shared/api';
import { getAppLocale } from '@/shared/i18n';

// All calendar math and formatting below is in the DEVICE time zone — for a
// tutor it matches the profile time zone in the normal case (onboarding offers
// exactly the detected one).

/** "450" / "450,50" / "1 050" → number; empty/invalid → undefined. */
export function parsePrice(raw: string): number | undefined {
  const cleaned = raw.replace(/\s/g, '').replace(',', '.');
  if (cleaned === '') return undefined;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : undefined;
}

/** Monday 00:00 of the week containing `d` (local time). */
export function startOfWeek(d: Date): Date {
  const result = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const shift = (result.getDay() + 6) % 7; // Sun=0 → 6, Mon=1 → 0
  result.setDate(result.getDate() - shift);
  return result;
}

export function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

/** Local calendar-day key, e.g. "2026-08-03". */
export function dateKey(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** "14:00" (locale-formatted time of an ISO instant). */
export function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat(getAppLocale(), { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

/** "пн, 3 серпня" — day section header. */
export function fmtDayHeader(d: Date): string {
  return new Intl.DateTimeFormat(getAppLocale(), { weekday: 'short', day: 'numeric', month: 'long' }).format(d);
}

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
 * Whether the series still produces future occurrences. `isActive` false only
 * means "ended before it ever started"; a series cancelled mid-life stays
 * active with `endDate` tightened to the cancellation day — so "current" is
 * active AND not ended before today.
 */
export function isSeriesCurrent(series: LessonSeries): boolean {
  return series.isActive && (!series.endDate || series.endDate >= dateKey(new Date()));
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
