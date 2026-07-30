import { useQuery } from '@tanstack/react-query';
import { reportKeys } from '@/shared/api';
import { getReportSummary } from './api';

/** Accounting summary for the range [fromIso, toIso). */
export function useReportSummary(fromIso: string, toIso: string) {
  return useQuery({
    queryKey: reportKeys.summary(fromIso, toIso),
    queryFn: ({ signal }) => getReportSummary(fromIso, toIso, signal),
  });
}
