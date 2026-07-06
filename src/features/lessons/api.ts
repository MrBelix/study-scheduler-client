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
 * `GET /lessons?from&to` — lessons overlapping the range (cancelled included).
 * This call is also what materializes series lessons on the server.
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

/** `PATCH /lessons/{id}` — partial update; cancelling is `{ status: "Cancelled" }`. */
export const updateLesson = (id: string, body: UpdateLessonRequest) =>
  apiRequest<Lesson>(`/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

/** `GET /lessons/series` — all series of the tutor, inactive included. */
export const getSeriesList = (signal?: AbortSignal) =>
  apiRequest<LessonSeries[]>('/lessons/series', { signal });

/** `GET /lessons/series/{id}`. */
export const getSeries = (id: string, signal?: AbortSignal) =>
  apiRequest<LessonSeries>(`/lessons/series/${id}`, { signal });

/** `POST /lessons/series`. 409 → ApiError.conflicts; needs a saved profile. */
export const createSeries = (body: CreateLessonSeriesRequest) =>
  apiRequest<LessonSeries>('/lessons/series', { method: 'POST', body: JSON.stringify(body) });

/** `PATCH /lessons/series/{id}` — only title/endDate/price; days and time are immutable. */
export const updateSeries = (id: string, body: UpdateLessonSeriesRequest) =>
  apiRequest<LessonSeries>(`/lessons/series/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

/** `POST /lessons/series/{id}/cancel` — deactivates and cancels future Scheduled lessons. */
export const cancelSeries = (id: string) =>
  apiRequest<CancelSeriesResponse>(`/lessons/series/${id}/cancel`, { method: 'POST' });
