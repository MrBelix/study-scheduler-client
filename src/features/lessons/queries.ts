import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateLessonRequest, UpdateLessonRequest, UpdateLessonSeriesRequest, SettleLessonsRequest } from '@/shared/api';
import { lessonKeys, reportKeys, studentKeys } from '@/shared/api';
import {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  settleLessons,
  getSeriesList,
  getSeries,
  updateSeries,
  cancelSeries,
} from './api';

/** Lessons overlapping [from, to) — every series occurrence in range is already a physical row. `studentId` narrows it to one student's schedule. */
export function useLessons(fromIso: string, toIso: string, studentId?: string) {
  return useQuery({
    queryKey: lessonKeys.range(fromIso, toIso, studentId),
    queryFn: ({ signal }) => getLessons(fromIso, toIso, studentId, signal),
  });
}

/** A single lesson by its Guid id (`Lesson.id`). */
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

/**
 * The one create mutation: a one-off lesson without `body.repeat`, a weekly series with it.
 * Result carries exactly one of `lesson`/`series`.
 */
export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLessonRequest) => createLesson(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      // Server-computed `nextLesson` subtitles (students list + student detail hero) depend on the
      // schedule, so they go stale the moment a lesson is created too.
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}

/** Partial update of any lesson, addressed by its Guid id. */
export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateLessonRequest }) => updateLesson(id, body),
    onSuccess: () => {
      // Lesson ids don't survive a series sweep-and-regenerate, so a plain range/list
      // invalidation isn't enough on its own — `lessonKeys.all` also covers every open
      // `lessonKeys.detail(id)` query, whose refetch then 404s if that id got swept away.
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      // Completing/cancelling/rescheduling a lesson changes the student's next-lesson projection.
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}

/** Bulk-settle: marks a set of unpaid Completed lessons paid — the student debts page's confirm action. */
export function useSettleLessons() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SettleLessonsRequest) => settleLessons(body),
    onSuccess: () => {
      // `StudentDetails.debt`/`moneyReceived`, the debts list itself, and the reports dashboard's
      // debt ledger/income all derive from `isPaid` — all three scopes go stale together.
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

/** Full edit of a series — title, price, schedule (weekdays/time/duration) and end date alike. */
export function useUpdateSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateLessonSeriesRequest }) => updateSeries(id, body),
    onSuccess: () => {
      // A schedule/window change regenerates the series' future rows under new ids — invalidating
      // `lessonKeys.all` (not just the range) also covers any open `lessonKeys.detail(id)` query for
      // an id that no longer resolves.
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      // A schedule/`endDate` tightening can remove a student's next scheduled occurrence.
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}

export function useCancelSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, keepCustomized }: { id: string; keepCustomized?: boolean }) => cancelSeries(id, keepCustomized),
    onSuccess: () => {
      // Cancelling sweeps the series' future rows — see the note in `useUpdateSeries`.
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}
