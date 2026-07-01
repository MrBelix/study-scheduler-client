import { apiRequest } from '@/shared/api';
import type { Student, CreateStudentRequest } from '@/shared/api';

/** `GET /students` — students owned by the current Telegram user. */
export const getStudents = (signal?: AbortSignal) =>
  apiRequest<Student[]>('/students', { signal });

/** `POST /students` — create a student under the current user. */
export const createStudent = (body: CreateStudentRequest) =>
  apiRequest<Student>('/students', { method: 'POST', body: JSON.stringify(body) });
