import type { Lesson, LessonSeries } from '@/shared/api';
import { m } from '@/paraglide/messages';
import { getAppLocale } from '@/shared/i18n';
import { addDays, dateKey, fmtTime } from '@/shared/lib';
import { routes } from '@/shared/routing';

// All calendar math and formatting below is in the DEVICE time zone — for a
// tutor it matches the profile time zone in the normal case (onboarding offers
// exactly the detected one).

/**
 * "3 – 9 серпня" — week navigation label (start and inclusive end of week).
 * Lives here (not in `features/reports`) because it shares the schedule's
 * week/date primitives; imported by `features/reports/model.ts` for the
 * week-period nav label.
 */
export function fmtWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const locale = getAppLocale();
  const sameMonth = weekStart.getMonth() === end.getMonth();
  const startFmt = new Intl.DateTimeFormat(locale, sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'short' });
  const endFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' });
  return `${startFmt.format(weekStart)} – ${endFmt.format(end)}`;
}

/** "Серпень" — capitalized month name of a date, for the schedule header (Intl lowercases uk). */
export function monthLabel(date: Date): string {
  const locale = getAppLocale();
  const raw = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  return raw.charAt(0).toLocaleUpperCase(locale) + raw.slice(1);
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
 * Backend weekday flag (e.g. "Monday") of a bare `yyyy-MM-dd` date string —
 * parsed as a LOCAL calendar day (not `new Date(string)`, which reads a
 * date-only string as UTC midnight). Drives the lesson form's auto-locked
 * start weekday.
 */
export function weekdayFlagOfDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return WEEKDAY_FLAGS[(new Date(y, mo - 1, d).getDay() + 6) % 7];
}

/** Detail-page route for a schedule entry — `id` is the lesson's Guid id. */
export function lessonPath(lesson: Lesson): string {
  return routes.lessons.details(lesson.id);
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

// ---- Schedule hero selection (PAGE SPEC amendment 3): "current" beats "next" ----

const HERO_GRACE_MINUTES = 30;

export interface HeroLesson {
  lesson: Lesson;
  /**
   * `ongoing` — now falls inside the lesson's [start, end); `grace` — up to
   * `HERO_GRACE_MINUTES` after it ended (the one-tap "Проведено" window);
   * `upcoming` — the nearest later Scheduled lesson today, used only when
   * nothing is ongoing or freshly finished.
   */
  kind: 'ongoing' | 'grace' | 'upcoming';
}

/**
 * Hero lesson for the selected day's schedule — a live or just-finished
 * lesson always beats the next upcoming one. `dayLessons` is one day's worth
 * (e.g. from `groupByDay`); callers should only use this for today.
 */
export function selectHeroLesson(dayLessons: Lesson[], now = new Date()): HeroLesson | null {
  const scheduled = dayLessons
    .filter((l) => l.status === 'Scheduled')
    .sort((a, b) => a.startUtc.localeCompare(b.startUtc));

  const nowMs = now.getTime();
  for (const lesson of scheduled) {
    const startMs = new Date(lesson.startUtc).getTime();
    const endMs = new Date(lesson.endUtc).getTime();
    if (nowMs >= startMs && nowMs <= endMs + HERO_GRACE_MINUTES * 60_000) {
      return { lesson, kind: nowMs <= endMs ? 'ongoing' : 'grace' };
    }
  }

  const upcoming = scheduled.find((l) => new Date(l.startUtc).getTime() > nowMs);
  return upcoming ? { lesson: upcoming, kind: 'upcoming' } : null;
}

/** Hero card label — "ЗАРАЗ УРОК" while live/just finished, "НАСТУПНИЙ УРОК" otherwise. */
export function heroLabel(kind: HeroLesson['kind']): string {
  return kind === 'upcoming' ? m.detail_hero_label() : m.schedule_hero_now_label();
}

/** Hero card relative-time chip — "до 19:00" / "закінчився 5 хв тому" / "через 25 хв". */
export function heroChip(hero: HeroLesson, now = new Date()): string {
  if (hero.kind === 'ongoing') return m.schedule_hero_until({ time: fmtTime(hero.lesson.endUtc) });
  if (hero.kind === 'grace') {
    const minutes = Math.max(0, Math.round((now.getTime() - new Date(hero.lesson.endUtc).getTime()) / 60_000));
    return m.schedule_hero_finished_ago({ minutes });
  }
  const minutes = Math.max(0, Math.round((new Date(hero.lesson.startUtc).getTime() - now.getTime()) / 60_000));
  return minutes < 60 ? m.detail_next_in_minutes({ minutes }) : m.detail_next_in_hours({ hours: Math.round(minutes / 60) });
}

/**
 * F2 header pill text for a single Scheduled lesson's live state — the same
 * ongoing/until/upcoming vocabulary `heroChip` uses for the schedule's hero
 * card, computed straight off this one lesson's own start/end instead of a
 * day's worth of candidates (there's no "next" to pick between on its own
 * detail page).
 */
export function lessonTimeChip(lesson: Lesson, now = new Date()): string {
  const nowMs = now.getTime();
  const startMs = new Date(lesson.startUtc).getTime();
  const endMs = new Date(lesson.endUtc).getTime();

  if (nowMs < startMs) {
    const minutes = Math.max(0, Math.round((startMs - nowMs) / 60_000));
    if (minutes < 60) return m.detail_next_in_minutes({ minutes });
    const hours = Math.round(minutes / 60);
    return hours < 24 ? m.detail_next_in_hours({ hours }) : m.detail_next_in_days({ days: Math.round(hours / 24) });
  }
  if (nowMs <= endMs) return m.schedule_hero_until({ time: fmtTime(lesson.endUtc) });
  const minutesAgo = Math.max(0, Math.round((nowMs - endMs) / 60_000));
  return m.schedule_hero_finished_ago({ minutes: minutesAgo });
}

// ---- DayStrip (amendments 1 & 2) ----

export type DayCellState = 'today' | 'picked' | 'done' | 'busy' | 'free';

/**
 * Visual state of one DayStrip cell — see design-system.html "DayStrip ·
 * DayCell states". `today` and `picked` (the current selection) both outrank
 * the lesson-derived states; a past day only reads as `done` once every
 * non-cancelled lesson on it is Completed.
 */
export function dayCellState(day: Date, lessons: Lesson[], selectedKey: string, todayKey: string): DayCellState {
  const key = dateKey(day);
  if (key === todayKey) return 'today';
  if (key === selectedKey) return 'picked';
  const relevant = lessons.filter((l) => l.status !== 'Cancelled');
  if (relevant.length === 0) return 'free';
  if (key < todayKey && relevant.every((l) => l.status === 'Completed')) return 'done';
  return 'busy';
}

export interface DayDots {
  /** Up to 3 dot tones — `ok` for Completed, `accent` for Scheduled (Cancelled excluded). */
  dots: ('ok' | 'accent')[];
  /** More than 3 relevant lessons that day — render "3+" instead of `dots`. */
  overflow: boolean;
}

/** DayStrip dot summary for one day — design-system rule: max 3 dots, else "3+". */
export function dayDots(lessons: Lesson[]): DayDots {
  const relevant = lessons.filter((l) => l.status !== 'Cancelled');
  return {
    dots: relevant.slice(0, 3).map((l): 'ok' | 'accent' => (l.status === 'Completed' ? 'ok' : 'accent')),
    overflow: relevant.length > 3,
  };
}

/** Earliest Scheduled lesson starting strictly after `afterUtc` — E1's "next lesson" hint on a free day. */
export function nextUpcomingLesson(lessons: Lesson[], afterUtc: string): Lesson | null {
  const upcoming = lessons
    .filter((l) => l.status === 'Scheduled' && l.startUtc > afterUtc)
    .sort((a, b) => a.startUtc.localeCompare(b.startUtc));
  return upcoming[0] ?? null;
}
