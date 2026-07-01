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

/** Signed balance label + color token: +green / −red / 0 hint. */
export function balanceText(balance: number): string {
  if (balance > 0) return `+${fmt(balance)} ₴`;
  if (balance < 0) return `−${fmt(balance)} ₴`;
  return '0 ₴';
}

export function balanceColor(balance: number): string {
  if (balance > 0) return 'var(--ds-color-success)';
  if (balance < 0) return 'var(--ds-color-danger)';
  return 'var(--ds-color-hint)';
}

/** List-row subtitle: "{subject} · {rate} ₴/год", or a muted placeholder. */
export function studentSubtitle(student: Student): { text: string; muted: boolean } {
  if (!student.subject) return { text: m.subject_none(), muted: true };
  if (student.rate) {
    return { text: m.subtitle_subject_rate({ subject: student.subject, rate: fmt(student.rate) }), muted: false };
  }
  return { text: student.subject, muted: false };
}

/** Short localized date, e.g. "12 січ 2026" / "12 Jan 2026". Falls back to raw. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(getAppLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

/**
 * Per-student finances. The backend Student DTO does not yet expose payments or
 * lessons, so these derive to zero for now. When `GET /students` returns paid /
 * lessons, read them here and the UI (balances, debtors) lights up unchanged.
 */
export interface Finance {
  paid: number;
  lessons: number;
  balance: number;
}

export function deriveFinance(student: Student): Finance {
  const paid = 0;
  const lessons = 0;
  return { paid, lessons, balance: paid - lessons * student.rate };
}
