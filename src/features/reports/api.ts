import { apiRequest } from '@/shared/api';
import type { ReportSummary } from '@/shared/api';

/**
 * `GET /reports/summary?from&to` — tutor-scoped accounting totals for the
 * half-open range (max 366 days, same validation as `GET /lessons`).
 */
export const getReportSummary = (fromIso: string, toIso: string, signal?: AbortSignal) => {
  const params = new URLSearchParams({ from: fromIso, to: toIso });
  return apiRequest<ReportSummary>(`/reports/summary?${params}`, { signal });
};
