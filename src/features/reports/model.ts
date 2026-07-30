import { m } from '@/paraglide/messages';
import { getAppLocale } from '@/shared/i18n';
import { startOfWeek, startOfMonth, startOfQuarter, addDays, addMonths } from '@/shared/lib';
import { fmtWeekRange } from '@/features/lessons/model';

export type Period = 'week' | 'month' | 'quarter';

/** Local start (00:00) of the period containing `d`. */
export function periodStart(period: Period, d: Date): Date {
  if (period === 'week') return startOfWeek(d);
  if (period === 'month') return startOfMonth(d);
  return startOfQuarter(d);
}

/** Exclusive end of the period starting at `start`. */
export function periodEnd(period: Period, start: Date): Date {
  if (period === 'week') return addDays(start, 7);
  if (period === 'month') return addMonths(start, 1);
  return addMonths(start, 3);
}

/** `start` shifted by `delta` whole periods (negative moves back). */
export function shiftPeriod(period: Period, start: Date, delta: number): Date {
  if (period === 'week') return addDays(start, 7 * delta);
  if (period === 'month') return addMonths(start, delta);
  return addMonths(start, 3 * delta);
}

/** Nav label for the period, e.g. "3 – 9 серпня" / "липень 2026" / "III квартал 2026". */
export function fmtPeriodLabel(period: Period, start: Date): string {
  if (period === 'week') return fmtWeekRange(start);
  const locale = getAppLocale();
  if (period === 'month') {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(start);
  }
  const quarter = Math.floor(start.getMonth() / 3) + 1; // 1-4
  const roman = ['I', 'II', 'III', 'IV'][quarter - 1];
  return m.reports_quarter_label({ roman, num: quarter, year: start.getFullYear() });
}
