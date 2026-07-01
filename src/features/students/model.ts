import type { Student } from '@/shared/api';

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
  if (!student.subject) return { text: 'Предмет не вказано', muted: true };
  const rate = student.rate ? ` · ${fmt(student.rate)} ₴/год` : '';
  return { text: `${student.subject}${rate}`, muted: false };
}

/** Short Ukrainian date, e.g. "12 січ 2026". Falls back to the raw string. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
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
