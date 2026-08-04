import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { reportKeys } from '@/shared/api';
import type { DashboardPeriodKind } from '@/shared/api';
import { getDashboard } from './api';

/**
 * The Money dashboard for one period window, anchored on `anchor` (`yyyy-MM-dd`, inside the window).
 * `placeholderData: keepPreviousData` keeps the previous period's numbers on screen while the new
 * one loads instead of unmounting to the skeleton on every nav tap — `GlobalProgressBar` (it tracks
 * `useIsFetching` regardless of `placeholderData`) still shows the in-flight fetch.
 */
export function useDashboard(period: DashboardPeriodKind, anchor: string) {
  return useQuery({
    queryKey: reportKeys.dashboard(period, anchor),
    queryFn: ({ signal }) => getDashboard(period, anchor, signal),
    placeholderData: keepPreviousData,
  });
}
