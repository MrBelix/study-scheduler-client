// Query-key factories — shared so features can invalidate each other's caches
// without importing one another.

/**
 * Everything nests under `all`, so a single invalidation after any mutation
 * refreshes ranges, details and series alike.
 */
export const lessonKeys = {
  all: ['lessons'] as const,
  /** `studentId` narrows the range to one student's schedule — a separate cache entry from the unscoped range. */
  range: (fromIso: string, toIso: string, studentId?: string) =>
    studentId
      ? (['lessons', 'range', fromIso, toIso, studentId] as const)
      : (['lessons', 'range', fromIso, toIso] as const),
  detail: (id: string) => ['lessons', 'detail', id] as const,
  seriesList: ['lessons', 'series'] as const,
  series: (id: string) => ['lessons', 'series', id] as const,
};

/**
 * `all` is the scope root — invalidating it refreshes the active list, the
 * archived list and every detail alike. `active`/`archived` are separate
 * queries (the backend splits them by status; there's no combined list).
 */
export const studentKeys = {
  all: ['students'] as const,
  active: ['students', 'active'] as const,
  archived: ['students', 'archived'] as const,
  detail: (id: string) => ['students', 'detail', id] as const,
  debts: (id: string) => ['students', 'debts', id] as const,
};

export const profileKeys = {
  all: ['profile'] as const,
  timezones: ['profile', 'timezones'] as const,
};

export const reportKeys = {
  all: ['reports'] as const,
  dashboard: (period: string, anchor: string) => ['reports', 'dashboard', period, anchor] as const,
};
