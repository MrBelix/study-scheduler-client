// API contract — hand-written to mirror the StudyScheduler server.
// The server (.NET minimal API) serializes JSON as camelCase and returns
// Guids as strings. Keep these in sync with the backend DTOs.

/** Current Telegram user — `GET /me`. */
export interface Me {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

/** Lifecycle status of a student. */
export type StudentStatus = 'Active' | 'Archived';

/** Student projection — `GET /students`, `POST /students`. */
export interface Student {
  id: string;
  name: string;
  rate: number;
  subject?: string;
  contact?: string;
  /** Informational IANA time zone id of the student. */
  timeZoneId?: string | null;
  status: StudentStatus;
  createdAtUtc: string;
}

/** Body for `POST /students`. `rate` omitted defaults to 0 on the server. */
export interface CreateStudentRequest {
  name: string;
  rate?: number;
  subject?: string;
  contact?: string;
  timeZoneId?: string;
}

/** Body for `PATCH /students/{id}` — only provided fields are applied. */
export interface UpdateStudentRequest {
  name?: string;
  rate?: number;
  subject?: string;
  contact?: string;
  timeZoneId?: string;
  status?: StudentStatus;
}

/** Tutor profile — `GET /profile`, `PUT /profile` (upsert). */
export interface Profile {
  timeZoneId: string;
  createdAtUtc: string;
}

export interface UpdateProfileRequest {
  timeZoneId: string;
}

/** Lifecycle status of a lesson. */
export type LessonStatus = 'Scheduled' | 'Completed' | 'Cancelled';

/** Lesson projection — `GET /lessons`. `seriesId`/`occurrenceDate` are set for series lessons. */
export interface Lesson {
  id: string;
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
  createdAtUtc: string;
}

/** Body for `POST /lessons` (one-off). `price` omitted falls back to the student's rate. */
export interface CreateLessonRequest {
  studentId: string;
  startUtc: string;
  durationMinutes: number;
  price?: number;
  topic?: string;
}

/** Body for `PATCH /lessons/{id}` — only provided fields are applied. */
export interface UpdateLessonRequest {
  startUtc?: string;
  durationMinutes?: number;
  status?: LessonStatus;
  price?: number;
  isPaid?: boolean;
  topic?: string;
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
  isActive: boolean;
  createdAtUtc: string;
}

/** Body for `POST /lessons/series`. Times are the tutor's local wall clock. */
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
 * Body for `PATCH /lessons/series/{id}` — only provided fields are applied;
 * days/time cannot change (cancel + recreate instead). Shrinking `endDate`
 * cancels already-generated Scheduled lessons beyond the new boundary.
 */
export interface UpdateLessonSeriesRequest {
  title?: string;
  endDate?: string;
  price?: number;
}

/** `POST /lessons/series/{id}/cancel` result. */
export interface CancelSeriesResponse {
  cancelledCount: number;
}
