import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateLessonRequest, CreateLessonSeriesRequest, UpdateLessonRequest, UpdateLessonSeriesRequest } from '@/shared/api';
import { getLessons, getLesson, createLesson, updateLesson, updateOccurrence, getSeriesList, getSeries, createSeries, updateSeries, cancelSeries } from './api';

/**
 * Query-key factory. Everything nests under `all`, so a single invalidation
 * after any mutation refreshes ranges, details and series alike.
 */
export const lessonKeys = {
  all: ['lessons'] as const,
  range: (fromIso: string, toIso: string) => ['lessons', 'range', fromIso, toIso] as const,
  detail: (id: string) => ['lessons', 'detail', id] as const,
  seriesList: ['lessons', 'series'] as const,
  series: (id: string) => ['lessons', 'series', id] as const,
};

/** Lessons overlapping [from, to). Fetching is what materializes series lessons. */
export function useLessons(fromIso: string, toIso: string) {
  return useQuery({
    queryKey: lessonKeys.range(fromIso, toIso),
    queryFn: ({ signal }) => getLessons(fromIso, toIso, signal),
  });
}

export function useLesson(id: string | undefined) {
  return useQuery({
    queryKey: lessonKeys.detail(id ?? ''),
    queryFn: ({ signal }) => getLesson(id!, signal),
    enabled: Boolean(id),
  });
}

/** Every series of the tutor — screens filter by student/activity themselves. */
export function useSeriesList() {
  return useQuery({
    queryKey: lessonKeys.seriesList,
    queryFn: ({ signal }) => getSeriesList(signal),
  });
}

export function useLessonSeries(id: string | null | undefined) {
  return useQuery({
    queryKey: lessonKeys.series(id ?? ''),
    queryFn: ({ signal }) => getSeries(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLessonRequest) => createLesson(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: lessonKeys.all }),
  });
}

/** Physical lesson (`lessonId`) or a series slot (`seriesId`+`occurrenceDate`, materialized on demand). */
export type LessonTarget = { lessonId: string } | { seriesId: string; occurrenceDate: string };

/** Partial update routed by target — one hook for both physical lessons and virtual slots. */
export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ target, body }: { target: LessonTarget; body: UpdateLessonRequest }) =>
      'lessonId' in target
        ? updateLesson(target.lessonId, body)
        : updateOccurrence(target.seriesId, target.occurrenceDate, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: lessonKeys.all }),
  });
}

export function useCreateSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLessonSeriesRequest) => createSeries(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: lessonKeys.all }),
  });
}

export function useUpdateSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateLessonSeriesRequest }) => updateSeries(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: lessonKeys.all }),
  });
}

export function useCancelSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelSeries(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: lessonKeys.all }),
  });
}
