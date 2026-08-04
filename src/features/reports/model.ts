import { m } from '@/paraglide/messages';
import { getAppLocale } from '@/shared/i18n';
import { startOfWeek, startOfMonth, startOfQuarter, addDays, addMonths, pluralUk } from '@/shared/lib';
import { fmtWeekRange } from '@/features/lessons/model';
import type { DashboardPeriodKind, DashboardBucket, StudentIncome } from '@/shared/api';

/** Local start (00:00) of the period containing `d`. */
export function periodStart(period: DashboardPeriodKind, d: Date): Date {
  if (period === 'week') return startOfWeek(d);
  if (period === 'month') return startOfMonth(d);
  return startOfQuarter(d);
}

/** `start` shifted by `delta` whole periods (negative moves back). */
export function shiftPeriod(period: DashboardPeriodKind, start: Date, delta: number): Date {
  if (period === 'week') return addDays(start, 7 * delta);
  if (period === 'month') return addMonths(start, delta);
  return addMonths(start, 3 * delta);
}

/** Nav label for the period, e.g. "3 – 9 серпня" / "Серпень 2026" / "III квартал 2026". */
export function fmtPeriodLabel(period: DashboardPeriodKind, start: Date): string {
  if (period === 'week') return fmtWeekRange(start);
  const locale = getAppLocale();
  if (period === 'month') {
    const raw = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(start);
    return raw.charAt(0).toLocaleUpperCase(locale) + raw.slice(1);
  }
  const quarter = Math.floor(start.getMonth() / 3) + 1; // 1-4
  const roman = ['I', 'II', 'III', 'IV'][quarter - 1];
  return m.reports_quarter_label({ roman, num: quarter, year: start.getFullYear() });
}

/** "УРОКИ ЗА МІСЯЦЬ" section header, per period kind (Ukrainian case differs per word). */
export function lessonsHeaderLabel(period: DashboardPeriodKind): string {
  if (period === 'week') return m.reports_lessons_header_week();
  if (period === 'month') return m.reports_lessons_header_month();
  return m.reports_lessons_header_quarter();
}

/** "2 уроки" — generic lesson-count label, locale-aware (uk has 3 plural forms, en just 2). */
export function lessonsCountLabel(count: number): string {
  if (getAppLocale() === 'uk') {
    return pluralUk(count, {
      one: m.schedule_lessons_count_one({ count }),
      few: m.schedule_lessons_count_few({ count }),
      many: m.schedule_lessons_count_many({ count }),
    });
  }
  return count === 1 ? m.schedule_lessons_count_one({ count }) : m.schedule_lessons_count_many({ count });
}

/** "3 боржники" — debtor-count label, locale-aware. */
export function debtorsCountLabel(count: number): string {
  if (getAppLocale() === 'uk') {
    return pluralUk(count, {
      one: m.reports_debtors_count_one({ count }),
      few: m.reports_debtors_count_few({ count }),
      many: m.reports_debtors_count_many({ count }),
    });
  }
  return count === 1 ? m.reports_debtors_count_one({ count }) : m.reports_debtors_count_many({ count });
}

/** "11" / "11.5" — weekly-load hours, trimmed to a whole number when there's no fraction. */
export function fmtHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/**
 * The received-vs-previous-period trend pill: `null` when there's no baseline to compare against
 * (`previous` is 0 — the pill is hidden rather than showing a meaningless "+∞%"). Negative reads as
 * `warn`, zero and positive as `ok`.
 */
export interface IncomeTrend {
  percent: number;
  tone: 'ok' | 'warn';
}

export function incomeTrend(actual: number, previous: number): IncomeTrend | null {
  if (previous === 0) return null;
  const percent = Math.round(((actual - previous) / previous) * 100);
  return { percent, tone: percent < 0 ? 'warn' : 'ok' };
}

const CHART_HEIGHT_PX = 76;
const MIN_BAR_PX = 4;
const MIN_PAST_OPACITY = 0.35;
// A fully-past bucket never reaches full opacity, even at the busiest relative value — otherwise it'd
// be indistinguishable from the current bucket's solid `ok` (etalon intent: the "now" bar stays the
// one clearly-solid bar on the chart).
const MAX_PAST_OPACITY = 0.85;
const FLAT_FRACTION = 0.12; // all-buckets-empty fallback so bars still read as bars, not lines

export interface BucketBar {
  key: string;
  heightPx: number;
  tone: 'ok' | 'accent';
  opacity: number;
  /** Bold, brighter label — the bucket containing today. */
  emphasize: boolean;
  label: string;
}

/**
 * Bar geometry + color for the "УРОКИ ЗА ..." chart, one entry per bucket. Height is proportional
 * to the bucket's own lesson count against the busiest bucket. A bucket fully in the past renders
 * `ok` at an opacity graded by that same relative value (capped below full — see `MAX_PAST_OPACITY`);
 * a current/future bucket that still has scheduled lessons renders `accent` at a flat 50% (not
 * settled yet); anything else (the current bucket once everything in it is already completed)
 * renders solid `ok`.
 */
export function buildBucketBars(
  period: DashboardPeriodKind,
  buckets: readonly DashboardBucket[],
  todayKey: string,
): BucketBar[] {
  const maxValue = buckets.reduce((max, b) => Math.max(max, b.completedCount + b.scheduledCount), 0);

  return buckets.map((b, i) => {
    const value = b.completedCount + b.scheduledCount;
    const fraction = maxValue > 0 ? value / maxValue : FLAT_FRACTION;
    const heightPx = Math.max(MIN_BAR_PX, Math.round(fraction * CHART_HEIGHT_PX));
    const isFullyPast = b.to < todayKey;
    const isCurrent = !isFullyPast && b.from <= todayKey;

    let tone: BucketBar['tone'];
    let opacity: number;
    if (isFullyPast) {
      tone = 'ok';
      const rawOpacity = maxValue > 0 ? MIN_PAST_OPACITY + fraction * (1 - MIN_PAST_OPACITY) : MAX_PAST_OPACITY;
      opacity = Math.min(MAX_PAST_OPACITY, rawOpacity);
    } else if (b.scheduledCount > 0) {
      tone = 'accent';
      opacity = 0.5;
    } else {
      tone = 'ok';
      opacity = 1;
    }

    const label = period === 'week' ? weekdayNarrow(b.from) : m.reports_bucket_week({ num: i + 1 });
    return { key: b.from, heightPx, tone, opacity, emphasize: isCurrent, label };
  });
}

function weekdayNarrow(dateKeyStr: string): string {
  const d = new Date(`${dateKeyStr}T00:00`);
  return new Intl.DateTimeFormat(getAppLocale(), { weekday: 'narrow' }).format(d);
}

export interface StudentIncomeBar {
  studentId: string;
  name: string;
  income: number;
  /** 0-100. */
  widthPct: number;
  /** 0-1 — 1 for the top earner, graded down for the rest. */
  opacity: number;
}

/**
 * Bar geometry for the "ДОХІД ПО СТУДЕНТАХ" list — `perStudent` is already sorted by income
 * (server-side), so the first entry is the max the rest are measured against.
 */
export function buildStudentIncomeBars(perStudent: readonly StudentIncome[]): StudentIncomeBar[] {
  const max = perStudent[0]?.income ?? 0;
  return perStudent.map((s, i) => {
    const fraction = max > 0 ? s.income / max : 0;
    return {
      studentId: s.studentId,
      name: s.name,
      income: s.income,
      widthPct: Math.round(fraction * 100),
      opacity: i === 0 ? 1 : Math.max(MIN_PAST_OPACITY, fraction),
    };
  });
}
