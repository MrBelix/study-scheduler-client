import { apiRequest } from '@/shared/api';
import type {
  Lesson,
  CreateLessonRequest,
  CreateLessonResponse,
  UpdateLessonRequest,
  SettleLessonsRequest,
  SettleLessonsResponse,
  LessonSeries,
  UpdateLessonSeriesRequest,
  UpdateSeriesResponse,
  CancelSeriesResponse,
} from '@/shared/api';

/**
 * `GET /lessons?from&to&studentId` — the schedule overlapping the range: every
 * occurrence is already a physical row (series lessons are generated eagerly,
 * not expanded on the fly), cancelled ones included. `studentId` narrows it to
 * one student's schedule. Read-only on the server.
 */
export const getLessons = (fromIso: string, toIso: string, studentId?: string, signal?: AbortSignal) => {
  const params = new URLSearchParams({ from: fromIso, to: toIso });
  if (studentId) params.set('studentId', studentId);
  return apiRequest<Lesson[]>(`/lessons?${params}`, { signal });
};

/** `GET /lessons/{id}` — the lesson row by its Guid id (see `Lesson.id`). */
export const getLesson = (id: string, signal?: AbortSignal) => apiRequest<Lesson>(`/lessons/${id}`, { signal });

/**
 * `POST /lessons` — the one create route: a one-off lesson without `repeat`,
 * a weekly series with it. Returns exactly one of `lesson`/`series`. 409 →
 * ApiError.conflicts; needs a saved profile.
 */
export const createLesson = (body: CreateLessonRequest) =>
  apiRequest<CreateLessonResponse>('/lessons', { method: 'POST', body: JSON.stringify(body) });

/**
 * `PATCH /lessons/{id}` — partial update of any lesson, addressed by its Guid id; cancelling is
 * `{ status: "Cancelled" }`.
 */
export const updateLesson = (id: string, body: UpdateLessonRequest) =>
  apiRequest<Lesson>(`/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

/**
 * `POST /lessons/settle` — marks unpaid Completed lessons paid in bulk (the student debts page's
 * confirm action). Distinct ids only (duplicates deduped); an already-paid id is an idempotent
 * no-op still counted in the response. All-or-nothing: a 400 (unknown/non-Completed id) saves
 * nothing.
 */
export const settleLessons = (body: SettleLessonsRequest) =>
  apiRequest<SettleLessonsResponse>('/lessons/settle', { method: 'POST', body: JSON.stringify(body) });

/** `GET /lessons/series` — all series of the tutor, inactive included. */
export const getSeriesList = (signal?: AbortSignal) =>
  apiRequest<LessonSeries[]>('/lessons/series', { signal });

/** `GET /lessons/series/{id}`. */
export const getSeries = (id: string, signal?: AbortSignal) =>
  apiRequest<LessonSeries>(`/lessons/series/${id}`, { signal });

/**
 * `PATCH /lessons/series/{id}` — a full edit: title, price, the weekly
 * schedule (weekdays/time/duration) and the end date. Returns the updated
 * series plus any future rows the change swept away.
 */
export const updateSeries = (id: string, body: UpdateLessonSeriesRequest) =>
  apiRequest<UpdateSeriesResponse>(`/lessons/series/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

/**
 * `POST /lessons/series/{id}/cancel` — ends the series as of today: no more rows
 * generate past it, while past occurrences stay exactly as they are.
 * `keepCustomized` is optional and defaults to `true` server-side when omitted.
 * Returns the ended series plus the future rows that got swept away.
 */
export const cancelSeries = (id: string, keepCustomized?: boolean) =>
  apiRequest<CancelSeriesResponse>(`/lessons/series/${id}/cancel`, {
    method: 'POST',
    body: keepCustomized === undefined ? undefined : JSON.stringify({ keepCustomized }),
  });
