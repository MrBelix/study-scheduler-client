import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateStudentRequest, UpdateStudentRequest } from '@/shared/api';
import { lessonKeys, reportKeys, studentKeys } from '@/shared/api';
import { getStudents, getArchivedStudents, getStudentDetails, getStudentDebts, createStudent, updateStudent } from './api';

/** Active students — `GET /students`. */
export function useStudents() {
  return useQuery({
    queryKey: studentKeys.active,
    queryFn: ({ signal }) => getStudents(signal),
  });
}

/** Archived students — `GET /students/archived`. */
export function useArchivedStudents() {
  return useQuery({
    queryKey: studentKeys.archived,
    queryFn: ({ signal }) => getArchivedStudents(signal),
  });
}

/** Full detail projection for the student page — its own endpoint/query, not derived from the list cache. */
export function useStudentDetails(id: string | undefined) {
  return useQuery({
    queryKey: studentKeys.detail(id ?? ''),
    queryFn: ({ signal }) => getStudentDetails(id!, signal),
    enabled: Boolean(id),
  });
}

/** The student's unpaid ledger, for the bulk-settle page — its own endpoint, not derived from `StudentDetails.debt`. */
export function useStudentDebts(id: string | undefined) {
  return useQuery({
    queryKey: studentKeys.debts(id ?? ''),
    queryFn: ({ signal }) => getStudentDebts(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStudentRequest) => createStudent(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studentKeys.all }),
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateStudentRequest }) => updateStudent(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      // Archiving auto-ends the student's series on the server — refresh lessons too.
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      // ...and the dashboard, which aggregates those same lessons/series.
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}
