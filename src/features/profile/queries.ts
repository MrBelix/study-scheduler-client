import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import type { UpdateProfileRequest } from '@/shared/api';
import { lessonKeys } from '@/features/lessons/queries';
import { getProfile, putProfile, getTimeZones } from './api';

/** Query-key factory — the single source for cache keys in this feature. */
export const profileKeys = {
  all: ['profile'] as const,
  timezones: ['profile', 'timezones'] as const,
};

/**
 * The tutor profile. 404 (profile not saved yet) is part of the flow, not a
 * failure — exposed as `isNotFound` so screens can branch to onboarding.
 */
export function useProfile() {
  const query = useQuery({
    queryKey: profileKeys.all,
    queryFn: ({ signal }) => getProfile(signal),
  });
  const isNotFound = query.error instanceof ApiError && query.error.status === 404;
  return { ...query, isNotFound };
}

/** Server-accepted IANA zone ids — static per deployment, so cache forever. */
export function useTimeZones() {
  return useQuery({
    queryKey: profileKeys.timezones,
    queryFn: ({ signal }) => getTimeZones(signal),
    staleTime: Infinity,
  });
}

export function useSaveProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => putProfile(body),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.all, profile);
      // Occurrence times are materialized in the profile time zone — refetch.
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
}
