import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateStudentRequest } from '@/shared/api';
import { getStudents, createStudent } from './api';

/** Query-key factory — the single source for cache keys in this feature. */
export const studentKeys = {
  all: ['students'] as const,
};

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
