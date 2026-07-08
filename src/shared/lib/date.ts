import { getAppLocale } from '@/shared/i18n';

// All calendar math and formatting below is in the DEVICE time zone — for a
// tutor it matches the profile time zone in the normal case (onboarding offers
// exactly the detected one).

/** Short localized date, e.g. "12 січ 2026" / "12 Jan 2026". Falls back to raw. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(getAppLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
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
