import { apiRequest } from '@/shared/api';
import type { Student, StudentDetails, CreateStudentRequest, UpdateStudentRequest, StudentDebtsResponse } from '@/shared/api';

/** `GET /students` — active students owned by the current Telegram user. */
export const getStudents = (signal?: AbortSignal) =>
  apiRequest<Student[]>('/students', { signal });

/** `GET /students/archived` — archived students owned by the current Telegram user. */
export const getArchivedStudents = (signal?: AbortSignal) =>
  apiRequest<Student[]>('/students/archived', { signal });

/** `GET /students/{id}` — full detail projection (rich next lesson, current series, totals, debt). */
export const getStudentDetails = (id: string, signal?: AbortSignal) =>
  apiRequest<StudentDetails>(`/students/${id}`, { signal });

/**
 * `GET /students/{id}/debts` — the student's unpaid ledger (newest-first). Owing nothing still
 * returns 200 with an empty list, never 404 — 404 is reserved for an unknown student id.
 */
export const getStudentDebts = (id: string, signal?: AbortSignal) =>
  apiRequest<StudentDebtsResponse>(`/students/${id}/debts`, { signal });

/** `POST /students` — create a student under the current user. */
export const createStudent = (body: CreateStudentRequest) =>
  apiRequest<Student>('/students', { method: 'POST', body: JSON.stringify(body) });

/** `PATCH /students/{id}` — partial update; only provided fields are applied. */
export const updateStudent = (id: string, body: UpdateStudentRequest) =>
  apiRequest<Student>(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
