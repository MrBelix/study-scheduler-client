import { apiRequest } from '@/shared/api';
import type { Dashboard, DashboardPeriodKind } from '@/shared/api';

/**
 * `GET /reports/dashboard?period&anchor` — the whole Money screen payload for one reporting
 * window: income (received/expected/previous), the all-time debt ledger, lesson counts, weekly
 * load, chart buckets and per-student income. `anchor` (`yyyy-MM-dd`) is any date inside the
 * wanted window — omitted, the server resolves "today" in the tutor's own time zone.
 */
export const getDashboard = (period: DashboardPeriodKind, anchor?: string, signal?: AbortSignal) => {
  const params = new URLSearchParams({ period });
  if (anchor) params.set('anchor', anchor);
  return apiRequest<Dashboard>(`/reports/dashboard?${params}`, { signal });
};
