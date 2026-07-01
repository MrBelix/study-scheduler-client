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
  status: StudentStatus;
  createdAtUtc: string;
}

/** Body for `POST /students`. `rate` omitted defaults to 0 on the server. */
export interface CreateStudentRequest {
  name: string;
  rate?: number;
  subject?: string;
  contact?: string;
}
