import type { Student } from '@/shared/api';
import { m } from '@/paraglide/messages';
import { getAppLocale } from '@/shared/i18n';

const NBSP = ' ';

/** Absolute integer with thin-space (NBSP) thousands, e.g. 1050 → "1 050". */
export function fmt(n: number): string {
  return String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/** Money with the hryvnia symbol, e.g. 2400 → "2 400 ₴". */
export function money(n: number): string {
  return `${fmt(n)} ₴`;
}

/**
 * List-row subtitle: "{subject} · {rate} ₴/год", or a muted placeholder.
 * `subject` defaults to the student's own field; pass a derived value (e.g.
 * subjects from active series) to override it.
 */
export function studentSubtitle(student: Student, subject = student.subject): { text: string; muted: boolean } {
  if (!subject) return { text: m.subject_none(), muted: true };
  if (student.rate) {
    return { text: m.subtitle_subject_rate({ subject, rate: fmt(student.rate) }), muted: false };
  }
  return { text: subject, muted: false };
}

/** Short localized date, e.g. "12 січ 2026" / "12 Jan 2026". Falls back to raw. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(getAppLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}
