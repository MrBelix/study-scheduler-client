// API contract — hand-written to mirror the StudyScheduler server.
// The server (.NET minimal API) serializes JSON as camelCase and returns
// Guids as strings. Keep these in sync with the backend DTOs.

/** Lifecycle status of a student. */
export type StudentStatus = 'Active' | 'Archived';

/** Student projection — `GET /students`, `POST /students`. */
export interface Student {
  id: string;
  name: string;
  rate: number;
  status: StudentStatus;
  createdAtUtc: string;
}

/** Body for `POST /students`. `rate` omitted defaults to 0 on the server. */
export interface CreateStudentRequest {
  name: string;
  rate?: number;
}

/** Body for `PATCH /students/{id}` — only provided fields are applied. */
export interface UpdateStudentRequest {
  name?: string;
  rate?: number;
  status?: StudentStatus;
}

/**
 * Tutor (member) settings — `GET /profile`, `PUT /profile` (upsert).
 * `languageCode` is the preferred UI language ("uk" | "en"), null until chosen.
 * `remindMinutes` — bot reminder lead time; null means reminders are off.
 */
export interface Profile {
  timeZoneId: string;
  languageCode: string | null;
  remindMinutes: number | null;
  notifyAfterLesson: boolean;
  createdAtUtc: string;
}

/**
 * Omitted fields keep their stored values; `remindMinutes: 0` turns reminders
 * off (an omitted field can't, or unrelated saves would disable them).
 */
export interface UpdateProfileRequest {
  timeZoneId: string;
  languageCode?: string;
  remindMinutes?: number;
  notifyAfterLesson?: boolean;
}

/** Lifecycle status of a lesson. */
export type LessonStatus = 'Scheduled' | 'Completed' | 'Cancelled';

/**
 * Lesson projection — `GET /lessons`. `seriesId`/`occurrenceDate` are set for
 * series lessons. `isVirtual` true means the slot was expanded on the fly from
 * its series and has no database row (`id` is null) — mutate it via
 * `PATCH /lessons/series/{seriesId}/occurrences/{occurrenceDate}`.
 */
export interface Lesson {
  id: string | null;
  studentId: string;
  seriesId: string | null;
  occurrenceDate: string | null;
  startUtc: string;
  endUtc: string;
  durationMinutes: number;
  status: LessonStatus;
  price: number;
  isPaid: boolean;
  topic: string | null;
  description: string | null;
  isVirtual: boolean;
  createdAtUtc: string;
}

/** Body for `POST /lessons` (one-off). `price` omitted falls back to the student's rate. */
export interface CreateLessonRequest {
  studentId: string;
  startUtc: string;
  durationMinutes: number;
  price?: number;
  topic?: string;
  description?: string;
}

/**
 * Body for `PATCH /lessons/{id}` and the occurrence-mutation endpoint —
 * only provided fields are applied.
 */
export interface UpdateLessonRequest {
  startUtc?: string;
  durationMinutes?: number;
  status?: LessonStatus;
  price?: number;
  isPaid?: boolean;
  topic?: string;
  description?: string;
}

/**
 * Series projection — `GET /lessons/series`. `weekdays` is a flags string
 * (e.g. "Monday, Thursday"); `startTimeLocal` is wall clock in `timeZoneId`.
 */
export interface LessonSeries {
  id: string;
  studentId: string;
  title: string | null;
  startDate: string;
  endDate: string | null;
  weekdays: string;
  startTimeLocal: string;
  durationMinutes: number;
  timeZoneId: string;
  price: number | null;
  createdAtUtc: string;
}

/**
 * Body for `POST /lessons/series`. `startTimeLocal` is wall clock in the
 * profile zone.
 */
export interface CreateLessonSeriesRequest {
  studentId: string;
  title?: string;
  startDate: string;
  weekdays: string;
  startTimeLocal: string;
  durationMinutes: number;
  endDate?: string | null;
  price?: number | null;
}

/**
 * Body for `PATCH /lessons/series/{id}` — metadata only (title, price); only
 * provided fields are applied. The schedule (days/time) and the end date can't
 * change here — end a series via `POST .../cancel` (ends it as of today).
 */
export interface UpdateLessonSeriesRequest {
  title?: string;
  price?: number;
}

/**
 * Result of `POST /lessons/series/{id}/cancel` — the ended series plus the
 * future materialized overrides that were removed (individually-edited lessons
 * beyond today), so the client can tell the tutor what went away.
 */
export interface CancelSeriesResponse {
  series: LessonSeries;
  removedLessons: Lesson[];
}
