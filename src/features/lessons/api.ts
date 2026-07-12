import { apiRequest } from '@/shared/api';
import type {
  Lesson,
  CreateLessonRequest,
  UpdateLessonRequest,
  LessonSeries,
  CreateLessonSeriesRequest,
  UpdateLessonSeriesRequest,
  CancelSeriesResponse,
} from '@/shared/api';

/**
 * `GET /lessons?from&to` — the schedule overlapping the range: physical
 * lessons (cancelled included) merged with virtual series slots expanded on
 * the fly. Read-only on the server.
 */
export const getLessons = (fromIso: string, toIso: string, signal?: AbortSignal) => {
  const params = new URLSearchParams({ from: fromIso, to: toIso });
  return apiRequest<Lesson[]>(`/lessons?${params}`, { signal });
};

/** `GET /lessons/{id}`. */
export const getLesson = (id: string, signal?: AbortSignal) =>
  apiRequest<Lesson>(`/lessons/${id}`, { signal });

/** `POST /lessons` — one-off lesson. 409 → ApiError.conflicts. */
export const createLesson = (body: CreateLessonRequest) =>
  apiRequest<Lesson>('/lessons', { method: 'POST', body: JSON.stringify(body) });

/** `PATCH /lessons/{id}` — partial update of a physical lesson; cancelling is `{ status: "Cancelled" }`. */
export const updateLesson = (id: string, body: UpdateLessonRequest) =>
  apiRequest<Lesson>(`/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

/**
 * `PATCH /lessons/series/{seriesId}/occurrences/{occurrenceDate}` — mutates one
 * slot of a series by its original date, materializing it on demand. The body
 * is the same partial update as `PATCH /lessons/{id}`.
 */
export const updateOccurrence = (seriesId: string, occurrenceDate: string, body: UpdateLessonRequest) =>
  apiRequest<Lesson>(`/lessons/series/${seriesId}/occurrences/${occurrenceDate}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

/** `GET /lessons/series` — all series of the tutor, inactive included. */
export const getSeriesList = (signal?: AbortSignal) =>
  apiRequest<LessonSeries[]>('/lessons/series', { signal });

/** `GET /lessons/series/{id}`. */
export const getSeries = (id: string, signal?: AbortSignal) =>
  apiRequest<LessonSeries>(`/lessons/series/${id}`, { signal });

/** `POST /lessons/series`. 409 → ApiError.conflicts; needs a saved profile. */
export const createSeries = (body: CreateLessonSeriesRequest) =>
  apiRequest<LessonSeries>('/lessons/series', { method: 'POST', body: JSON.stringify(body) });

/** `PATCH /lessons/series/{id}` — metadata only (title, price); days, time and end date are immutable here. */
export const updateSeries = (id: string, body: UpdateLessonSeriesRequest) =>
  apiRequest<LessonSeries>(`/lessons/series/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

/**
 * `POST /lessons/series/{id}/cancel` — ends the series as of today: future
 * virtual slots stop expanding, past occurrences and physical lessons stay.
 * Returns the ended series plus the future materialized overrides that were removed.
 */
export const cancelSeries = (id: string) =>
  apiRequest<CancelSeriesResponse>(`/lessons/series/${id}/cancel`, { method: 'POST' });
