import { getAppLocale } from '@/shared/i18n';

// All calendar math and formatting below is in the DEVICE time zone — for a
// tutor it matches the profile time zone in the normal case (onboarding offers
// exactly the detected one).

/** Strict `yyyy-MM-dd` shape check — a bare date, not a full ISO instant. */
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses a bare `yyyy-MM-dd` as a LOCAL calendar day (`new Date(y, m-1, d)`),
 * not `new Date(string)` — the latter reads a date-only string as UTC
 * midnight, which renders as the previous day for any device time zone behind
 * UTC. Full ISO instants (with a time part) go through `new Date` as-is.
 */
function parseIsoOrDateOnly(iso: string): Date {
  if (DATE_ONLY_RE.test(iso)) {
    const [y, mo, d] = iso.split('-').map(Number);
    return new Date(y, mo - 1, d);
  }
  return new Date(iso);
}

/**
 * Short localized date, e.g. "12 січ 2026" / "12 Jan 2026". Falls back to raw.
 * Accepts a bare `yyyy-MM-dd` or a full ISO instant alike — see `parseIsoOrDateOnly`.
 */
export function formatDate(iso: string): string {
  const d = parseIsoOrDateOnly(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(getAppLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

/**
 * Day + full month, no year, e.g. "31 травня" / "May 31" — uk renders genitive
 * via Intl. Falls back to raw. Accepts a bare `yyyy-MM-dd` (e.g. a series'
 * `endDate`) or a full ISO instant alike — see `parseIsoOrDateOnly`.
 */
export function formatDayMonth(iso: string): string {
  const d = parseIsoOrDateOnly(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(getAppLocale(), { day: 'numeric', month: 'long' }).format(d);
}

/** Day + short month, no year, e.g. "28 лип." / "Jul 28". Falls back to raw. */
export function formatDayShortMonth(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(getAppLocale(), { day: 'numeric', month: 'short' }).format(d);
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

/** 1st of the month containing `d` (local time), 00:00. */
export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** 1st day of the calendar quarter containing `d` (local time), 00:00. */
export function startOfQuarter(d: Date): Date {
  return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
}

export function addMonths(d: Date, months: number): Date {
  const result = new Date(d);
  result.setMonth(result.getMonth() + months);
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
