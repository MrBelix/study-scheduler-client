import type { StudentNextLesson, StudentNextLessonDetails } from '@/shared/api';
import { m } from '@/paraglide/messages';
import { dateKey, fmtTime } from '@/shared/lib';
import { routes } from '@/shared/routing';
import { weekdayShortLabel } from '@/features/lessons/model';

/**
 * Students-list row subtitle: the next scheduled lesson ("Сьогодні о 18:00 ·
 * Алгебра" / "пт о 16:00 · Геометрія"), or a placeholder when nothing is
 * planned. Device-local time.
 */
export function formatNextLesson(next: StudentNextLesson | null, now = new Date()): string {
  if (!next) return m.students_next_none();
  const at = new Date(next.startUtc);
  const time = fmtTime(next.startUtc);
  const when =
    dateKey(at) === dateKey(now)
      ? m.students_next_today({ time })
      : m.students_next_day({ day: weekdayShortLabel((at.getDay() + 6) % 7), time });
  return next.subject ? `${when} · ${next.subject}` : when;
}

/**
 * "сьогодні" / "пт" — day word for the student page's hero card subtitle,
 * same conventions as the list's next-lesson formatting above.
 */
export function nextLessonDayWord(startUtc: string, now = new Date()): string {
  const at = new Date(startUtc);
  return dateKey(at) === dateKey(now) ? m.week_today() : weekdayShortLabel((at.getDay() + 6) % 7);
}

/** "через 25 хв" / "через 3 год" / "через 4 дн" — lead time to a lesson, device-local. */
export function formatLeadTime(startUtc: string, now = new Date()): string {
  const minutes = Math.max(0, Math.round((new Date(startUtc).getTime() - now.getTime()) / 60_000));
  if (minutes < 60) return m.detail_next_in_minutes({ minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 24) return m.detail_next_in_hours({ hours });
  return m.detail_next_in_days({ days: Math.round(hours / 24) });
}

/** Detail-page route for the student's next lesson — `lessonId` is the lesson's Guid id. */
export function nextLessonPath(next: StudentNextLessonDetails): string {
  return routes.lessons.details(next.lessonId);
}
