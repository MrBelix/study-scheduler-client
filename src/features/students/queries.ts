import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateStudentRequest, UpdateStudentRequest } from '@/shared/api';
import { lessonKeys, studentKeys } from '@/shared/api';
import { getStudents, createStudent, updateStudent } from './api';

export function useStudents() {
  return useQuery({
    queryKey: studentKeys.all,
    queryFn: ({ signal }) => getStudents(signal),
  });
}

/** A single student, selected from the shared students cache by id. */
export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: studentKeys.all,
    queryFn: ({ signal }) => getStudents(signal),
    select: (list) => list.find((s) => s.id === id),
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
    },
  });
}
